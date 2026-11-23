import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { randomUUID, randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { createPool, one } from "../src/config/database.js";
import { createApp } from "../src/app.js";
import { readConfig } from "../src/config/env.js";
import { migrate } from "../scripts/migrate.js";
import { hashPassword } from "../src/utils/password.js";
import { runDeletionJobs } from "../src/jobs/deletion.job.js";
import { runRetention } from "../src/jobs/retention.job.js";
const url = process.env.TEST_DATABASE_URL;
process.env.DELETION_LEDGER_PATH = resolve(
  "../.local/test-deletion-ledger.ndjson",
);
if (
  !url ||
  !new URL(url).pathname.endsWith("_test") ||
  url === process.env.DATABASE_URL
)
  throw new Error(
    "Tests memerlukan TEST_DATABASE_URL terpisah berakhiran _test.",
  );
const pool = createPool(url),
  secret = randomBytes(24).toString("hex"),
  password = `Uji-fiktif-${randomBytes(16).toString("hex")}`;
const app = createApp({
  pool,
  config: readConfig({
    DATABASE_URL: url,
    NODE_ENV: "test",
    SESSION_SECRET: secret,
    DEMO_MODE: "true",
  }),
});
let school, otherSchool, admin, bk, otherBk, otherLocalBk;
const agent = () => request.agent(app);
async function csrf(a) {
  return (await a.get("/api/v1/auth/me")).body.csrf;
}
async function post(a, path, body, method = "post") {
  const token = await csrf(a);
  return a[method](`/api/v1${path}`).set("x-csrf-token", token).send(body);
}
async function login(username) {
  const a = agent();
  assert.equal(
    (await post(a, "/auth/login", { username, password })).status,
    200,
  );
  return a;
}
async function register(name, ageBand = "adult", extra = {}) {
  const a = agent();
  const r = await post(a, "/auth/register", {
    username: name,
    password,
    nickname: `Fiktif ${name}`,
    grade: "XI",
    semester: 1,
    schoolCode: school,
    ageBand,
    consent: true,
    noticeVersion: "2026-11-v1",
    ...extra,
  });
  return { a, r };
}
async function approve(id) {
  return post(admin, `/admin/registrations/${id}/decision`, {
    decision: "approved",
    version: 1,
  });
}
before(async () => {
  await migrate(pool);
  await pool.query(
    "TRUNCATE schools,users,cohorts,consents,student_profiles,registration_reviews,sessions,audit_logs,student_documents,progress_states,journals,content_items,content_revisions,consultations,shared_snapshots,deletion_jobs,rate_limit_buckets,worker_health RESTART IDENTITY CASCADE",
  );
  school = (
    await one(
      pool,
      "INSERT INTO schools(name,public_registration) VALUES('Sekolah Fiktif A',true) RETURNING id",
    )
  ).id;
  otherSchool = (
    await one(
      pool,
      "INSERT INTO schools(name,public_registration) VALUES('Sekolah Fiktif B',true) RETURNING id",
    )
  ).id;
  const hash = await hashPassword(password);
  for (const [username, role, schoolId] of [
    ["test.admin", "superadmin", school],
    ["test.bk", "bk", school],
    ["other.bk", "bk", otherSchool],
    ["other.local.bk", "bk", school],
  ])
    await pool.query(
      "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,$2,$3,$2,$4,'approved')",
      [schoolId, username, hash, role],
    );
  admin = await login("test.admin");
  bk = await login("test.bk");
  otherBk = await login("other.bk");
  otherLocalBk = await login("other.local.bk");
});
after(async () => pool.end());
test("preview version changes, comparison validation, cohort retention and deletion retry", async () => {
  const { a, r } = await register("extra.student");
  const id = r.body.user.id;
  await approve(id);
  await post(a, "/student/documents/plan", { version: 0, data: plan }, "put");
  const teacherId = (
    await one(pool, "SELECT id FROM users WHERE username='test.bk'")
  ).id;
  const preview = await post(a, "/student/consultations/preview", {
    teacherId,
    sections: ["plan"],
  });
  assert.equal(preview.status, 200);
  await post(
    a,
    "/student/documents/plan",
    { version: 1, data: { ...plan, backupGoal: "Perubahan fiktif" } },
    "put",
  );
  const sent = await post(a, "/student/consultations", {
    teacherId,
    topic: "Rencana langkah",
    availability: "Senin fiktif",
    note: "",
    sections: ["plan"],
    versions: { plan: 1 },
    idempotencyKey: randomUUID(),
  });
  assert.equal(sent.status, 409);
  const option = {
    id: randomUUID(),
    label: "Opsi fiktif",
    values: {
      interest: 6,
      ability: null,
      cost: null,
      support: null,
      opportunity: null,
    },
    reason: "",
  };
  assert.equal(
    (
      await post(
        a,
        "/student/documents/comparison",
        {
          version: 0,
          data: {
            options: [option, { ...option, id: randomUUID() }],
            reviewed: false,
          },
        },
        "put",
      )
    ).status,
    422,
  );
  const cohort = await post(admin, "/admin/cohorts", {
    label: "Angkatan Uji Fiktif",
    graduationAt: "2026-01-01",
    deletionAt: "2026-02-01T00:00:00Z",
  });
  assert.equal(cohort.status, 201);
  assert.equal(
    (
      await post(admin, `/admin/registrations/${id}/cohort`, {
        cohortId: cohort.body.cohort.id,
      })
    ).status,
    200,
  );
  const record = (await a.get("/api/v1/account/retention")).body;
  assert.ok(record.scheduledDeletionAt);
  const original = process.env.DELETION_LEDGER_PATH;
  try {
    process.env.DELETION_LEDGER_PATH = resolve("../.local");
    const failed = await runRetention(pool, {
      RETENTION_ENABLED: "true",
      PENDING_RETENTION_DAYS: 30,
    });
    assert.ok(failed.failed >= 1);
    const job = await one(
      pool,
      "SELECT * FROM deletion_jobs WHERE target_id=$1",
      [id],
    );
    assert.equal(job.status, "failed");
    assert.ok(job.retry_count >= 1);
    assert.equal((await a.get("/api/v1/student/home")).status, 401);
  } finally {
    process.env.DELETION_LEDGER_PATH = original;
  }
  const retried = await runDeletionJobs(pool);
  assert.ok(retried.completed >= 1);
  assert.equal(retried.failed, 0);
  assert.equal(
    await one(pool, "SELECT id FROM users WHERE id=$1", [id]),
    undefined,
  );
});
test("CSRF, role injection, account constraints, login role destinations", async () => {
  const rotating = agent(),
    anonymous = await rotating.get("/api/v1/auth/me");
  const signedIn = await rotating
    .post("/api/v1/auth/login")
    .set("x-csrf-token", anonymous.body.csrf)
    .send({ username: "test.admin", password });
  assert.equal(signedIn.status, 200);
  assert.notEqual(
    anonymous.headers["set-cookie"][0].split(";")[0],
    signedIn.headers["set-cookie"][0].split(";")[0],
  );
  assert.match(signedIn.headers["set-cookie"][0], /HttpOnly/);
  assert.match(signedIn.headers["set-cookie"][0], /SameSite=Lax/);
  assert.equal(
    (
      await rotating
        .post("/api/v1/auth/logout")
        .set("x-csrf-token", signedIn.body.csrf)
        .set("origin", "https://origin-tidak-diizinkan.example")
    ).status,
    403,
  );
  assert.equal(
    (await agent().post("/api/v1/auth/register").send({})).status,
    403,
  );
  for (const extra of [
    { role: "superadmin" },
    { status: "approved" },
    { approved_by: randomUUID() },
    { school_id: otherSchool },
  ])
    assert.equal((await register("invalid", "adult", extra)).r.status, 422);
  assert.equal(
    (
      await post(admin, "/auth/login", {
        username: "test.admin",
        password,
        role: "bk",
      })
    ).status,
    422,
  );
  assert.equal(
    (await admin.get("/api/v1/auth/me")).body.user.destination,
    "/superadmin/pendaftaran",
  );
  assert.equal(
    (await bk.get("/api/v1/auth/me")).body.user.destination,
    "/bk/permintaan",
  );
});
test("login portals accept their own roles and reject a mismatched portal without creating an authenticated session", async () => {
  const registered = await register("portal.student");
  assert.equal(registered.r.status, 201);
  for (const [username, role, correct, incorrect] of [
    ["test.admin", "superadmin", "staf", "siswa"],
    ["test.bk", "bk", "staf", "siswa"],
    ["portal.student", "siswa", "siswa", "staf"],
  ]) {
    const client = agent();
    const mismatch = await post(client, "/auth/login", {
      username,
      password,
      audience: incorrect,
    });
    assert.equal(mismatch.status, 403);
    assert.equal(mismatch.body.error.code, "LOGIN_PORTAL_MISMATCH");
    assert.equal((await client.get("/api/v1/auth/me")).body.user, null);
    assert.equal((await client.get("/api/v1/student/home")).status, 401);
    const login = await post(client, "/auth/login", {
      username,
      password,
      audience: correct,
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.role, role);
    await post(client, "/auth/logout", {});
  }
  const invalid = await post(agent(), "/auth/login", {
    username: "test.admin",
    password: "invalid-password-for-test",
    audience: "siswa",
  });
  assert.equal(invalid.status, 401);
  assert.equal(invalid.body.error.code, "INVALID_CREDENTIALS");
});

test("sensitive endpoint rate limit is enforced with a useful response", async () => {
  await pool.query("DELETE FROM rate_limit_buckets");
  const limited = createApp({
      pool,
      config: readConfig({
        DATABASE_URL: url,
        NODE_ENV: "development",
        SESSION_SECRET: secret,
        DEMO_MODE: "true",
      }),
    }),
    a = request.agent(limited),
    token = (await a.get("/api/v1/auth/me")).body.csrf;
  for (let i = 0; i < 30; i++)
    assert.equal(
      (await a.post("/api/v1/auth/login").set("x-csrf-token", token).send({}))
        .status,
      422,
    );
  const blocked = await a
    .post("/api/v1/auth/login")
    .set("x-csrf-token", token)
    .send({});
  assert.equal(blocked.status, 429);
  assert.equal(blocked.body.error.code, "RATE_LIMIT");
  const restarted = createApp({
    pool,
    config: readConfig({
      DATABASE_URL: url,
      NODE_ENV: "development",
      SESSION_SECRET: secret,
      DEMO_MODE: "true",
    }),
  });
  const b = request.agent(restarted),
    nextToken = await csrf(b);
  assert.equal(
    (await b.post("/api/v1/auth/login").set("x-csrf-token", nextToken).send({}))
      .status,
    429,
  );
  await pool.query("DELETE FROM rate_limit_buckets");
});
test("milestone: registration pending -> approval -> consent gate -> private access; rejection", async () => {
  const { a, r } = await register("new.student", "under18");
  assert.equal(r.status, 201);
  const id = r.body.user.id;
  assert.equal(r.body.user.role, "siswa");
  assert.equal(r.body.user.status, "pending_approval");
  assert.equal((await a.get("/api/v1/student/home")).status, 403);
  const stored = await one(
    pool,
    "SELECT password_hash,recovery_hash FROM users WHERE id=$1",
    [id],
  );
  assert.match(stored.password_hash, /^\$argon2id\$/);
  assert.notEqual(stored.recovery_hash, r.body.recoveryCode);
  assert.ok(
    (await admin.get("/api/v1/admin/registrations")).body.items.some(
      (x) => x.id === id,
    ),
  );
  assert.equal((await approve(id)).status, 200);
  assert.equal(
    (await a.get("/api/v1/auth/me")).body.user.guardianStatus,
    "pending",
  );
  assert.equal((await a.get("/api/v1/student/home")).status, 403);
  assert.equal(
    (
      await post(admin, `/admin/registrations/${id}/guardian`, {
        reference: "FIKTIF-001",
      })
    ).status,
    200,
  );
  assert.equal(
    (await a.get("/api/v1/auth/me")).body.user.destination,
    "/beranda",
  );
  assert.equal((await a.get("/api/v1/student/home")).status, 200);
  assert.equal(
    (
      await post(bk, `/admin/registrations/${id}/decision`, {
        decision: "approved",
        version: 1,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await post(a, `/admin/registrations/${id}/decision`, {
        decision: "approved",
        version: 1,
      })
    ).status,
    403,
  );
  const rejected = await register("rejected.student");
  assert.equal(
    (
      await post(
        admin,
        `/admin/registrations/${rejected.r.body.user.id}/decision`,
        {
          decision: "rejected",
          version: 1,
          reason: "Perlu memeriksa sekolah yang dipilih.",
        },
      )
    ).status,
    200,
  );
  const state = (await rejected.a.get("/api/v1/auth/me")).body.user;
  assert.equal(state.status, "rejected");
  assert.match(state.reason, /sekolah/);
  assert.equal((await rejected.a.get("/api/v1/student/home")).status, 403);
});
test("simultaneous approval/rejection, retry, history and audit remain consistent", async () => {
  const { r } = await register("race.student"),
    id = r.body.user.id;
  const admin2 = await login("test.admin");
  const results = await Promise.all([
    post(admin, `/admin/registrations/${id}/decision`, {
      decision: "approved",
      version: 1,
    }),
    post(admin2, `/admin/registrations/${id}/decision`, {
      decision: "rejected",
      reason: "Pendaftaran perlu diperiksa ulang.",
      version: 1,
    }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
  assert.equal(
    Number(
      (
        await one(
          pool,
          "SELECT count(*) n FROM registration_reviews WHERE student_id=$1",
          [id],
        )
      ).n,
    ),
    1,
  );
  assert.equal(
    Number(
      (
        await one(
          pool,
          "SELECT count(*) n FROM audit_logs WHERE target_id=$1 AND event IN ('registration_approved','registration_rejected')",
          [id],
        )
      ).n,
    ),
    1,
  );
  assert.equal((await approve(id)).status, 409);
});
test("suspension, reactivation, cross school admin, BK creation and session invalidation", async () => {
  const { a, r } = await register("suspend.student");
  const id = r.body.user.id;
  await approve(id);
  assert.equal(
    (
      await post(admin, `/admin/accounts/${id}/status`, {
        status: "suspended",
        version: 2,
      })
    ).status,
    200,
  );
  assert.equal((await a.get("/api/v1/student/home")).status, 401);
  const blocked = await login("suspend.student");
  assert.equal((await blocked.get("/api/v1/student/home")).status, 403);
  assert.equal(
    (
      await post(admin, `/admin/accounts/${id}/status`, {
        status: "approved",
        version: 3,
      })
    ).status,
    200,
  );
  const active = await login("suspend.student");
  assert.equal((await active.get("/api/v1/student/home")).status, 200);
  const p = await register("pending.suspend");
  assert.equal(
    (
      await post(admin, `/admin/accounts/${p.r.body.user.id}/status`, {
        status: "approved",
        version: 1,
      })
    ).status,
    409,
  );
  const outside = await register("outside.student", "adult", {
    schoolCode: otherSchool,
  });
  assert.equal(
    (await admin.get(`/api/v1/admin/registrations/${outside.r.body.user.id}`))
      .status,
    404,
  );
  const created = await post(admin, "/admin/bk", {
    username: "new.bk",
    password,
    nickname: "Guru Fiktif Baru",
  });
  assert.equal(created.status, 201);
  assert.equal((await login("new.bk")).get !== undefined, true);
});
const blankAnswer = () => ({ selected: [], note: "" });
const reflection = {
  answers: Array.from({ length: 5 }, blankAnswer),
  lastStep: 5,
  summary: "Aku senang mencoba menggambar.",
  reviewed: true,
};
const plan = {
  primaryGoal: "Belajar desain",
  backupGoal: "Pelatihan",
  steps: [1, 2, 3].map((i) => ({
    id: randomUUID(),
    semester: "XI-1",
    title: `Langkah fiktif ${i}`,
    note: "",
    dueDate: "",
    done: i === 1,
  })),
  reviewed: true,
};
let studentA, studentB, studentId, journalId, consultationId;
test("documents persist, version conflict, plan and journal ownership", async () => {
  const first = await register("private.a"),
    second = await register("private.b");
  studentA = first.a;
  studentB = second.a;
  studentId = first.r.body.user.id;
  await approve(studentId);
  await approve(second.r.body.user.id);
  for (const [kind, data] of [
    ["reflection", reflection],
    ["plan", plan],
  ]) {
    assert.equal(
      (
        await post(
          studentA,
          `/student/documents/${kind}`,
          { version: 0, data },
          "put",
        )
      ).status,
      200,
    );
    assert.deepEqual(
      (await studentA.get(`/api/v1/student/documents/${kind}`)).body.document
        .data,
      data,
    );
    assert.equal(
      (
        await post(
          studentA,
          `/student/documents/${kind}`,
          { version: 0, data },
          "put",
        )
      ).status,
      409,
    );
  }
  const journal = await post(studentA, "/student/journals", {
    entryDate: "2026-11-22",
    answers: ["Isi sangat privat.", "", ""],
  });
  assert.equal(journal.status, 201);
  journalId = journal.body.entry.id;
  assert.equal(
    (await studentB.get(`/api/v1/student/journals/${journalId}`)).status,
    404,
  );
  assert.equal(
    (await admin.get(`/api/v1/student/journals/${journalId}`)).status,
    403,
  );
  assert.equal(
    (await bk.get(`/api/v1/student/journals/${journalId}`)).status,
    403,
  );
  assert.equal(
    (await studentB.get("/api/v1/student/documents/plan")).body.document.data,
    null,
  );
  assert.equal(
    (await admin.get("/api/v1/student/documents/reflection")).status,
    403,
  );
  assert.match(
    (await studentA.get(`/api/v1/student/journals/${journalId}`)).headers[
      "cache-control"
    ],
    /no-store/,
  );
});
test("consultations: no attachment, plan-only sharing, idempotency, scope, revoke and renew", async () => {
  const teacherId = (
    await one(pool, "SELECT id FROM users WHERE username='test.bk'")
  ).id;
  const input = {
    teacherId,
    topic: "Rencana langkah",
    availability: "Senin setelah kelas",
    note: "Catatan fiktif",
    sections: [],
    idempotencyKey: randomUUID(),
  };
  const none = await post(studentA, "/student/consultations", input);
  assert.equal(none.status, 201);
  assert.deepEqual(
    (await bk.get(`/api/v1/bk/consultations/${none.body.id}`)).body.snapshots,
    [],
  );
  input.sections = ["plan"];
  input.versions = { plan: 1 };
  input.idempotencyKey = randomUUID();
  const responses = await Promise.all([
    post(studentA, "/student/consultations", input),
    post(studentA, "/student/consultations", input),
  ]);
  assert.deepEqual(responses.map((r) => r.status).sort(), [200, 201]);
  consultationId = responses[0].body.id;
  const detail = await bk.get(`/api/v1/bk/consultations/${consultationId}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.snapshots.length, 1);
  assert.equal(detail.body.snapshots[0].section, "plan");
  assert.deepEqual(detail.body.snapshots[0].data, {
    primaryGoal: plan.primaryGoal,
    backupGoal: plan.backupGoal,
    steps: plan.steps,
  });
  assert.equal(
    (await otherBk.get(`/api/v1/bk/consultations/${consultationId}`)).status,
    404,
  );
  assert.equal(
    (await otherLocalBk.get(`/api/v1/bk/consultations/${consultationId}`))
      .status,
    404,
  );
  assert.equal(
    (await studentB.get(`/api/v1/student/consultations/${consultationId}`))
      .status,
    404,
  );
  assert.equal(
    (await admin.get(`/api/v1/bk/consultations/${consultationId}`)).status,
    403,
  );
  assert.equal(
    (
      await post(studentA, "/student/consultations", {
        ...input,
        sections: ["journal"],
        idempotencyKey: randomUUID(),
      })
    ).status,
    422,
  );
  const update = { ...plan, primaryGoal: "Tujuan berubah" };
  await post(
    studentA,
    "/student/documents/plan",
    { version: 1, data: update },
    "put",
  );
  assert.equal(
    (await bk.get(`/api/v1/bk/consultations/${consultationId}`)).body
      .snapshots[0].data.primaryGoal,
    plan.primaryGoal,
  );
  assert.equal(
    (
      await post(studentA, `/student/consultations/${consultationId}/revoke`, {
        sections: ["plan"],
      })
    ).status,
    200,
  );
  assert.equal(
    (await bk.get(`/api/v1/bk/consultations/${consultationId}`)).body
      .snapshots[0].data,
    null,
  );
  assert.equal(
    (
      await post(
        studentA,
        `/student/consultations/${consultationId}/refresh-sharing`,
        { sections: ["plan"], versions: { plan: 2 } },
      )
    ).status,
    200,
  );
  assert.equal(
    (await bk.get(`/api/v1/bk/consultations/${consultationId}`)).body
      .snapshots[0].data.primaryGoal,
    "Tujuan berubah",
  );
  await pool.query(
    "UPDATE shared_snapshots SET expires_at=now()-interval '1 second' WHERE request_id=$1",
    [consultationId],
  );
  assert.equal(
    (await bk.get(`/api/v1/bk/consultations/${consultationId}`)).body
      .snapshots[0].data,
    null,
  );
});
test("consultation transitions, export explicit journal, delete feature removes snapshots", async () => {
  assert.equal(
    (
      await post(
        bk,
        `/bk/consultations/${consultationId}`,
        { status: "completed", version: 1 },
        "patch",
      )
    ).status,
    422,
  );
  assert.equal(
    (
      await post(
        bk,
        `/bk/consultations/${consultationId}`,
        {
          status: "scheduled",
          version: 1,
          confirmedTime: "2026-12-01T10:00:00+07:00",
          location: "Ruang BK fiktif",
        },
        "patch",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await post(
        bk,
        `/bk/consultations/${consultationId}`,
        { status: "completed", version: 2 },
        "patch",
      )
    ).status,
    200,
  );
  const exported = await post(studentA, "/student/export", {
    password,
    sections: ["plan", "reflection"],
  });
  assert.equal(exported.status, 200);
  assert.equal(exported.body.journal, undefined);
  const withJournal = await post(studentA, "/student/export", {
    password,
    sections: ["journal"],
  });
  assert.equal(withJournal.body.journal.length, 1);
  assert.equal(
    (
      await post(studentA, "/student/export", {
        password: "wrong",
        sections: ["journal"],
      })
    ).status,
    401,
  );
  assert.equal(
    (await post(studentA, "/student/data/plan", { password }, "delete")).status,
    200,
  );
  assert.equal(
    (
      await one(
        pool,
        "SELECT content_copy FROM shared_snapshots WHERE request_id=$1",
        [consultationId],
      )
    ).content_copy,
    null,
  );
});
test("aggregates hide complementary values and allow safe fictional partitions", async () => {
  let result = (await bk.get("/api/v1/bk/aggregates")).body;
  assert.equal(result.suppressed, true);
  assert.equal(result.total, null);
  assert.equal(result.stages, null);
  assert.equal((await bk.get("/api/v1/bk/aggregates?studentId=x")).status, 422);
  await pool.query(
    "UPDATE progress_states SET reflection=false,exploration=false,comparison=false,plan=false",
  );
  const ids = (
    await pool.query(
      "SELECT u.id FROM users u JOIN consents c ON c.user_id=u.id WHERE u.school_id=$1 AND u.status='approved' AND u.role='siswa' AND c.guardian_status IN ('verified','not_required')",
      [school],
    )
  ).rows;
  // Bagi semua akun aktif dan tambah hingga masing-masing dari lima sel setidaknya enam.
  const hash = await hashPassword(password);
  for (let stage = 0; stage < 5; stage++)
    for (let i = 0; i < 6; i++) {
      const id = randomUUID();
      await pool.query(
        "INSERT INTO users(id,school_id,username,password_hash,nickname,role,status) VALUES($1,$2,$3,$4,'Agregat Fiktif','siswa','approved')",
        [id, school, `aggregate.${stage}.${i}`, hash],
      );
      await pool.query(
        "INSERT INTO student_profiles(user_id,grade,semester,age_band) VALUES($1,'XI',1,'adult')",
        [id],
      );
      await pool.query(
        "INSERT INTO consents(user_id,notice_version,student_agreed_at,guardian_status) VALUES($1,'2026-11-v1',now(),'not_required')",
        [id],
      );
      await pool.query(
        "INSERT INTO progress_states(user_id,reflection,exploration,comparison,plan) VALUES($1,$2,$3,$4,$5)",
        [id, stage >= 1, stage >= 2, stage >= 3, stage >= 4],
      );
    }
  result = (await bk.get("/api/v1/bk/aggregates")).body;
  assert.equal(result.suppressed, false);
  assert.equal(result.total, 30 + ids.length);
  assert.ok(result.stages.every((x) => x >= 6));
  assert.equal(JSON.stringify(result).includes("username"), false);
});
test("public drafts hidden, content validation, versioning, archives and source safety", async () => {
  const body = {
    title: "Konten Fiktif",
    slug: "konten-uji",
    kind: "pathway",
    category: "Kerja",
    riasec: null,
    summary: "Materi fiktif untuk pengujian.",
    body: "Isi yang tidak memuat data siswa.",
    status: "draft",
    sources: [],
    reviewer: null,
    reviewedAt: null,
    validUntil: null,
    demo: true,
  };
  const created = await post(bk, "/bk/content", body);
  assert.equal(created.status, 201);
  const id = created.body.item.id;
  assert.equal(
    (await agent().get("/api/v1/public/content/konten-uji")).status,
    404,
  );
  assert.equal(
    (
      await post(
        bk,
        `/bk/content/${id}`,
        { ...body, status: "published", version: 1 },
        "put",
      )
    ).status,
    422,
  );
  assert.equal(
    (
      await post(
        bk,
        `/bk/content/${id}`,
        {
          ...body,
          sources: [{ title: "Invalid", url: "javascript:alert(1)" }],
          version: 1,
        },
        "put",
      )
    ).status,
    422,
  );
  const published = {
    ...body,
    status: "published",
    sources: [{ title: "Sumber resmi", url: "https://snpmb.id/" }],
    reviewer: "Peninjau Fiktif",
    reviewedAt: "2026-11-22",
    validUntil: "2027-01-01",
  };
  assert.equal(
    (await post(bk, `/bk/content/${id}`, { ...published, version: 1 }, "put"))
      .status,
    200,
  );
  assert.equal(
    (await agent().get("/api/v1/public/content/konten-uji")).status,
    200,
  );
  assert.equal(
    (
      await post(
        otherBk,
        `/bk/content/${id}`,
        { ...published, version: 2 },
        "put",
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await post(
        bk,
        `/bk/content/${id}`,
        { ...published, status: "archived", version: 2 },
        "put",
      )
    ).status,
    200,
  );
  assert.equal(
    (await agent().get("/api/v1/public/content/konten-uji")).status,
    404,
  );
});
test("recovery one use, logout, cancellation, purge all personal records, retention and retry", async () => {
  const { a, r } = await register("recover.student"),
    code = r.body.recoveryCode;
  await approve(r.body.user.id);
  const reset = await post(agent(), "/auth/recover", {
    username: "recover.student",
    code,
    password,
  });
  assert.equal(reset.status, 200);
  assert.notEqual(reset.body.recoveryCode, code);
  assert.equal((await a.get("/api/v1/student/home")).status, 401);
  assert.equal(
    (
      await post(agent(), "/auth/recover", {
        username: "recover.student",
        code,
        password,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await post(studentA, "/account/delete", {
        password,
        confirmation: "HAPUS AKUN",
      })
    ).status,
    202,
  );
  assert.equal((await studentA.get("/api/v1/student/home")).status, 401);
  assert.equal((await login("private.b")).get !== undefined, true);
  const result = await runDeletionJobs(pool);
  assert.equal(result.failed, 0);
  for (const [table, column] of [
    ["users", "id"],
    ["student_profiles", "user_id"],
    ["consents", "user_id"],
    ["student_documents", "user_id"],
    ["journals", "user_id"],
    ["consultations", "student_id"],
    ["progress_states", "user_id"],
  ])
    assert.equal(
      Number(
        (
          await one(
            pool,
            `SELECT count(*) n FROM ${table} WHERE ${column}=$1`,
            [studentId],
          )
        ).n,
      ),
      0,
    );
  const cancelled = await register("cancel.student");
  assert.equal(
    (
      await post(cancelled.a, "/account/delete", {
        password,
        confirmation: "HAPUS AKUN",
      })
    ).status,
    202,
  );
  await runDeletionJobs(pool);
  const old = await register("old.student");
  await pool.query(
    "UPDATE users SET updated_at=now()-interval '40 days' WHERE id=$1",
    [old.r.body.user.id],
  );
  const retention = await runRetention(pool, {
    RETENTION_ENABLED: "true",
    PENDING_RETENTION_DAYS: 30,
  });
  assert.ok(retention.queued >= 1);
  assert.equal(
    await one(pool, "SELECT id FROM users WHERE id=$1", [old.r.body.user.id]),
    undefined,
  );
  await post(studentB, "/auth/logout", {});
  assert.equal((await studentB.get("/api/v1/student/home")).status, 401);
});

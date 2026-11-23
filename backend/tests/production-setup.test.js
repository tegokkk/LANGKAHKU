import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createPool, one } from "../src/config/database.js";
import { migrate } from "../scripts/migrate.js";
import { prepareProduction } from "../src/utils/production-setup.js";
import { hashPassword } from "../src/utils/password.js";
import { readConfig } from "../src/config/env.js";
import { createApp } from "../src/app.js";
import request from "supertest";

test("production setup removes demo relations, preserves real data, authenticates admin and never resets a repeat setup", async () => {
  const url = new URL(process.env.TEST_DATABASE_URL);
  if (
    !url.pathname.endsWith("_test") ||
    url.toString() === process.env.DATABASE_URL
  )
    throw new Error("Database test terpisah wajib.");
  const base = new URL(url);
  base.pathname = "/postgres";
  const admin = createPool(base.toString());
  const name = `langkahku_setup_${randomBytes(5).toString("hex")}_test`;
  url.pathname = `/${name}`;
  let pool;
  try {
    await admin.query(`CREATE DATABASE ${name}`);
    pool = createPool(url.toString());
    await migrate(pool);
    const demo = await one(
      pool,
      "INSERT INTO schools(name) VALUES('SMA Ruang Tumbuh (Demo)') RETURNING id",
    );
    const real = await one(
      pool,
      "INSERT INTO schools(name) VALUES('Sekolah Operasional') RETURNING id",
    );
    const hash = await hashPassword(randomBytes(24).toString("hex"));
    const teacher = await one(
      pool,
      "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,'bk.demo',$2,'Guru Demo','bk','approved') RETURNING id",
      [demo.id, hash],
    );
    const student = await one(
      pool,
      "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,'uji.ui.123',$2,'Uji UI','siswa','approved') RETURNING id",
      [demo.id, hash],
    );
    await pool.query(
      "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,'siswa.aktif',$2,'Siswa Aktif','siswa','approved')",
      [real.id, hash],
    );
    await pool.query(
      "INSERT INTO student_documents(user_id,kind) VALUES($1,'plan')",
      [student.id],
    );
    await pool.query("INSERT INTO journals(user_id,answers) VALUES($1,'{}')", [
      student.id,
    ]);
    await pool.query(
      "INSERT INTO sessions(sid,sess,expire) VALUES('demo',$1,now()+interval '1 day')",
      [JSON.stringify({ userId: student.id })],
    );
    const consultation = await one(
      pool,
      "INSERT INTO consultations(student_id,teacher_id,school_id,topic,availability,idempotency_key,request_hash) VALUES($1,$2,$3,'Pilihan jalur','Uji',gen_random_uuid(),'hash') RETURNING id",
      [student.id, teacher.id, demo.id],
    );
    await pool.query(
      "INSERT INTO shared_snapshots(request_id,section,source_version) VALUES($1,'plan',1)",
      [consultation.id],
    );
    await pool.query(
      "INSERT INTO deletion_jobs(target_id,school_id) VALUES($1,$2)",
      [student.id, demo.id],
    );
    await pool.query(
      "INSERT INTO content_items(school_id,slug,title,kind,category,summary,body,demo) VALUES($1,'uji','Uji','pathway','Kuliah','','',true),($2,'aktual','Aktual','pathway','Kuliah','','',false)",
      [demo.id, real.id],
    );

    const input = {
      schoolName: "LANGKAHKU",
      username: "SuperAdmin",
      password: randomBytes(7).toString("hex"),
    };
    const env = {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: url.toString(),
      DEMO_MODE: "false",
    };
    const run = (data) =>
      spawnSync(process.execPath, ["scripts/prepare-production.js"], {
        env,
        input: JSON.stringify(data),
        encoding: "utf8",
        windowsHide: true,
      });
    const first = run(input);
    assert.equal(first.status, 0, first.stderr);
    assert.equal(first.stdout.includes(input.password), false);
    assert.deepEqual(JSON.parse(first.stdout).removed, {
      schools: 1,
      users: 2,
      content: 1,
    });
    for (const table of [
      "student_documents",
      "journals",
      "sessions",
      "consultations",
      "shared_snapshots",
      "deletion_jobs",
    ])
      assert.equal(
        Number((await one(pool, `SELECT count(*) n FROM ${table}`)).n),
        0,
        table,
      );
    assert.equal(
      Number(
        (
          await one(
            pool,
            "SELECT count(*) n FROM content_items WHERE slug='aktual'",
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
            "SELECT count(*) n FROM users WHERE username='siswa.aktif'",
          )
        ).n,
      ),
      1,
    );
    const user = await one(
      pool,
      "SELECT * FROM users WHERE username='superadmin'",
    );
    assert.equal(user.status, "approved");
    assert.equal(user.role, "superadmin");
    assert.match(user.password_hash, /^\$argon2id\$/);
    const repeat = run(input);
    assert.equal(repeat.status, 0, repeat.stderr);
    assert.equal(JSON.parse(repeat.stdout).created, false);
    assert.equal(
      (
        await one(pool, "SELECT password_hash FROM users WHERE id=$1", [
          user.id,
        ])
      ).password_hash,
      user.password_hash,
    );
    await pool.query(
      "INSERT INTO content_items(school_id,slug,title,kind,category,summary,body,demo) VALUES($1,'jangan-hapus','Uji','pathway','Kuliah','','',true)",
      [real.id],
    );
    assert.notEqual(
      run({ ...input, password: randomBytes(14).toString("hex") }).status,
      0,
    );
    assert.equal(
      Number(
        (
          await one(
            pool,
            "SELECT count(*) n FROM content_items WHERE slug='jangan-hapus'",
          )
        ).n,
      ),
      1,
    );
    await assert.rejects(
      prepareProduction(pool, { ...input, username: "admin.kedua" }),
    );

    const app = createApp({ pool, config: readConfig({ ...env }) });
    const agent = request.agent(app);
    const csrf = (await agent.get("/api/v1/auth/me")).body.csrf;
    const login = await agent
      .post("/api/v1/auth/login")
      .set("x-csrf-token", csrf)
      .send({
        username: "SuperAdmin",
        password: input.password,
        audience: "staf",
      });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.role, "superadmin");
    assert.equal((await agent.get("/api/v1/admin/bk")).status, 200);
    assert.equal(
      (await agent.get("/api/v1/public/content")).body.items.length,
      0,
    );
  } finally {
    await pool?.end();
    await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await admin.end();
  }
});

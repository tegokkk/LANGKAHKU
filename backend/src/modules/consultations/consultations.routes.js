import { Router } from "express";
import { z } from "zod";
import { student, authorize } from "../../middleware/access.js";
import { one, transaction, audit } from "../../config/database.js";
import { fail, requireRecord } from "../../utils/errors.js";
import { digest } from "../../utils/password.js";
const sections = z
  .array(z.enum(["reflection", "comparison", "plan"]))
  .max(3)
  .refine((x) => new Set(x).size === x.length);
const versions = z
  .strictObject({
    reflection: z.number().int().positive().optional(),
    comparison: z.number().int().positive().optional(),
    plan: z.number().int().positive().optional(),
  })
  .default({});
const requestSchema = z.strictObject({
  teacherId: z.uuid(),
  topic: z.enum([
    "Kenali diri",
    "Pilihan jalur",
    "Biaya dan dukungan",
    "Rencana langkah",
    "Diskusi lainnya",
  ]),
  availability: z.string().trim().min(3).max(300),
  note: z.string().trim().max(500).default(""),
  sections,
  versions,
  idempotencyKey: z.uuid(),
});
export const summarize = (kind, data) =>
  kind === "reflection"
    ? { summary: data.summary || "" }
    : kind === "comparison"
      ? { options: data.options || [] }
      : {
          primaryGoal: data.primaryGoal || "",
          backupGoal: data.backupGoal || "",
          steps: data.steps || [],
        };
async function selectedDocuments(db, id, selected, expectedVersions) {
  const docs = [];
  for (const section of selected) {
    const doc = await one(
      db,
      `SELECT * FROM student_documents WHERE user_id=$1 AND kind=$2 ${expectedVersions ? "FOR SHARE" : ""}`,
      [id, section],
    );
    if (!doc || (section === "reflection" && !doc.data.reviewed))
      fail(422, `Simpan dan tinjau ${section} sebelum membagikannya.`);
    if (expectedVersions && expectedVersions[section] !== doc.version)
      fail(
        409,
        "Ringkasan berubah sejak pratinjau. Pratinjau ulang sebelum memberi izin.",
        "SNAPSHOT_CONFLICT",
      );
    docs.push({
      section,
      version: doc.version,
      data: summarize(section, doc.data),
    });
  }
  return docs;
}
async function ownRequest(db, user, id, lock = false) {
  return requireRecord(
    await one(
      db,
      `SELECT c.*,u.nickname,u.username,p.grade,t.nickname teacher_name FROM consultations c JOIN users u ON u.id=c.student_id JOIN student_profiles p ON p.user_id=u.id JOIN users t ON t.id=c.teacher_id WHERE c.id=$1 AND c.school_id=$2 AND u.deletion_requested_at IS NULL AND u.status='approved' AND ${user.role === "bk" ? "c.teacher_id" : "c.student_id"}=$3 ${lock ? "FOR UPDATE OF c" : ""}`,
      [id, user.school_id, user.id],
    ),
  );
}
async function snapshots(db, id) {
  return (
    await db.query(
      "SELECT id,section,source_version,consent_at,expires_at,revoked_at,CASE WHEN revoked_at IS NULL AND expires_at>now() THEN content_copy ELSE NULL END AS data,CASE WHEN revoked_at IS NOT NULL THEN 'revoked' WHEN expires_at<=now() THEN 'expired' ELSE 'active' END AS access FROM shared_snapshots WHERE request_id=$1 ORDER BY section",
      [id],
    )
  ).rows;
}
export function consultationRoutes(pool) {
  const router = Router();
  router.get("/student/teachers", student, async (req, res) =>
    res.json({
      items: (
        await pool.query(
          "SELECT id,nickname FROM users WHERE role='bk' AND status='approved' AND deletion_requested_at IS NULL AND school_id=$1 ORDER BY nickname",
          [req.user.school_id],
        )
      ).rows,
      school: await one(
        pool,
        "SELECT timezone,service_settings FROM schools WHERE id=$1",
        [req.user.school_id],
      ),
    }),
  );
  router.post("/student/consultations/preview", student, async (req, res) => {
    const { sections: selected, teacherId } = z
      .strictObject({ sections, teacherId: z.uuid() })
      .parse(req.body);
    requireRecord(
      await one(
        pool,
        "SELECT id FROM users WHERE id=$1 AND role='bk' AND status='approved' AND school_id=$2 AND deletion_requested_at IS NULL",
        [teacherId, req.user.school_id],
      ),
    );
    res.json({
      snapshots: await selectedDocuments(pool, req.user.id, selected),
      expiresInDays: 30,
    });
  });
  router.post("/student/consultations", student, async (req, res) => {
    const input = requestSchema.parse(req.body),
      hash = digest(
        JSON.stringify({
          ...input,
          idempotencyKey: undefined,
          sections: [...input.sections].sort(),
        }),
      );
    const result = await transaction(pool, async (db) => {
      await db.query("SELECT id FROM users WHERE id=$1 FOR UPDATE", [
        req.user.id,
      ]);
      const prior = await one(
        db,
        "SELECT id,request_hash FROM consultations WHERE student_id=$1 AND idempotency_key=$2",
        [req.user.id, input.idempotencyKey],
      );
      if (prior) {
        if (prior.request_hash !== hash)
          fail(409, "Kunci pengiriman sudah dipakai untuk isi lain.");
        return { id: prior.id, replayed: true };
      }
      requireRecord(
        await one(
          db,
          "SELECT id FROM users WHERE id=$1 AND role='bk' AND status='approved' AND school_id=$2 AND deletion_requested_at IS NULL",
          [input.teacherId, req.user.school_id],
        ),
      );
      const docs = await selectedDocuments(
        db,
        req.user.id,
        input.sections,
        input.versions,
      );
      const request = await one(
        db,
        "INSERT INTO consultations(student_id,teacher_id,school_id,topic,availability,note,idempotency_key,request_hash) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
        [
          req.user.id,
          input.teacherId,
          req.user.school_id,
          input.topic,
          input.availability,
          input.note,
          input.idempotencyKey,
          hash,
        ],
      );
      for (const doc of docs)
        await db.query(
          "INSERT INTO shared_snapshots(request_id,section,content_copy,source_version) VALUES($1,$2,$3,$4)",
          [request.id, doc.section, JSON.stringify(doc.data), doc.version],
        );
      await audit(db, req.user.id, "consultation_submitted", request.id);
      return { id: request.id, replayed: false };
    });
    res.status(result.replayed ? 200 : 201).json(result);
  });
  for (const prefix of ["student", "bk"]) {
    router.get(
      `/${prefix}/consultations`,
      prefix === "student" ? student : authorize("bk"),
      async (req, res) => {
        const input = z
          .object({
            status: z
              .enum([
                "all",
                "submitted",
                "scheduled",
                "reschedule",
                "completed",
                "cancelled",
                "closed",
              ])
              .default("all"),
            page: z.coerce.number().int().min(1).default(1),
            q: z.string().max(80).default(""),
          })
          .parse(req.query);
        const values = [
          req.user.id,
          req.user.school_id,
          input.status,
          `%${input.q}%`,
        ];
        const where = `WHERE c.${prefix === "student" ? "student_id" : "teacher_id"}=$1 AND c.school_id=$2 AND u.deletion_requested_at IS NULL AND u.status='approved' AND ($3='all' OR c.status=$3) AND (u.nickname ILIKE $4 OR c.topic ILIKE $4)`;
        const total = Number(
          (
            await one(
              pool,
              `SELECT count(*) n FROM consultations c JOIN users u ON u.id=c.student_id ${where}`,
              values,
            )
          ).n,
        );
        const items = (
          await pool.query(
            `SELECT c.id,c.request_number,c.topic,c.availability,c.status,c.confirmed_time,c.created_at,c.version,u.nickname,p.grade,t.nickname teacher_name FROM consultations c JOIN users u ON u.id=c.student_id JOIN student_profiles p ON p.user_id=u.id JOIN users t ON t.id=c.teacher_id ${where} ORDER BY c.created_at DESC LIMIT 20 OFFSET $5`,
            [...values, (input.page - 1) * 20],
          )
        ).rows;
        res.json({
          items,
          total,
          page: input.page,
          pages: Math.ceil(total / 20),
        });
      },
    );
    router.get(
      `/${prefix}/consultations/:id`,
      prefix === "student" ? student : authorize("bk"),
      async (req, res) => {
        const request = await ownRequest(pool, req.user, req.params.id);
        res.json({ request, snapshots: await snapshots(pool, request.id) });
      },
    );
    router.patch(
      `/${prefix}/consultations/:id`,
      prefix === "student" ? student : authorize("bk"),
      async (req, res) => {
        const input = z
          .strictObject({
            status: z.enum([
              "scheduled",
              "reschedule",
              "completed",
              "cancelled",
              "closed",
            ]),
            version: z.number().int().positive(),
            confirmedTime: z.iso.datetime({ offset: true }).optional(),
            location: z.string().trim().max(200).optional(),
            reason: z.string().trim().max(500).optional(),
          })
          .parse(req.body);
        await transaction(pool, async (db) => {
          const request = await ownRequest(db, req.user, req.params.id, true);
          if (request.version !== input.version)
            fail(409, "Permintaan berubah. Muat ulang.", "VERSION_CONFLICT");
          const transitions =
            prefix === "student"
              ? {
                  submitted: ["cancelled"],
                  scheduled: ["cancelled", "reschedule"],
                  reschedule: ["cancelled"],
                }
              : {
                  submitted: ["scheduled", "reschedule", "closed"],
                  scheduled: ["completed", "reschedule", "closed"],
                  reschedule: ["scheduled", "closed"],
                };
          if (!transitions[request.status]?.includes(input.status))
            fail(422, "Perubahan status ini tidak diperbolehkan.");
          if (
            input.status === "scheduled" &&
            (!input.confirmedTime || !input.location)
          )
            fail(422, "Waktu dan lokasi konfirmasi wajib diisi.");
          if (input.status === "closed" && !input.reason?.length)
            fail(422, "Alasan penutupan wajib diisi.");
          await db.query(
            "UPDATE consultations SET status=$2,confirmed_time=$3,location=$4,operational_reason=$5,version=version+1,updated_at=now() WHERE id=$1",
            [
              request.id,
              input.status,
              input.status === "scheduled" ? input.confirmedTime : null,
              input.status === "scheduled" ? input.location : null,
              input.reason || null,
            ],
          );
          await audit(
            db,
            req.user.id,
            `consultation_${input.status}`,
            request.id,
          );
        });
        res.json({ ok: true });
      },
    );
  }
  router.post(
    "/student/consultations/:id/revoke",
    student,
    async (req, res) => {
      const input = z.strictObject({ sections }).parse(req.body);
      await transaction(pool, async (db) => {
        await ownRequest(db, req.user, req.params.id, true);
        await db.query(
          "UPDATE shared_snapshots SET revoked_at=now(),content_copy=NULL WHERE request_id=$1 AND section=ANY($2::text[])",
          [req.params.id, input.sections],
        );
        await audit(db, req.user.id, "snapshot_revoked", req.params.id);
      });
      res.json({ ok: true });
    },
  );
  router.post(
    "/student/consultations/:id/refresh-sharing",
    student,
    async (req, res) => {
      const input = z.strictObject({ sections, versions }).parse(req.body);
      await transaction(pool, async (db) => {
        const request = await ownRequest(db, req.user, req.params.id, true);
        if (["cancelled", "closed", "completed"].includes(request.status))
          fail(422, "Permintaan sudah ditutup.");
        const docs = await selectedDocuments(
          db,
          req.user.id,
          input.sections,
          input.versions,
        );
        await db.query(
          "UPDATE shared_snapshots SET revoked_at=now(),content_copy=NULL WHERE request_id=$1",
          [request.id],
        );
        for (const doc of docs)
          await db.query(
            "INSERT INTO shared_snapshots(request_id,section,content_copy,source_version) VALUES($1,$2,$3,$4) ON CONFLICT(request_id,section) DO UPDATE SET content_copy=$3,source_version=$4,consent_at=now(),expires_at=now()+interval '30 days',revoked_at=NULL",
            [request.id, doc.section, JSON.stringify(doc.data), doc.version],
          );
        await audit(db, req.user.id, "sharing_renewed", request.id);
      });
      res.json({ ok: true });
    },
  );
  router.get("/bk/shared-history", authorize("bk"), async (req, res) => {
    const input = z
      .object({
        section: z
          .enum(["all", "reflection", "comparison", "plan"])
          .default("all"),
        access: z
          .enum(["all", "active", "revoked", "expired"])
          .default("all"),
        q: z.string().max(80).default(""),
        page: z.coerce.number().int().min(1).default(1),
      })
      .parse(req.query);
    const values = [
      req.user.id,
      req.user.school_id,
      input.section,
      input.access,
      `%${input.q}%`,
    ];
    const where = `WHERE c.teacher_id=$1 AND c.school_id=$2 AND u.deletion_requested_at IS NULL AND u.status='approved' AND ($3='all' OR s.section=$3) AND ($4='all' OR ($4='active' AND s.revoked_at IS NULL AND s.expires_at>now()) OR ($4='revoked' AND s.revoked_at IS NOT NULL) OR ($4='expired' AND s.revoked_at IS NULL AND s.expires_at<=now())) AND (u.nickname ILIKE $5 OR c.topic ILIKE $5)`;
    const total = Number(
      (
        await one(
          pool,
          `SELECT count(*) n FROM shared_snapshots s JOIN consultations c ON c.id=s.request_id JOIN users u ON u.id=c.student_id ${where}`,
          values,
        )
      ).n,
    );
    const items = (
      await pool.query(
        `SELECT s.id,s.section,s.source_version,s.consent_at,s.expires_at,s.revoked_at,CASE WHEN s.revoked_at IS NULL AND s.expires_at>now() THEN s.content_copy ELSE NULL END AS data,CASE WHEN s.revoked_at IS NOT NULL THEN 'revoked' WHEN s.expires_at<=now() THEN 'expired' ELSE 'active' END AS access,c.id AS request_id,c.request_number,c.topic,c.status AS request_status,u.nickname,p.grade,p.semester FROM shared_snapshots s JOIN consultations c ON c.id=s.request_id JOIN users u ON u.id=c.student_id JOIN student_profiles p ON p.user_id=u.id ${where} ORDER BY s.consent_at DESC,s.id DESC LIMIT 20 OFFSET $6`,
        [...values, (input.page - 1) * 20],
      )
    ).rows;
    res.json({
      items,
      total,
      page: input.page,
      pages: Math.ceil(total / 20),
    });
  });
  router.get("/bk/students", authorize("bk"), async (req, res) => {
    const input = z
      .object({
        status: z
          .enum(["all", "pending_approval", "approved", "rejected", "suspended"])
          .default("all"),
        grade: z.string().trim().max(40).default("all"),
        q: z.string().max(80).default(""),
        page: z.coerce.number().int().min(1).default(1),
      })
      .parse(req.query);
    const values = [
      req.user.school_id,
      input.status,
      input.grade,
      `%${input.q}%`,
    ];
    const where =
      "WHERE u.school_id=$1 AND u.role='siswa' AND u.deletion_requested_at IS NULL AND ($2='all' OR u.status=$2) AND ($3='all' OR p.grade=$3) AND (u.nickname ILIKE $4 OR u.username ILIKE $4)";
    const total = Number(
      (
        await one(
          pool,
          `SELECT count(*) n FROM users u JOIN student_profiles p ON p.user_id=u.id ${where}`,
          values,
        )
      ).n,
    );
    const items = (
      await pool.query(
        `SELECT u.id,u.username,u.nickname,u.status,u.created_at,s.name AS school_name,p.grade,p.semester,p.age_band,c.guardian_status,c.student_agreed_at,c.notice_version FROM users u JOIN schools s ON s.id=u.school_id JOIN student_profiles p ON p.user_id=u.id LEFT JOIN consents c ON c.user_id=u.id ${where} ORDER BY u.created_at DESC,u.id DESC LIMIT 20 OFFSET $5`,
        [...values, (input.page - 1) * 20],
      )
    ).rows;
    const grades = (
      await pool.query(
        "SELECT DISTINCT p.grade FROM student_profiles p JOIN users u ON u.id=p.user_id WHERE u.school_id=$1 AND u.role='siswa' AND u.deletion_requested_at IS NULL ORDER BY p.grade",
        [req.user.school_id],
      )
    ).rows.map((r) => r.grade);
    res.json({
      items,
      grades,
      total,
      page: input.page,
      pages: Math.ceil(total / 20),
    });
  });
  return router;
}

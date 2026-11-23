import { Router } from "express";
import { z } from "zod";
import { authorize, safeUser, userQuery } from "../../middleware/access.js";
import {
  one,
  transaction,
  audit,
  revokeSessions,
} from "../../config/database.js";
import { fail, requireRecord } from "../../utils/errors.js";
import { hashPassword } from "../../utils/password.js";
import { username, password } from "../auth/auth.schema.js";
const pageSchema = z.object({
  status: z
    .enum(["all", "pending_approval", "approved", "rejected", "suspended"])
    .default("pending_approval"),
  q: z.string().max(80).default(""),
  page: z.coerce.number().int().min(1).default(1),
});
export function approvalRoutes(pool) {
  const router = Router();
  router.use(authorize("superadmin"));
  router.get("/cohorts", async (req, res) =>
    res.json({
      items: (
        await pool.query(
          "SELECT id,label,graduation_at,deletion_at FROM cohorts WHERE school_id=$1 ORDER BY graduation_at DESC,label",
          [req.user.school_id],
        )
      ).rows,
    }),
  );
  router.post("/cohorts", async (req, res) => {
    const input = z
      .strictObject({
        label: z.string().trim().min(3).max(100),
        graduationAt: z.iso.date(),
        deletionAt: z.iso.datetime({ offset: true }),
      })
      .parse(req.body);
    if (new Date(input.deletionAt) < new Date(input.graduationAt))
      fail(422, "Tanggal retensi harus sesudah atau pada kelulusan.");
    const cohort = await transaction(pool, async (db) => {
      const record = await one(
        db,
        "INSERT INTO cohorts(school_id,label,graduation_at,deletion_at) VALUES($1,$2,$3,$4) RETURNING *",
        [req.user.school_id, input.label, input.graduationAt, input.deletionAt],
      );
      await audit(db, req.user.id, "cohort_created", record.id);
      return record;
    });
    res.status(201).json({ cohort });
  });
  router.post("/registrations/:id/cohort", async (req, res) => {
    const input = z.strictObject({ cohortId: z.uuid() }).parse(req.body);
    await transaction(pool, async (db) => {
      requireRecord(
        await one(
          db,
          "SELECT id FROM users WHERE id=$1 AND school_id=$2 AND role='siswa'",
          [req.params.id, req.user.school_id],
        ),
      );
      requireRecord(
        await one(db, "SELECT id FROM cohorts WHERE id=$1 AND school_id=$2", [
          input.cohortId,
          req.user.school_id,
        ]),
      );
      await db.query(
        "UPDATE student_profiles SET cohort_id=$2 WHERE user_id=$1",
        [req.params.id, input.cohortId],
      );
      await audit(db, req.user.id, "cohort_assigned", req.params.id);
    });
    res.json({ ok: true });
  });
  router.get("/registrations", async (req, res) => {
    const { status, q, page } = pageSchema.parse(req.query),
      values = [req.user.school_id, status, `%${q}%`];
    const where =
      "WHERE u.school_id=$1 AND u.role='siswa' AND u.deletion_requested_at IS NULL AND ($2='all' OR u.status=$2) AND (u.username ILIKE $3 OR u.nickname ILIKE $3)";
    const total = Number(
      (await one(pool, `SELECT count(*) total FROM users u ${where}`, values))
        .total,
    );
    const rows = (
      await pool.query(
        `${userQuery} ${where} ORDER BY u.created_at DESC,u.id LIMIT 20 OFFSET $4`,
        [...values, (page - 1) * 20],
      )
    ).rows;
    res.json({
      items: rows.map(safeUser),
      total,
      page,
      pages: Math.ceil(total / 20),
    });
  });
  router.get("/registrations/:id", async (req, res) => {
    const user = requireRecord(
      await one(
        pool,
        `${userQuery} WHERE u.id=$1 AND u.school_id=$2 AND u.role='siswa' AND u.deletion_requested_at IS NULL`,
        [req.params.id, req.user.school_id],
      ),
    );
    const history = (
      await pool.query(
        "SELECT r.decision,r.reason,r.created_at,u.nickname reviewer FROM registration_reviews r LEFT JOIN users u ON u.id=r.reviewer_id WHERE r.student_id=$1 ORDER BY r.created_at DESC",
        [user.id],
      )
    ).rows;
    res.json({ user: safeUser(user), history });
  });
  router.post("/registrations/:id/decision", async (req, res) => {
    const input = z
      .strictObject({
        decision: z.enum(["approved", "rejected"]),
        reason: z.string().trim().max(500).default(""),
        version: z.number().int().positive(),
      })
      .parse(req.body);
    if (input.decision === "rejected" && input.reason.length < 5)
      fail(422, "Tuliskan alasan penolakan minimal 5 karakter.");
    await transaction(pool, async (db) => {
      const user = requireRecord(
        await one(
          db,
          "SELECT * FROM users WHERE id=$1 AND school_id=$2 AND role='siswa' AND deletion_requested_at IS NULL FOR UPDATE",
          [req.params.id, req.user.school_id],
        ),
      );
      if (user.status !== "pending_approval" || user.version !== input.version)
        fail(
          409,
          "Pendaftaran ini sudah diputuskan atau berubah. Muat ulang untuk melihat keputusan.",
          "VERSION_CONFLICT",
        );
      await db.query(
        "INSERT INTO registration_reviews(student_id,reviewer_id,decision,reason) VALUES($1,$2,$3,$4)",
        [
          user.id,
          req.user.id,
          input.decision,
          input.decision === "rejected" ? input.reason : null,
        ],
      );
      await db.query(
        "UPDATE users SET status=$2,version=version+1,updated_at=now() WHERE id=$1",
        [user.id, input.decision],
      );
      await audit(db, req.user.id, `registration_${input.decision}`, user.id);
    });
    res.json({ ok: true });
  });
  router.post("/registrations/:id/guardian", async (req, res) => {
    const input = z
      .strictObject({ reference: z.string().trim().min(3).max(100) })
      .parse(req.body);
    await transaction(pool, async (db) => {
      const user = requireRecord(
        await one(
          db,
          "SELECT u.id,p.age_band FROM users u JOIN student_profiles p ON p.user_id=u.id WHERE u.id=$1 AND u.school_id=$2 AND u.role='siswa' AND u.deletion_requested_at IS NULL FOR UPDATE OF u",
          [req.params.id, req.user.school_id],
        ),
      );
      if (user.age_band !== "under18")
        fail(422, "Persetujuan wali tidak diperlukan untuk kategori usia ini.");
      await db.query(
        "UPDATE consents SET guardian_status='verified',verified_by=$2,verified_at=now(),external_reference=$3 WHERE user_id=$1",
        [user.id, req.user.id, input.reference],
      );
      await db.query(
        "UPDATE users SET version=version+1,updated_at=now() WHERE id=$1",
        [user.id],
      );
      await audit(db, req.user.id, "guardian_verified", user.id);
    });
    res.json({ ok: true });
  });
  router.get("/bk", async (req, res) =>
    res.json({
      items: (
        await pool.query(
          "SELECT id,username,nickname,status,version FROM users WHERE role='bk' AND school_id=$1 AND deletion_requested_at IS NULL ORDER BY nickname",
          [req.user.school_id],
        )
      ).rows,
    }),
  );
  router.post("/bk", async (req, res) => {
    const input = z
        .strictObject({
          username,
          password,
          nickname: z.string().trim().min(2).max(40),
        })
        .parse(req.body),
      hash = await hashPassword(input.password);
    const user = await transaction(pool, async (db) => {
      const u = await one(
        db,
        "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,$2,$3,$4,'bk','approved') RETURNING id,username,nickname,status",
        [req.user.school_id, input.username, hash, input.nickname],
      );
      await audit(db, req.user.id, "bk_created", u.id);
      return u;
    });
    res.status(201).json({ user });
  });
  router.post("/accounts/:id/status", async (req, res) => {
    const input = z
      .strictObject({
        status: z.enum(["approved", "suspended"]),
        version: z.number().int().positive(),
      })
      .parse(req.body);
    await transaction(pool, async (db) => {
      // Kunci per sekolah mencegah dua admin menonaktifkan admin terakhir bersamaan.
      await db.query("SELECT id FROM schools WHERE id=$1 FOR UPDATE", [
        req.user.school_id,
      ]);
      const u = requireRecord(
        await one(
          db,
          "SELECT * FROM users WHERE id=$1 AND school_id=$2 AND deletion_requested_at IS NULL FOR UPDATE",
          [req.params.id, req.user.school_id],
        ),
      );
      if (u.id === req.user.id)
        fail(422, "Anda tidak dapat mengubah status akun sendiri.");
      if (
        !["approved", "suspended"].includes(u.status) ||
        u.version !== input.version
      )
        fail(
          409,
          "Status/versi berubah. Gunakan antrean untuk memutuskan pendaftaran.",
          "VERSION_CONFLICT",
        );
      if (
        u.role === "superadmin" &&
        input.status === "suspended" &&
        Number(
          (
            await one(
              db,
              "SELECT count(*) n FROM users WHERE role='superadmin' AND status='approved' AND school_id=$1",
              [u.school_id],
            )
          ).n,
        ) <= 1
      )
        fail(422, "Superadmin aktif terakhir harus dipertahankan.");
      await db.query(
        "UPDATE users SET status=$2,version=version+1,updated_at=now() WHERE id=$1",
        [u.id, input.status],
      );
      await revokeSessions(db, u.id);
      await audit(db, req.user.id, `account_${input.status}`, u.id);
    });
    res.json({ ok: true });
  });
  const academicOptionsSchema = z.strictObject({
    grades: z
      .array(z.string().trim().min(1).max(40))
      .min(1, "Minimal 1 pilihan kelas.")
      .max(30)
      .transform((arr) => [...new Set(arr)]),
    semesters: z
      .array(z.coerce.number().int().min(1).max(6))
      .min(1, "Minimal 1 pilihan semester.")
      .max(6)
      .transform((arr) => [...new Set(arr)].sort((a, b) => a - b)),
    publicRegistration: z.boolean().optional(),
  });
  router.get("/schools", async (req, res) => {
    const rows = (
      await pool.query(
        "SELECT id,name,public_registration,timezone,academic_options,created_at FROM schools ORDER BY name",
      )
    ).rows;
    res.json({
      items: rows.map((s) => ({
        ...s,
        isCurrentSchool: s.id === req.user.school_id,
      })),
    });
  });
  router.post("/schools", async (req, res) => {
    const input = z
      .strictObject({
        name: z.string().trim().min(3).max(180),
        publicRegistration: z.boolean().default(true),
        grades: z
          .array(z.string().trim().min(1).max(40))
          .min(1)
          .max(30)
          .default(["XI", "XII"])
          .transform((arr) => [...new Set(arr)]),
        semesters: z
          .array(z.coerce.number().int().min(1).max(6))
          .min(1)
          .max(6)
          .default([1, 2])
          .transform((arr) => [...new Set(arr)].sort((a, b) => a - b)),
      })
      .parse(req.body);
    const school = await transaction(pool, async (db) => {
      const record = await one(
        db,
        "INSERT INTO schools(name,public_registration,academic_options) VALUES($1,$2,$3) RETURNING id,name,public_registration,timezone,academic_options,created_at",
        [
          input.name,
          input.publicRegistration,
          JSON.stringify({ grades: input.grades, semesters: input.semesters }),
        ],
      );
      await audit(db, req.user.id, "school_created", record.id);
      return record;
    });
    res.status(201).json({ school });
  });
  router.patch("/schools/:id/academic-options", async (req, res) => {
    const input = academicOptionsSchema.parse(req.body);
    const school = await transaction(pool, async (db) => {
      const current = requireRecord(
        await one(
          db,
          "SELECT id,public_registration FROM schools WHERE id=$1 FOR UPDATE",
          [req.params.id],
        ),
      );
      const updated = await one(
        db,
        "UPDATE schools SET academic_options=$2,public_registration=$3 WHERE id=$1 RETURNING id,name,public_registration,timezone,academic_options,created_at",
        [
          current.id,
          JSON.stringify({ grades: input.grades, semesters: input.semesters }),
          input.publicRegistration ?? current.public_registration,
        ],
      );
      await audit(db, req.user.id, "school_academic_options_updated", current.id);
      return updated;
    });
    res.json({ school });
  });
  return router;
}

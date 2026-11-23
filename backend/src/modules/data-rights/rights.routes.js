import { Router } from "express";
import { z } from "zod";
import { authenticated, student, authorize } from "../../middleware/access.js";
import { verifyPassword } from "../../utils/password.js";
import { fail } from "../../utils/errors.js";
import { one, transaction, audit } from "../../config/database.js";
import { queueDeletion } from "../../jobs/deletion.job.js";
import { rateLimit } from "express-rate-limit";
import { PostgresRateLimitStore } from "../../middleware/rate-limit-store.js";
export function rightsRoutes(pool, config) {
  const router = Router();
  const sensitive = rateLimit({
    store: new PostgresRateLimitStore(pool, "data-rights"),
    windowMs: 15 * 60 * 1000,
    limit: config.NODE_ENV === "test" ? 500 : 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMIT",
        message:
          "Terlalu banyak percobaan konfirmasi. Coba lagi 15 menit lagi.",
      },
    },
  });
  const reauth = async (req, password) => {
    const user = await one(
      pool,
      "SELECT password_hash FROM users WHERE id=$1",
      [req.user.id],
    );
    if (!user || !(await verifyPassword(user.password_hash, password)))
      fail(401, "Kata sandi tidak sesuai.", "REAUTH_FAILED");
  };
  router.post("/student/export", student, sensitive, async (req, res) => {
    const input = z
      .strictObject({
        password: z.string().max(128),
        sections: z
          .array(
            z.enum([
              "reflection",
              "comparison",
              "plan",
              "consultations",
              "profile",
              "journal",
            ]),
          )
          .min(1)
          .max(6),
      })
      .parse(req.body);
    await reauth(req, input.password);
    const data = await transaction(pool, async (db) => {
      const output = {
        format: "langkahku-export-v1",
        exportedAt: new Date().toISOString(),
      };
      for (const section of input.sections) {
        if (section === "profile")
          output.profile = {
            username: req.user.username,
            nickname: req.user.nickname,
            grade: req.user.grade,
            semester: req.user.semester,
            school: req.user.school_name,
          };
        else if (section === "journal")
          output.journal = (
            await db.query(
              "SELECT entry_date,answers FROM journals WHERE user_id=$1 ORDER BY entry_date",
              [req.user.id],
            )
          ).rows;
        else if (section === "consultations")
          output.consultations = (
            await db.query(
              "SELECT request_number,topic,availability,note,status,confirmed_time FROM consultations WHERE student_id=$1",
              [req.user.id],
            )
          ).rows;
        else
          output[section] =
            (
              await one(
                db,
                "SELECT data FROM student_documents WHERE user_id=$1 AND kind=$2",
                [req.user.id, section],
              )
            )?.data || null;
      }
      await audit(db, req.user.id, "data_exported", req.user.id);
      return output;
    });
    res.set(
      "Content-Disposition",
      'attachment; filename="langkahku-ekspor.json"',
    );
    res.json(data);
  });
  router.delete("/student/data/:kind", student, sensitive, async (req, res) => {
    const kind = z
      .enum(["reflection", "comparison", "plan", "journal", "consultations"])
      .parse(req.params.kind);
    const input = z
      .strictObject({ password: z.string().max(128) })
      .parse(req.body);
    await reauth(req, input.password);
    await transaction(pool, async (db) => {
      if (kind === "journal")
        await db.query("DELETE FROM journals WHERE user_id=$1", [req.user.id]);
      else if (kind === "consultations")
        await db.query("DELETE FROM consultations WHERE student_id=$1", [
          req.user.id,
        ]);
      else {
        await db.query(
          "DELETE FROM student_documents WHERE user_id=$1 AND kind=$2",
          [req.user.id, kind],
        );
        await db.query(
          `UPDATE progress_states SET ${kind}=false,updated_at=now() WHERE user_id=$1`,
          [req.user.id],
        );
        await db.query(
          "UPDATE shared_snapshots SET revoked_at=now(),content_copy=NULL WHERE section=$2 AND request_id IN (SELECT id FROM consultations WHERE student_id=$1)",
          [req.user.id, kind],
        );
      }
      await audit(db, req.user.id, "feature_data_deleted", req.user.id);
    });
    res.json({ ok: true });
  });
  router.get("/account/retention", authenticated, (req, res) =>
    res.json({
      scheduledDeletionAt: req.user.deletion_at || null,
      pendingRetentionDays:
        config.RETENTION_ENABLED === "true"
          ? config.PENDING_RETENTION_DAYS
          : null,
      retentionValidated: config.RETENTION_ENABLED === "true",
      activeDeletionHours: 24,
      backupRetentionDays: 30,
      message:
        "Kebijakan dan tanggal retensi sekolah harus divalidasi sebelum data nyata. Salinan unduhan pribadi di luar aplikasi dikelola penerimanya.",
    }),
  );
  router.post("/account/delete", authenticated, sensitive, async (req, res) => {
    if (req.user.role !== "siswa")
      fail(403, "Penghapusan mandiri hanya tersedia untuk siswa.");
    const input = z
      .strictObject({
        password: z.string().max(128),
        confirmation: z.literal("HAPUS AKUN"),
      })
      .parse(req.body);
    await reauth(req, input.password);
    const job = await transaction(pool, (db) => queueDeletion(db, req.user.id));
    await new Promise((resolve, reject) =>
      req.session.destroy((e) => (e ? reject(e) : resolve())),
    );
    res.clearCookie("langkahku.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: config.NODE_ENV === "production",
    });
    res.status(202).json({
      jobId: job.id,
      message:
        "Akses diblokir. Data menunggu penghapusan terjadwal, paling lambat 24 jam.",
    });
  });
  router.get(
    "/admin/deletion-jobs",
    authorize("superadmin"),
    async (req, res) =>
      res.json({
        items: (
          await pool.query(
            "SELECT j.id,j.requested_at,j.status,j.retry_count,j.completed_at,j.failure_code FROM deletion_jobs j WHERE j.school_id=$1 ORDER BY j.requested_at DESC LIMIT 100",
            [req.user.school_id],
          )
        ).rows,
      }),
  );
  return router;
}

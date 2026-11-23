import { Router } from "express";
import { z } from "zod";
import { authorize } from "../../middleware/access.js";
import { one, transaction, audit } from "../../config/database.js";
import { fail, requireRecord } from "../../utils/errors.js";
import { contentSchema } from "./content.schema.js";
export function contentRoutes(pool, config) {
  const router = Router();
  router.get("/public/schools", async (_req, res) =>
    res.json({
      items: (
        await pool.query(
          "SELECT id,name FROM schools WHERE public_registration=true ORDER BY name",
        )
      ).rows,
    }),
  );
  router.get("/public/content", async (req, res) => {
    const input = z
      .object({
        q: z.string().max(100).default(""),
        category: z
          .enum(["all", "Kuliah", "Kerja", "Kuliah + Kerja", "Usaha"])
          .default("all"),
        kind: z
          .enum(["all", "pathway", "profession", "story", "worksheet"])
          .default("all"),
        riasec: z.enum(["all", "R", "I", "A", "S", "E", "C"]).default("all"),
      })
      .parse(req.query);
    const items = (
      await pool.query(
        "SELECT *,valid_until<CURRENT_DATE AS expired FROM content_items WHERE status='published' AND ($1='all' OR category=$1) AND ($2='all' OR kind=$2) AND ($3='all' OR riasec=$3) AND (title ILIKE $4 OR summary ILIKE $4 OR body ILIKE $4) AND ($5::boolean OR demo=false) ORDER BY CASE kind WHEN 'pathway' THEN 0 WHEN 'profession' THEN 1 WHEN 'story' THEN 2 ELSE 3 END,title",
        [
          input.category,
          input.kind,
          input.riasec,
          `%${input.q}%`,
          config.DEMO_MODE === "true",
        ],
      )
    ).rows;
    res.json({ items, demo: config.DEMO_MODE === "true" });
  });
  router.get("/public/content/:slug", async (req, res) =>
    res.json({
      item: requireRecord(
        await one(
          pool,
          "SELECT *,valid_until<CURRENT_DATE expired FROM content_items WHERE slug=$1 AND status='published' AND ($2::boolean OR demo=false)",
          [req.params.slug, config.DEMO_MODE === "true"],
        ),
      ),
    }),
  );
  router.get("/public/services", async (req, res) => {
    const schoolId = z.uuid().optional().parse(req.query.schoolId);
    const school = schoolId
      ? await one(
          pool,
          "SELECT id,name,timezone,service_settings FROM schools WHERE id=$1",
          [schoolId],
        )
      : null;
    res.json({ school });
  });
  router.get("/bk/content", authorize("bk"), async (req, res) =>
    res.json({
      items: (
        await pool.query(
          "SELECT * FROM content_items WHERE school_id=$1 ORDER BY updated_at DESC",
          [req.user.school_id],
        )
      ).rows,
    }),
  );
  router.post("/bk/content", authorize("bk"), async (req, res) => {
    const data = contentSchema.parse(req.body);
    const item = await transaction(pool, async (db) => {
      const row = await one(
        db,
        "INSERT INTO content_items(school_id,title,slug,kind,category,riasec,summary,body,status,sources,reviewer,reviewed_at,valid_until,demo) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *",
        [
          req.user.school_id,
          data.title,
          data.slug,
          data.kind,
          data.category,
          data.riasec,
          data.summary,
          data.body,
          data.status,
          JSON.stringify(data.sources),
          data.reviewer,
          data.reviewedAt,
          data.validUntil,
          data.demo,
        ],
      );
      await db.query(
        "INSERT INTO content_revisions(content_id,actor_id,version) VALUES($1,$2,$3)",
        [row.id, req.user.id, row.version],
      );
      await audit(db, req.user.id, "content_created", row.id);
      return row;
    });
    res.status(201).json({ item });
  });
  router.put("/bk/content/:id", authorize("bk"), async (req, res) => {
    const { version, ...body } = z
        .strictObject({
          ...contentSchema.shape,
          version: z.number().int().positive(),
        })
        .parse(req.body),
      data = contentSchema.parse(body);
    const item = await transaction(pool, async (db) => {
      const row = await one(
        db,
        "UPDATE content_items SET title=$3,slug=$4,kind=$5,category=$6,riasec=$7,summary=$8,body=$9,status=$10,sources=$11,reviewer=$12,reviewed_at=$13,valid_until=$14,demo=$15,version=version+1,updated_at=now() WHERE id=$1 AND school_id=$2 AND version=$16 RETURNING *",
        [
          req.params.id,
          req.user.school_id,
          data.title,
          data.slug,
          data.kind,
          data.category,
          data.riasec,
          data.summary,
          data.body,
          data.status,
          JSON.stringify(data.sources),
          data.reviewer,
          data.reviewedAt,
          data.validUntil,
          data.demo,
          version,
        ],
      );
      if (!row) {
        requireRecord(
          await one(
            db,
            "SELECT id FROM content_items WHERE id=$1 AND school_id=$2",
            [req.params.id, req.user.school_id],
          ),
        );
        fail(409, "Konten berubah. Muat ulang.", "VERSION_CONFLICT");
      }
      await db.query(
        "INSERT INTO content_revisions(content_id,actor_id,version) VALUES($1,$2,$3)",
        [row.id, req.user.id, row.version],
      );
      await audit(db, req.user.id, "content_updated", row.id);
      return row;
    });
    res.json({ item });
  });
  router.get("/bk/content/:id/history", authorize("bk"), async (req, res) => {
    requireRecord(
      await one(
        pool,
        "SELECT id FROM content_items WHERE id=$1 AND school_id=$2",
        [req.params.id, req.user.school_id],
      ),
    );
    res.json({
      items: (
        await pool.query(
          "SELECT r.version,r.created_at,u.nickname actor FROM content_revisions r LEFT JOIN users u ON u.id=r.actor_id WHERE r.content_id=$1 ORDER BY r.version DESC",
          [req.params.id],
        )
      ).rows,
    });
  });
  router.get("/bk/services", authorize("bk"), async (req, res) =>
    res.json({
      school: await one(
        pool,
        "SELECT name,timezone,service_settings FROM schools WHERE id=$1",
        [req.user.school_id],
      ),
    }),
  );
  router.put("/bk/services", authorize("bk"), async (req, res) => {
    const input = z
      .strictObject({
        timezone: z.string().refine((v) => {
          try {
            new Intl.DateTimeFormat("id", { timeZone: v });
            return true;
          } catch {
            return false;
          }
        }),
        hours: z.string().trim().min(3).max(300),
        responseEstimate: z.string().trim().min(3).max(200),
        helpContact: z.string().trim().max(200),
        responsible: z.string().trim().min(2).max(100),
        verifiedAt: z.iso.date(),
      })
      .parse(req.body);
    const { timezone, ...settings } = input;
    await transaction(pool, async (db) => {
      await db.query(
        "UPDATE schools SET timezone=$2,service_settings=$3 WHERE id=$1",
        [req.user.school_id, timezone, JSON.stringify(settings)],
      );
      await audit(db, req.user.id, "services_updated", req.user.school_id);
    });
    res.json({ ok: true });
  });
  router.get("/bk/aggregates", authorize("bk"), async (req, res) => {
    if (Object.keys(req.query).length)
      fail(
        422,
        "Agregat hanya tersedia untuk kelompok sekolah tetap, tanpa filter individual.",
      );
    const rows = (
      await pool.query(
        "SELECT p.reflection,p.exploration,p.comparison,p.plan FROM progress_states p JOIN users u ON u.id=p.user_id JOIN consents c ON c.user_id=u.id JOIN student_profiles sp ON sp.user_id=u.id WHERE u.school_id=$1 AND u.status='approved' AND u.deletion_requested_at IS NULL AND c.notice_version='2026-11-v1' AND (c.guardian_status='verified' OR (sp.age_band='adult' AND c.guardian_status='not_required'))",
        [req.user.school_id],
      )
    ).rows;
    const counts = [0, 0, 0, 0, 0];
    for (const r of rows)
      counts[
        r.plan ? 4 : r.comparison ? 3 : r.exploration ? 2 : r.reflection ? 1 : 0
      ]++;
    // Seluruh partisi disembunyikan jika satu sel kecil: tidak ada total/sel pelengkap untuk menghitung balik.
    const safe = rows.length >= 10 && counts.every((n) => n >= 5);
    const topicRows = (
      await pool.query(
        "SELECT c.topic,count(DISTINCT c.student_id)::int count FROM consultations c JOIN users u ON u.id=c.student_id WHERE c.school_id=$1 AND u.status='approved' AND u.deletion_requested_at IS NULL AND c.created_at>=date_trunc('month',now()) GROUP BY c.topic",
        [req.user.school_id],
      )
    ).rows;
    const topicsSafe =
      safe && topicRows.length > 0 && topicRows.every((r) => r.count >= 5);
    res.json({
      suppressed: !safe,
      group: "Seluruh siswa aktif sekolah",
      period: "Status saat ini; topik bulan berjalan",
      unit: "Siswa unik",
      stages: safe ? counts : null,
      total: safe ? rows.length : null,
      topics: topicsSafe ? topicRows : null,
      thresholds: { group: 10, cell: 5 },
      definition:
        "Tahap terakhir yang dikonfirmasi siswa; bukan skor kesiapan.",
    });
  });
  return router;
}

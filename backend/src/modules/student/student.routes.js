import { Router } from "express";
import { z } from "zod";
import { student, safeUser } from "../../middleware/access.js";
import { one, transaction, audit } from "../../config/database.js";
import { fail, requireRecord } from "../../utils/errors.js";
import { documentSchemas, journalSchema } from "./student.schema.js";
export function studentRoutes(pool, config = { DEMO_MODE: "false" }) {
  const router = Router();
  router.use(student);
  router.get("/home", async (req, res) => {
    const progress = await one(
      pool,
      "SELECT reflection,exploration,comparison,plan,updated_at FROM progress_states WHERE user_id=$1",
      [req.user.id],
    );
    const plan = await one(
      pool,
      "SELECT data,updated_at FROM student_documents WHERE user_id=$1 AND kind='plan'",
      [req.user.id],
    );
    const latest = await one(
      pool,
      "SELECT kind,updated_at FROM student_documents WHERE user_id=$1 ORDER BY updated_at DESC LIMIT 1",
      [req.user.id],
    );
    res.json({
      user: safeUser(req.user),
      progress: progress || {},
      plan: plan?.data || null,
      latest,
    });
  });
  router.get("/documents/:kind", async (req, res) => {
    const kind = z
      .enum(["reflection", "comparison", "plan"])
      .parse(req.params.kind);
    res.json({
      document: (await one(
        pool,
        "SELECT kind,data,version,updated_at FROM student_documents WHERE user_id=$1 AND kind=$2",
        [req.user.id, kind],
      )) || { kind, data: null, version: 0 },
    });
  });
  router.put("/documents/:kind", async (req, res) => {
    const kind = z
        .enum(["reflection", "comparison", "plan"])
        .parse(req.params.kind),
      input = z
        .strictObject({
          version: z.number().int().min(0),
          data: documentSchemas[kind],
        })
        .parse(req.body);
    const document = await transaction(pool, async (db) => {
      await db.query(
        "INSERT INTO student_documents(user_id,kind) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [req.user.id, kind],
      );
      const doc = await one(
        db,
        "UPDATE student_documents SET data=$3,version=version+1,updated_at=now() WHERE user_id=$1 AND kind=$2 AND version=$4 RETURNING kind,data,version,updated_at",
        [req.user.id, kind, JSON.stringify(input.data), input.version],
      );
      if (!doc)
        fail(
          409,
          "Data diubah di tab lain. Muat ulang sebelum menyimpan lagi.",
          "VERSION_CONFLICT",
        );
      const reviewed =
        kind === "plan"
          ? input.data.reviewed && input.data.steps.length >= 3
          : input.data.reviewed;
      await db.query(
        `INSERT INTO progress_states(user_id,${kind}) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET ${kind}=$2,updated_at=now()`,
        [req.user.id, reviewed],
      );
      return doc;
    });
    res.json({ document });
  });
  router.post("/exploration", async (req, res) => {
    const { contentId } = z
      .strictObject({ contentId: z.uuid() })
      .parse(req.body);
    requireRecord(
      await one(
        pool,
        "SELECT id FROM content_items WHERE id=$1 AND status='published' AND ($2::boolean OR demo=false)",
        [contentId, config.DEMO_MODE === "true"],
      ),
    );
    await pool.query(
      "INSERT INTO progress_states(user_id,exploration) VALUES($1,true) ON CONFLICT(user_id) DO UPDATE SET exploration=true,updated_at=now()",
      [req.user.id],
    );
    res.json({ ok: true });
  });
  router.get("/journals", async (req, res) =>
    res.json({
      items: (
        await pool.query(
          "SELECT id,entry_date,version,updated_at FROM journals WHERE user_id=$1 ORDER BY entry_date DESC,created_at DESC",
          [req.user.id],
        )
      ).rows,
    }),
  );
  router.get("/journals/:id", async (req, res) =>
    res.json({
      entry: requireRecord(
        await one(
          pool,
          "SELECT id,entry_date,answers,version,updated_at FROM journals WHERE id=$1 AND user_id=$2",
          [req.params.id, req.user.id],
        ),
      ),
    }),
  );
  router.post("/journals", async (req, res) => {
    const data = journalSchema.parse(req.body);
    const entry = await one(
      pool,
      "INSERT INTO journals(user_id,entry_date,answers) VALUES($1,$2,$3) RETURNING id,entry_date,answers,version,updated_at",
      [req.user.id, data.entryDate, JSON.stringify(data.answers)],
    );
    res.status(201).json({ entry });
  });
  router.put("/journals/:id", async (req, res) => {
    const input = z
      .strictObject({
        ...journalSchema.shape,
        version: z.number().int().positive(),
      })
      .parse(req.body);
    const entry = await one(
      pool,
      "UPDATE journals SET entry_date=$3,answers=$4,version=version+1,updated_at=now() WHERE id=$1 AND user_id=$2 AND version=$5 RETURNING id,entry_date,answers,version,updated_at",
      [
        req.params.id,
        req.user.id,
        input.entryDate,
        JSON.stringify(input.answers),
        input.version,
      ],
    );
    if (!entry) {
      requireRecord(
        await one(pool, "SELECT id FROM journals WHERE id=$1 AND user_id=$2", [
          req.params.id,
          req.user.id,
        ]),
      );
      fail(409, "Jurnal diubah di tab lain. Muat ulang.", "VERSION_CONFLICT");
    }
    res.json({ entry });
  });
  router.delete("/journals/:id", async (req, res) => {
    requireRecord(
      await one(
        pool,
        "DELETE FROM journals WHERE id=$1 AND user_id=$2 RETURNING id",
        [req.params.id, req.user.id],
      ),
    );
    res.json({ ok: true });
  });
  router.patch("/profile", async (req, res) => {
    const input = z
      .strictObject({
        nickname: z.string().trim().min(2).max(40),
        grade: z.enum(["XI", "XII"]),
        semester: z.number().int().min(1).max(2),
      })
      .parse(req.body);
    await transaction(pool, async (db) => {
      await db.query(
        "UPDATE users SET nickname=$2,updated_at=now(),version=version+1 WHERE id=$1",
        [req.user.id, input.nickname],
      );
      await db.query(
        "UPDATE student_profiles SET grade=$2,semester=$3 WHERE user_id=$1",
        [req.user.id, input.grade, input.semester],
      );
      await audit(db, req.user.id, "profile_updated", req.user.id);
    });
    res.json({ ok: true });
  });
  return router;
}

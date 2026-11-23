import { Router } from "express";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { rateLimit } from "express-rate-limit";
import { PostgresRateLimitStore } from "../../middleware/rate-limit-store.js";
import { registerSchema, loginSchema, recoverySchema } from "./auth.schema.js";
import {
  one,
  transaction,
  audit,
  revokeSessions,
} from "../../config/database.js";
import {
  hashPassword,
  verifyPassword,
  recoveryCode,
  digest,
} from "../../utils/password.js";
import { fail } from "../../utils/errors.js";
import {
  authenticated,
  safeUser,
  userQuery,
  NOTICE_VERSION,
} from "../../middleware/access.js";
const regenerate = (req) =>
  new Promise((resolve, reject) =>
    req.session.regenerate((error) => (error ? reject(error) : resolve())),
  );
const save = (req) =>
  new Promise((resolve, reject) =>
    req.session.save((error) => (error ? reject(error) : resolve())),
  );
export const csrfToken = (req) =>
  (req.session.csrf ||= randomBytes(32).toString("hex"));
export function authRoutes(pool, config) {
  const router = Router();
  const limiter = rateLimit({
    store: new PostgresRateLimitStore(pool, "auth"),
    windowMs: 15 * 60 * 1000,
    limit: config.NODE_ENV === "test" ? 500 : 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      error: {
        message: "Terlalu banyak percobaan. Coba lagi 15 menit lagi.",
        code: "RATE_LIMIT",
      },
    },
  });
  router.get("/me", (req, res) =>
    res.json({
      user: safeUser(req.user),
      csrf: csrfToken(req),
      demo: config.DEMO_MODE === "true",
      noticeVersion: NOTICE_VERSION,
    }),
  );
  router.post("/register", limiter, async (req, res) => {
    const input = registerSchema.parse(req.body);
    const hash = await hashPassword(input.password),
      code = recoveryCode();
    const id = await transaction(pool, async (db) => {
      const school = await one(
        db,
        "SELECT id FROM schools WHERE id=$1 AND public_registration=true",
        [input.schoolCode],
      );
      if (!school) fail(422, "Sekolah tidak menerima pendaftaran.");
      const user = await one(
        db,
        "INSERT INTO users(school_id,username,password_hash,recovery_hash,nickname,role,status) VALUES($1,$2,$3,$4,$5,'siswa','pending_approval') RETURNING id",
        [school.id, input.username, hash, digest(code), input.nickname],
      );
      await db.query(
        "INSERT INTO student_profiles(user_id,grade,semester,age_band) VALUES($1,$2,$3,$4)",
        [user.id, input.grade, input.semester, input.ageBand],
      );
      await db.query(
        "INSERT INTO consents(user_id,notice_version,student_agreed_at,guardian_status) VALUES($1,$2,now(),$3)",
        [
          user.id,
          NOTICE_VERSION,
          input.ageBand === "under18" ? "pending" : "not_required",
        ],
      );
      await db.query("INSERT INTO progress_states(user_id) VALUES($1)", [
        user.id,
      ]);
      await audit(db, user.id, "registration_submitted", user.id);
      return user.id;
    });
    await regenerate(req);
    req.session.userId = id;
    const csrf = csrfToken(req);
    await save(req);
    res.status(201).json({
      user: safeUser(await one(pool, `${userQuery} WHERE u.id=$1`, [id])),
      recoveryCode: code,
      csrf,
    });
  });
  router.post("/login", limiter, async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await one(pool, `${userQuery} WHERE u.username=$1`, [
      input.username,
    ]);
    // Jalur gagal tetap melakukan Argon2 untuk mengurangi perbedaan waktu pencarian akun.
    const valid = user
      ? await verifyPassword(user.password_hash, input.password)
      : (await hashPassword(input.password), false);
    if (!valid || user.deletion_requested_at)
      fail(
        401,
        "Username atau kata sandi tidak sesuai.",
        "INVALID_CREDENTIALS",
      );
    if (
      input.audience &&
      (input.audience === "siswa") !== (user.role === "siswa")
    )
      fail(
        403,
        input.audience === "siswa"
          ? "Akun ini menggunakan akses Superadmin / BK. Balik kartu untuk masuk melalui akses staf."
          : "Akun ini menggunakan akses Siswa. Balik kartu untuk masuk melalui akses siswa.",
        "LOGIN_PORTAL_MISMATCH",
      );
    await regenerate(req);
    req.session.userId = user.id;
    const csrf = csrfToken(req);
    await save(req);
    res.json({ user: safeUser(user), csrf });
  });
  router.post("/recover", limiter, async (req, res) => {
    const input = recoverySchema.parse(req.body),
      hash = await hashPassword(input.password),
      code = recoveryCode();
    await transaction(pool, async (db) => {
      const user = await one(
        db,
        "SELECT * FROM users WHERE username=$1 FOR UPDATE",
        [input.username],
      );
      const provided = Buffer.from(digest(input.code));
      const stored = Buffer.from(user?.recovery_hash || "");
      const validCode =
        provided.length > 0 &&
        provided.length === stored.length &&
        timingSafeEqual(provided, stored);
      if (!user || user.deletion_requested_at || !validCode)
        fail(400, "Kode pemulihan atau username tidak sesuai.");
      await db.query(
        "UPDATE users SET password_hash=$2,recovery_hash=$3,version=version+1,updated_at=now() WHERE id=$1",
        [user.id, hash, digest(code)],
      );
      await revokeSessions(db, user.id);
      await audit(db, user.id, "password_recovered", user.id);
    });
    await regenerate(req);
    res.json({ recoveryCode: code, csrf: csrfToken(req) });
  });
  router.post("/logout", authenticated, async (req, res) => {
    await new Promise((resolve, reject) =>
      req.session.destroy((error) => (error ? reject(error) : resolve())),
    );
    res.clearCookie("langkahku.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: config.NODE_ENV === "production",
    });
    res.json({ ok: true });
  });
  return router;
}

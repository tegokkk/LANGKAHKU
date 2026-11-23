import { one } from "../config/database.js";
import { fail } from "../utils/errors.js";
export const NOTICE_VERSION = "2026-11-v1";
export const active = (u) =>
  Boolean(
    u &&
    u.status === "approved" &&
    !u.deletion_requested_at &&
    (u.role !== "siswa" ||
      (u.student_agreed_at &&
        u.notice_version === NOTICE_VERSION &&
        (u.age_band === "adult"
          ? ["not_required", "verified"].includes(u.guardian_status)
          : u.guardian_status === "verified"))),
  );
export const destination = (u) =>
  !active(u)
    ? "/status"
    : {
        superadmin: "/superadmin/pendaftaran",
        bk: "/bk/permintaan",
        siswa: "/beranda",
      }[u.role];
export const safeUser = (u) =>
  u
    ? {
        id: u.id,
        username: u.username,
        nickname: u.nickname,
        role: u.role,
        status: u.status,
        schoolId: u.school_id,
        schoolName: u.school_name,
        schoolTimezone: u.school_timezone,
        grade: u.grade,
        semester: u.semester,
        ageBand: u.age_band,
        guardianStatus: u.guardian_status,
        studentAgreedAt: u.student_agreed_at,
        noticeVersion: u.notice_version,
        decision: u.decision,
        reason: u.reason,
        reviewedAt: u.reviewed_at,
        createdAt: u.created_at,
        version: u.version,
        active: active(u),
        destination: destination(u),
        deletionAt: u.deletion_at,
      }
    : null;
export const userQuery = `SELECT u.*,s.name school_name,s.timezone school_timezone,p.grade,p.semester,p.age_band,c.guardian_status,c.student_agreed_at,c.notice_version,r.decision,r.reason,r.created_at reviewed_at,co.deletion_at FROM users u JOIN schools s ON s.id=u.school_id LEFT JOIN student_profiles p ON p.user_id=u.id LEFT JOIN consents c ON c.user_id=u.id LEFT JOIN registration_reviews r ON r.student_id=u.id LEFT JOIN cohorts co ON co.id=p.cohort_id`;
export function loadUser(pool) {
  return async (req, _res, next) => {
    if (req.session.userId)
      req.user = await one(pool, `${userQuery} WHERE u.id=$1`, [
        req.session.userId,
      ]);
    next();
  };
}
export function authenticated(req, _res, next) {
  if (!req.user || req.user.deletion_requested_at)
    fail(401, "Silakan masuk kembali.", "SESSION_EXPIRED");
  next();
}
export const authorize =
  (...roles) =>
  (req, res, next) => {
    authenticated(req, res, () => {});
    if (!roles.includes(req.user.role))
      fail(403, "Peran akun tidak diizinkan.", "FORBIDDEN");
    if (!active(req.user))
      fail(403, "Akun atau persetujuan belum aktif.", "ACCOUNT_RESTRICTED");
    next();
  };
export const student = authorize("siswa");

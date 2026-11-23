import { transaction } from "../config/database.js";
import { queueDeletion, runDeletionJobs } from "./deletion.job.js";
export async function runRetention(pool, config) {
  let queued = 0;
  if (config.RETENTION_ENABLED === "true") {
    await transaction(pool, async (db) => {
      const rows = (
        await db.query(
          "SELECT u.id FROM users u LEFT JOIN student_profiles p ON p.user_id=u.id LEFT JOIN cohorts co ON co.id=p.cohort_id WHERE u.role='siswa' AND u.deletion_requested_at IS NULL AND ((u.status IN ('pending_approval','rejected') AND u.updated_at<now()-($1::int*interval '1 day')) OR co.deletion_at<=now()) ORDER BY u.id LIMIT 500 FOR UPDATE OF u SKIP LOCKED",
          [config.PENDING_RETENTION_DAYS],
        )
      ).rows;
      for (const u of rows) {
        await queueDeletion(db, u.id, null);
        queued++;
      }
    });
  }
  await pool.query(
    "UPDATE shared_snapshots SET content_copy=NULL WHERE expires_at<=now() AND content_copy IS NOT NULL",
  );
  await pool.query("DELETE FROM sessions WHERE expire<now()");
  await pool.query("DELETE FROM rate_limit_buckets WHERE reset_at<now()");
  return { queued, ...(await runDeletionJobs(pool)) };
}

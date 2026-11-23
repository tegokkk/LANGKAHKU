import { appendFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { one, transaction, revokeSessions, audit } from "../config/database.js";
export const ledgerPath = () =>
  resolve(
    process.env.DELETION_LEDGER_PATH || "../.local/deletion-ledger.ndjson",
  );
export async function queueDeletion(db, id, actor = id) {
  await db.query(
    "UPDATE users SET deletion_requested_at=COALESCE(deletion_requested_at,now()),updated_at=now() WHERE id=$1",
    [id],
  );
  await revokeSessions(db, id);
  await db.query(
    "UPDATE shared_snapshots SET content_copy=NULL,revoked_at=now() WHERE request_id IN (SELECT id FROM consultations WHERE student_id=$1)",
    [id],
  );
  const job = await one(
    db,
    "INSERT INTO deletion_jobs(target_id,school_id) SELECT id,school_id FROM users WHERE id=$1 ON CONFLICT(target_id) WHERE status IN ('pending','failed') DO UPDATE SET requested_at=deletion_jobs.requested_at RETURNING id",
    [id],
  );
  await audit(db, actor, "deletion_requested", id);
  return job;
}
export async function runDeletionJobs(pool) {
  const jobs = (
    await pool.query(
      "SELECT id FROM deletion_jobs WHERE status IN ('pending','failed') ORDER BY requested_at LIMIT 100",
    )
  ).rows;
  let completed = 0,
    failed = 0;
  for (const job of jobs) {
    try {
      const deleted = await transaction(pool, async (db) => {
        const record = await one(
          db,
          "SELECT * FROM deletion_jobs WHERE id=$1 AND status IN ('pending','failed') FOR UPDATE SKIP LOCKED",
          [job.id],
        );
        if (!record) return;
        await mkdir(dirname(ledgerPath()), { recursive: true });
        // Catat ID tombstone sebelum commit; tanpa profil/isi. Salinan tahan restore wajib untuk produksi.
        await appendFile(
          ledgerPath(),
          `${JSON.stringify({ targetId: record.target_id, deletedAt: new Date().toISOString() })}\n`,
          { flush: true, mode: 0o600 },
        );
        await revokeSessions(db, record.target_id);
        await db.query(
          "DELETE FROM audit_logs WHERE actor_id=$1 OR target_id=$1",
          [record.target_id],
        );
        await db.query("DELETE FROM users WHERE id=$1 AND role='siswa'", [
          record.target_id,
        ]);
        await db.query(
          "UPDATE deletion_jobs SET status='completed',completed_at=now(),failure_code=NULL WHERE id=$1",
          [record.id],
        );
        return true;
      });
      if (deleted) completed++;
    } catch {
      failed++;
      await pool.query(
        "UPDATE deletion_jobs SET status='failed',retry_count=retry_count+1,failure_code='PURGE_FAILED' WHERE id=$1",
        [job.id],
      );
    }
  }
  return { completed, failed };
}

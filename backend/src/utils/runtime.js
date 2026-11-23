import { readdir } from "node:fs/promises";

export async function assertMigrations(pool) {
  const expected = (
    await readdir(new URL("../../migrations/", import.meta.url))
  ).filter((name) => name.endsWith(".sql"));
  const { rows } = await pool.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((row) => row.name));
  if (expected.some((name) => !applied.has(name)))
    throw new Error(
      "Migrasi belum lengkap. Jalankan npm run migrate sebelum start.",
    );
}

export async function workerTick(pool, config, runRetention) {
  try {
    const result = await runRetention(pool, config);
    await pool.query(
      `INSERT INTO worker_health(name,last_attempt_at,last_success_at,failed) VALUES('retention',now(),CASE WHEN $1 THEN NULL ELSE now() END,$1)
       ON CONFLICT(name) DO UPDATE SET last_attempt_at=now(),last_success_at=CASE WHEN EXCLUDED.failed THEN worker_health.last_success_at ELSE now() END,failed=EXCLUDED.failed`,
      [result.failed > 0],
    );
    return result;
  } catch (error) {
    await pool
      .query(
        `INSERT INTO worker_health(name,failed) VALUES('retention',true)
       ON CONFLICT(name) DO UPDATE SET last_attempt_at=now(),failed=true`,
      )
      .catch(() => {});
    throw error;
  }
}

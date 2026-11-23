import { createPool } from "../src/config/database.js";
const pool = createPool(process.env.DATABASE_URL);
try {
  const { rowCount } = await pool.query(
    "SELECT 1 FROM worker_health WHERE name='retention' AND failed=false AND last_success_at>now()-interval '3 minutes'",
  );
  process.exitCode = rowCount ? 0 : 1;
} catch {
  process.exitCode = 1;
} finally {
  await pool.end();
}

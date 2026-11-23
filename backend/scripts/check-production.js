import { readConfig } from "../src/config/env.js";
import { createPool } from "../src/config/database.js";
import { readinessReport } from "../src/utils/readiness.js";
let pool;
try {
  const config = readConfig();
  pool = createPool(config.DATABASE_URL);
  const report = await readinessReport(pool, config);
  console.log(JSON.stringify(report, null, 2));
  if (!report.ok) process.exitCode = 1;
} catch {
  console.error(
    JSON.stringify({
      ok: false,
      action:
        "Periksa konfigurasi server dan koneksi database. Nilai secret tidak dicetak.",
    }),
  );
  process.exitCode = 1;
} finally {
  await pool?.end();
}

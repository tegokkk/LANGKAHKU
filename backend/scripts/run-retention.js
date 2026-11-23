import { readConfig } from "../src/config/env.js";
import { createPool } from "../src/config/database.js";
import { runRetention } from "../src/jobs/retention.job.js";
const config = readConfig(),
  pool = createPool(config.DATABASE_URL);
try {
  const result = await runRetention(pool, config);
  console.log(JSON.stringify(result));
  if (result.failed) process.exitCode = 1;
} finally {
  await pool.end();
}

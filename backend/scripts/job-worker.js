import { readConfig } from "../src/config/env.js";
import { createPool } from "../src/config/database.js";
import { runRetention } from "../src/jobs/retention.job.js";
import { logger } from "../src/config/logger.js";
import { assertMigrations, workerTick } from "../src/utils/runtime.js";
import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { ledgerPath } from "../src/jobs/deletion.job.js";
const config = readConfig(),
  pool = createPool(config.DATABASE_URL);
await assertMigrations(pool);
await mkdir(dirname(ledgerPath()), { recursive: true });
await appendFile(ledgerPath(), "", { mode: 0o600, flush: true });
let pending,
  stopping = false;
function tick() {
  if (pending || stopping) return pending;
  pending = workerTick(pool, config, runRetention)
    .then((result) => logger.info({ event: "retention_result", ...result }))
    .catch((error) =>
      logger.error({
        event: "retention_failed",
        code: error?.code || "WORKER_ERROR",
      }),
    )
    .finally(() => {
      pending = null;
    });
  return pending;
}
const timer = setInterval(tick, 60000);
logger.info({ event: "worker_started", intervalMs: 60000 });
void tick();
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, async () => {
    if (stopping) return;
    stopping = true;
    clearInterval(timer);
    const deadline = setTimeout(() => process.exit(1), 25000);
    deadline.unref();
    await pending;
    await pool.end();
    clearTimeout(deadline);
    process.exit(0);
  });

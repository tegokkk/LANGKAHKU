import { readConfig } from "../src/config/env.js";
import { logger } from "../src/config/logger.js";
import { backupDatabase } from "../src/utils/backup.js";
const config = readConfig();
let pending,
  timer,
  stopping = false;
function tick() {
  if (pending || stopping) return pending;
  let delay = 24 * 60 * 60 * 1000;
  pending = backupDatabase({
    url: config.DATABASE_URL,
    key: process.env.BACKUP_KEY,
    directory: process.env.BACKUP_DIRECTORY,
  })
    .then(({ bytes }) => logger.info({ event: "backup_completed", bytes }))
    .catch(() => {
      delay = 5 * 60 * 1000;
      logger.error({ event: "backup_failed", retryMs: delay });
    })
    .finally(() => {
      pending = null;
      if (!stopping) timer = setTimeout(tick, delay);
    });
  return pending;
}
void tick();
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, async () => {
    stopping = true;
    clearTimeout(timer);
    await pending;
  });

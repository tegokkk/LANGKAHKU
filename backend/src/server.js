import { readConfig } from "./config/env.js";
import { createPool } from "./config/database.js";
import { createApp } from "./app.js";
import { logger } from "./config/logger.js";
import { assertMigrations } from "./utils/runtime.js";
const config = readConfig(),
  pool = createPool(config.DATABASE_URL);
try {
  await assertMigrations(pool);
} catch (error) {
  logger.fatal({
    event: "startup_failed",
    reason: "DATABASE_OR_MIGRATIONS",
    code: error.code || "MIGRATIONS_INCOMPLETE",
    hint:
      error.code === "ECONNREFUSED"
        ? "Database tidak berjalan. Untuk cluster lokal, jalankan npm run db:local, lalu ulangi npm run dev."
        : "Periksa koneksi database dan jalankan npm run migrate sebelum start.",
  });
  await pool.end();
  process.exit(1);
}
const app = createApp({ pool, config });
const server = app.listen(config.PORT, config.HOST, () =>
  logger.info({ event: "api_started", port: config.PORT }),
);
server.requestTimeout = 30000;
server.headersTimeout = 15000;
let stopping = false;
function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  app.locals.draining = true;
  logger.info({ event: "api_stopping", signal });
  const deadline = setTimeout(() => {
    logger.error({ event: "shutdown_timeout" });
    server.closeAllConnections();
    process.exit(1);
  }, 25000);
  deadline.unref();
  server.close(async () => {
    try {
      await pool.end();
      clearTimeout(deadline);
      process.exit(0);
    } catch {
      process.exit(1);
    }
  });
  server.closeIdleConnections();
}
server.on("error", () => {
  logger.fatal({ event: "listen_failed" });
  pool.end().finally(() => process.exit(1));
});
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => shutdown(signal));

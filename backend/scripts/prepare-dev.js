import { readConfig } from "../src/config/env.js";
import { createPool } from "../src/config/database.js";
import { migrate } from "./migrate.js";

// Only manage the dedicated development cluster owned by this project.
// Other databases keep their explicit setup/migration workflow.
if ((process.env.NODE_ENV || "development") === "development") {
  const config = readConfig();
  const database = new URL(config.DATABASE_URL);
  if (
    database.hostname === "127.0.0.1" &&
    database.port === "55432" &&
    database.pathname === "/langkahku"
  ) {
    await import("./local-db.js");
    const pool = createPool(config.DATABASE_URL);
    try {
      await migrate(pool);
    } finally {
      await pool.end();
    }
  }
}

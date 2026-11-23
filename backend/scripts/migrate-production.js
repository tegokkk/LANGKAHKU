import { createPool } from "../src/config/database.js";
import { migrate } from "./migrate.js";
if (!process.env.MIGRATION_DATABASE_URL)
  throw new Error("MIGRATION_DATABASE_URL wajib untuk migrasi produksi.");
const pool = createPool(process.env.MIGRATION_DATABASE_URL);
try {
  await migrate(pool);
  // Runtime can read/write application tables but cannot create/drop schema objects.
  await pool.query(
    "GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO langkahku_app",
  );
  await pool.query(
    "GRANT USAGE,SELECT ON ALL SEQUENCES IN SCHEMA public TO langkahku_app",
  );
} finally {
  await pool.end();
}

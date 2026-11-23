import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createPool, transaction } from "../src/config/database.js";
export async function migrate(pool) {
  await transaction(pool, async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(61482026)");
    await db.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY,applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const directory = new URL("../migrations/", import.meta.url);
    for (const name of (await readdir(directory))
      .filter((x) => x.endsWith(".sql"))
      .sort()) {
      if (
        (
          await db.query("SELECT 1 FROM schema_migrations WHERE name=$1", [
            name,
          ])
        ).rowCount
      )
        continue;
      await db.query(await readFile(new URL(name, directory), "utf8"));
      await db.query("INSERT INTO schema_migrations(name) VALUES($1)", [name]);
      console.log(`Migrasi ${name} berhasil.`);
    }
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pool = createPool(process.env.DATABASE_URL);
  try {
    await migrate(pool);
  } finally {
    await pool.end();
  }
}

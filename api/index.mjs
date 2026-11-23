import { readConfig } from "../backend/src/config/env.js";
import { createPool } from "../backend/src/config/database.js";
import { createApp } from "../backend/src/app.js";
import { migrate } from "../backend/scripts/migrate.js";

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const config = readConfig({
        TRUST_PROXY: process.env.TRUST_PROXY ?? "1",
      });
      const pool = createPool(config.DATABASE_URL);
      try {
        await migrate(pool);
      } catch (error) {
        console.error(
          JSON.stringify({
            event: "serverless_auto_migrate_skipped",
            code: error?.code || "MIGRATE_SKIPPED",
          }),
        );
      }
      return createApp({ pool, config });
    })();
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}

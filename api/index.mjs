import { readConfig } from "../backend/src/config/env.js";
import { createPool } from "../backend/src/config/database.js";
import { createApp } from "../backend/src/app.js";

let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = Promise.resolve().then(() => {
      const config = readConfig({
        TRUST_PROXY: process.env.TRUST_PROXY ?? "1",
      });
      const pool = createPool(config.DATABASE_URL);
      return createApp({ pool, config });
    });
  }
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  return app(req, res);
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { createPool, one } from "../src/config/database.js";
import { migrate } from "../scripts/migrate.js";
test("demo seed creates complete fictional fixtures, stays idempotent and rejects production", async () => {
  const url = new URL(process.env.TEST_DATABASE_URL);
  if (!url.pathname.endsWith("_test")) throw new Error("Database test wajib.");
  const base = new URL(url);
  base.pathname = "/postgres";
  const admin = createPool(base.toString()),
    name = `langkahku_seed_${randomBytes(5).toString("hex")}_test`;
  url.pathname = `/${name}`;
  let pool;
  try {
    await admin.query(`CREATE DATABASE ${name}`);
    pool = createPool(url.toString());
    await migrate(pool);
    const env = {
      ...process.env,
      DATABASE_URL: url.toString(),
      TEST_DATABASE_URL: url.toString(),
      NODE_ENV: "test",
      DEMO_MODE: "true",
      DEMO_CREDENTIALS_PATH: resolve("../.local/test-demo-credentials.txt"),
    };
    const run = () =>
      spawnSync(process.execPath, ["tests/fixtures/demo.js"], {
        env,
        encoding: "utf8",
        windowsHide: true,
      });
    assert.equal(run().status, 0);
    assert.equal(run().status, 0);
    assert.equal(
      Number(
        (await one(pool, "SELECT count(*) n FROM users WHERE role='siswa'")).n,
      ),
      33,
    );
    assert.equal(
      Number((await one(pool, "SELECT count(*) n FROM content_items")).n),
      26,
    );
    assert.equal(
      Number((await one(pool, "SELECT count(*) n FROM consultations")).n),
      1,
    );
    assert.equal(
      Number((await one(pool, "SELECT count(*) n FROM shared_snapshots")).n),
      0,
    );
    for (const mode of ["development", "production"])
      assert.notEqual(
        spawnSync(process.execPath, ["tests/fixtures/demo.js"], {
          env: { ...env, NODE_ENV: mode },
          windowsHide: true,
        }).status,
        0,
      );
  } finally {
    await pool?.end();
    await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await admin.end();
  }
});

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { createPool, transaction } from "../src/config/database.js";
import { readConfig } from "../src/config/env.js";
import { createApp } from "../src/app.js";
import { assertMigrations, workerTick } from "../src/utils/runtime.js";
import { PostgresRateLimitStore } from "../src/middleware/rate-limit-store.js";
import { migrate } from "../scripts/migrate.js";
import { readinessReport } from "../src/utils/readiness.js";

const url = process.env.TEST_DATABASE_URL;
if (
  !url ||
  !new URL(url).pathname.endsWith("_test") ||
  url === process.env.DATABASE_URL
)
  throw new Error("Database test terpisah berakhiran _test wajib.");
const pool = createPool(url);
const config = readConfig({
  NODE_ENV: "test",
  DATABASE_URL: url,
  SESSION_SECRET: randomBytes(32).toString("hex"),
  DEMO_MODE: "false",
});
const production = {
  ...config,
  NODE_ENV: "production",
  APP_ORIGIN: "https://langkahku.example",
};
after(() => pool.end());

test("production rejects unsafe origin, credentials, demo mode and missing durable ledger", () => {
  const valid = {
    ...production,
    DELETION_LEDGER_PATH: join(tmpdir(), "deletion-ledger.ndjson"),
  };
  assert.equal(readConfig(valid).NODE_ENV, "production");
  for (const invalid of [
    { APP_ORIGIN: "https://site.test/path" },
    { APP_ORIGIN: "https://site.test/" },
    { APP_ORIGIN: "https://user:secret@site.test" },
    { APP_ORIGIN: "http://site.test" },
    { SESSION_SECRET: "short" },
    { DEMO_MODE: "true" },
    { DELETION_LEDGER_PATH: "" },
  ])
    assert.throws(() => readConfig({ ...valid, ...invalid }));
});

test("pool handles idle errors; statement timeout rolls back and leaves the connection usable", async () => {
  assert.ok(pool.listenerCount("error") > 0);
  assert.doesNotThrow(() =>
    pool.emit(
      "error",
      Object.assign(new Error("private"), { code: "TEST_IDLE" }),
    ),
  );
  assert.equal(
    (await pool.query("SHOW statement_timeout")).rows[0].statement_timeout,
    "15s",
  );
  await assert.rejects(
    transaction(pool, async (db) => {
      await db.query("SET LOCAL statement_timeout = '25ms'");
      await db.query("SELECT pg_sleep(0.2)");
    }),
    { code: "57014" },
  );
  assert.equal((await pool.query("SELECT 1 AS ok")).rows[0].ok, 1);
  await assert.rejects(assertMigrations({ query: async () => ({ rows: [] }) }));
  await migrate(pool);
  await assertMigrations(pool);
});

test("production preflight fails closed for demo, missing policy, unverified content and elevated runtime role", async () => {
  const result = await readinessReport(
    pool,
    {
      ...config,
      RETENTION_ENABLED: "false",
      DELETION_LEDGER_PATH: undefined,
      STATIC_DIR: undefined,
    },
    {},
  );
  const checks = Object.fromEntries(
    result.checks.map((check) => [check.id, check.ok]),
  );
  assert.equal(result.ok, false);
  assert.equal(checks["production-mode"], false);
  assert.equal(checks["retention-policy"], false);
  assert.equal(checks["verified-catalog"], false);
  assert.equal(checks["runtime-db-role"], false);
  assert.equal(checks["deletion-ledger"], false);
  assert.equal(checks["recent-encrypted-backup"], false);
  assert.equal(checks["database-migrations"], true);
  const unavailable = await readinessReport(
    {
      query: async () => {
        throw new Error("offline");
      },
    },
    config,
    {},
  );
  assert.equal(unavailable.ok, false);
  assert.equal(
    unavailable.checks.find((check) => check.id === "database-migrations").ok,
    false,
  );
});

test("liveness survives DB outage; readiness tracks worker failure, recovery, staleness and draining", async () => {
  const down = createApp({
    pool: {
      query: async () => {
        throw new Error("secret connection detail");
      },
    },
    config,
  });
  assert.equal((await request(down).get("/api/v1/health/live")).status, 200);
  const outage = await request(down).get("/api/v1/health");
  assert.equal(outage.status, 503);
  assert.deepEqual(outage.body, { ok: false });
  await pool.query("TRUNCATE worker_health");
  const app = createApp({ pool, config: production });
  const ready = () => request(app).get("/api/v1/health/ready");
  assert.equal((await ready()).status, 503);
  await workerTick(pool, config, async () => ({ failed: 0 }));
  assert.equal((await ready()).status, 200);
  await workerTick(pool, config, async () => ({ failed: 1 }));
  assert.equal((await ready()).status, 503);
  await assert.rejects(
    workerTick(pool, config, async () => {
      throw new Error("failure");
    }),
  );
  assert.equal((await ready()).status, 503);
  await workerTick(pool, config, async () => ({ failed: 0 }));
  await pool.query(
    "UPDATE worker_health SET last_success_at=now()-interval '4 minutes'",
  );
  assert.equal((await ready()).status, 503);
  app.locals.draining = true;
  assert.equal((await request(app).get("/api/v1/public/content")).status, 503);
  assert.equal((await request(app).get("/api/v1/health/live")).status, 200);
});

test("shared rate limits increment atomically across processes, expire and avoid raw IP storage", async () => {
  const bucket = `test-${randomBytes(6).toString("hex")}`;
  const a = new PostgresRateLimitStore(pool, bucket),
    b = new PostgresRateLimitStore(pool, bucket);
  a.init({ windowMs: 60000 });
  b.init({ windowMs: 60000 });
  const hits = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      (i % 2 ? a : b).increment("192.0.2.1"),
    ),
  );
  assert.deepEqual(
    hits.map((hit) => hit.totalHits).sort((x, y) => x - y),
    Array.from({ length: 12 }, (_, i) => i + 1),
  );
  const row = (
    await pool.query("SELECT * FROM rate_limit_buckets WHERE bucket=$1", [
      bucket,
    ])
  ).rows[0];
  assert.match(row.key_hash, /^[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(row).includes("192.0.2.1"));
  await pool.query(
    "UPDATE rate_limit_buckets SET reset_at=now()-interval '1 second' WHERE bucket=$1",
    [bucket],
  );
  assert.equal((await b.increment("192.0.2.1")).totalHits, 1);
  await a.resetKey("192.0.2.1");
});

test("same-origin SPA serves deep links, immutable assets and revalidated worker; API errors stay JSON/no-store", async () => {
  const directory = await mkdtemp(join(tmpdir(), "langkahku-runtime-"));
  try {
    await mkdir(join(directory, "assets"));
    await writeFile(
      join(directory, "index.html"),
      "<!doctype html><title>LANGKAHKU</title>",
    );
    await writeFile(
      join(directory, "assets", "app-hashed.js"),
      "export default 1;",
    );
    await writeFile(join(directory, "sw.js"), "// worker");
    const app = createApp({
      pool,
      config: { ...config, STATIC_DIR: directory },
    });
    const spa = await request(app).get("/kenali-diriku");
    assert.equal(spa.status, 200);
    assert.match(spa.headers["content-type"], /text\/html/);
    assert.equal(spa.headers["cache-control"], "no-cache");
    assert.match(
      (await request(app).get("/assets/app-hashed.js")).headers[
        "cache-control"
      ],
      /immutable/,
    );
    assert.equal(
      (await request(app).get("/sw.js")).headers["cache-control"],
      "no-cache",
    );
    for (const path of [
      "/api/v1/missing",
      "/api/missing",
      "/assets/missing.js",
      "/.env",
    ])
      assert.equal((await request(app).get(path)).status, 404, path);
    const malformed = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send("{");
    assert.equal(malformed.status, 400);
    assert.equal(malformed.body.error.code, "INVALID_JSON");
    assert.match(malformed.headers["cache-control"], /no-store/);
    assert.ok(malformed.headers["x-request-id"]);
    const large = await request(app)
      .post("/api/v1/auth/login")
      .send({ value: "x".repeat(140000) });
    assert.equal(large.status, 413);
    assert.equal(large.body.error.code, "PAYLOAD_TOO_LARGE");
  } finally {
    assert.ok(directory.startsWith(join(tmpdir(), "langkahku-runtime-")));
    await rm(directory, { recursive: true, force: true });
  }
});

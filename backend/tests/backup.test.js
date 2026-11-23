import { test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { writeFile, readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { createPool, one } from "../src/config/database.js";
import { backupDatabase, restoreDatabase } from "../src/utils/backup.js";
test("encrypted backup restores into isolated database and reapplies deletion ledger before access", async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || !new URL(url).pathname.endsWith("_test"))
    throw new Error("Database test terpisah wajib.");
  const parsed = new URL(url),
    adminUrl = new URL(url);
  adminUrl.pathname = "/postgres";
  const admin = createPool(adminUrl.toString()),
    source = createPool(url),
    name = `langkahku_${randomBytes(5).toString("hex")}_restore`,
    target = new URL(url);
  target.pathname = `/${name}`;
  const key = randomBytes(32).toString("base64"),
    dir = resolve("../.local/test-backups");
  await mkdir(dir, { recursive: true });
  const ledger = resolve(dir, "deletion-ledger.ndjson");
  try {
    const u = await one(
      source,
      "SELECT id FROM users WHERE role='siswa' LIMIT 1",
    );
    await writeFile(ledger, u ? `${JSON.stringify({ targetId: u.id })}\n` : "");
    const result = await backupDatabase({ url, key, directory: dir });
    assert.equal(
      (await readFile(result.path)).subarray(0, 4).toString(),
      "LKB1",
    );
    assert.equal(
      (await readFile(result.path)).includes(Buffer.from("CREATE TABLE")),
      false,
    );
    await admin.query(`CREATE DATABASE ${name}`);
    const restored = await restoreDatabase({
      url: target.toString(),
      key,
      path: result.path,
      ledger,
    });
    assert.equal(restored.sessionsCleared, true);
    const pool = createPool(target.toString());
    try {
      assert.equal(
        Number((await one(pool, "SELECT count(*) n FROM sessions")).n),
        0,
      );
      if (u)
        assert.equal(
          await one(pool, "SELECT id FROM users WHERE id=$1", [u.id]),
          undefined,
        );
    } finally {
      await pool.end();
    }
    await assert.rejects(() =>
      restoreDatabase({
        url: target.toString(),
        key: randomBytes(32).toString("base64"),
        path: result.path,
        ledger,
      }),
    );
    await assert.rejects(
      () =>
        restoreDatabase({
          url: parsed.toString(),
          key,
          path: result.path,
          ledger,
        }),
      /terisolasi/,
    );
  } finally {
    await source.end();
    await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
    await admin.end();
  }
});

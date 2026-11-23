import { spawnSync } from "node:child_process";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  mkdir,
  writeFile,
  readFile,
  readdir,
  stat,
  unlink,
  rename,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import { createPool, transaction } from "../config/database.js";
const MAGIC = Buffer.from("LKB1");
function keyBytes(value) {
  const key = Buffer.from(value || "", "base64");
  if (key.length !== 32)
    throw new Error(
      "BACKUP_KEY wajib base64 dari 32 byte acak, disediakan melalui environment aman.",
    );
  return key;
}
function pgRun(command, url, input) {
  const parsed = new URL(url),
    bin =
      process.env.PG_BIN ||
      (process.platform === "win32"
        ? "D:/ProgramFile/PostgreSQL/15/bin"
        : "/usr/bin");
  const result = spawnSync(
    resolve(bin, `${command}${process.platform === "win32" ? ".exe" : ""}`),
    command === "pg_dump"
      ? ["--no-owner", "--no-privileges", "--format=plain"]
      : ["--no-psqlrc", "--set", "ON_ERROR_STOP=1"],
    {
      input,
      encoding: undefined,
      windowsHide: true,
      maxBuffer: 256 * 1024 * 1024,
      timeout: 120000,
      env: {
        ...process.env,
        PGHOST: parsed.hostname,
        PGPORT: parsed.port || "5432",
        PGUSER: decodeURIComponent(parsed.username),
        PGPASSWORD: decodeURIComponent(parsed.password),
        PGDATABASE: parsed.pathname.slice(1),
      },
    },
  );
  if (result.status !== 0 || result.error)
    throw new Error(
      `${command} gagal. Periksa koneksi, izin, dan versi PostgreSQL; kredensial tidak dicetak.`,
    );
  return result.stdout;
}
export async function backupDatabase({
  url,
  key,
  directory,
}) {
  if (!directory && process.env.NODE_ENV === "production")
    throw new Error(
      "BACKUP_DIRECTORY wajib ditentukan secara eksplisit di lingkungan produksi.",
    );
  const targetDir = directory || resolve("../.local/backups");
  const bytes = keyBytes(key),
    dump = pgRun("pg_dump", url),
    iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", bytes, iv);
  const encrypted = Buffer.concat([cipher.update(dump), cipher.final()]);
  dump.fill(0);
  await mkdir(targetDir, { recursive: true });
  const name = `langkahku-${new Date().toISOString().replaceAll(":", "-")}-${randomBytes(3).toString("hex")}.lkb`;
  const path = join(targetDir, name);
  const temporary = `${path}.tmp`;
  try {
    await writeFile(
      temporary,
      Buffer.concat([MAGIC, iv, cipher.getAuthTag(), encrypted]),
      { mode: 0o600, flag: "wx", flush: true },
    );
    // A killed writer must never leave a partial .lkb that passes freshness checks.
    await rename(temporary, path);
  } catch (error) {
    await unlink(temporary).catch(() => {});
    throw error;
  }
  for (const file of await readdir(targetDir)) {
    if (!/^langkahku-[0-9T.Z-]+-[a-f0-9]{6}\.lkb$/.test(file)) continue;
    const candidate = join(targetDir, file);
    if ((await stat(candidate)).mtimeMs < Date.now() - 30 * 86400000)
      await unlink(candidate);
  }
  return { path, bytes: encrypted.length };
}
export async function restoreDatabase({ url, key, path, ledger }) {
  if (!new URL(url).pathname.endsWith("_restore"))
    throw new Error(
      "Restore hanya ke database kosong terisolasi berakhiran _restore. Promosi dilakukan setelah pemeriksaan operator.",
    );
  const ledgerText = await readFile(ledger, "utf8");
  const records = ledgerText
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  if (records.some((r) => !/^[0-9a-f-]{36}$/.test(r.targetId)))
    throw new Error("Ledger penghapusan tidak valid.");
  const file = await readFile(path),
    bytes = keyBytes(key);
  if (!file.subarray(0, 4).equals(MAGIC))
    throw new Error("Format backup tidak valid.");
  const decipher = createDecipheriv("aes-256-gcm", bytes, file.subarray(4, 16));
  decipher.setAuthTag(file.subarray(16, 32));
  const dump = Buffer.concat([
    decipher.update(file.subarray(32)),
    decipher.final(),
  ]);
  const pool = createPool(url);
  try {
    const { rows } = await pool.query(
      "SELECT count(*)::int n FROM information_schema.tables WHERE table_schema='public'",
    );
    if (rows[0].n)
      throw new Error(
        "Database restore harus kosong. Database yang berisi data tidak ditimpa.",
      );
    try {
      pgRun("psql", url, dump);
    } finally {
      dump.fill(0);
    }
    await transaction(pool, async (db) => {
      await db.query("TRUNCATE sessions");
      // Never treat a heartbeat restored from a backup as a running worker.
      if (
        (await db.query("SELECT to_regclass('public.worker_health') AS name"))
          .rows[0].name
      )
        await db.query("TRUNCATE worker_health");
      for (const record of records) {
        await db.query(
          "DELETE FROM audit_logs WHERE actor_id=$1 OR target_id=$1",
          [record.targetId],
        );
        await db.query("DELETE FROM users WHERE id=$1 AND role='siswa'", [
          record.targetId,
        ]);
      }
      // Permintaan hapus yang sudah masuk backup juga wajib diselesaikan sebelum layanan dibuka.
      await db.query(
        "DELETE FROM users WHERE role='siswa' AND deletion_requested_at IS NOT NULL",
      );
      await db.query(
        "UPDATE shared_snapshots SET content_copy=NULL WHERE revoked_at IS NOT NULL OR expires_at<=now()",
      );
      await db.query(
        "UPDATE deletion_jobs SET status='completed',completed_at=COALESCE(completed_at,now()) WHERE NOT EXISTS(SELECT 1 FROM users WHERE users.id=target_id)",
      );
    });
    return {
      restored: true,
      tombstonesApplied: records.length,
      sessionsCleared: true,
    };
  } finally {
    await pool.end();
  }
}

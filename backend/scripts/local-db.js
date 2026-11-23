import { randomBytes } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import pg from "pg";

const bin = process.env.PG_BIN || "D:/ProgramFile/PostgreSQL/15/bin";
const data = resolve("../.local/postgres");
const run = (name, args) => {
  const result = spawnSync(
    resolve(bin, `${name}${process.platform === "win32" ? ".exe" : ""}`),
    args,
    {
      encoding: "utf8",
      windowsHide: true,
      stdio: name === "pg_ctl" ? "ignore" : "pipe",
      timeout: 60000,
    },
  );
  if (result.error || result.status !== 0)
    throw new Error(result.stderr || result.error?.message || result.stdout || `${name} gagal (exit ${result.status}). Periksa log cluster proyek.`);
};
if (process.argv[2] === "stop") {
  const status=spawnSync(resolve(bin,'pg_ctl'),['-D',data,'status'],{windowsHide:true,stdio:'ignore'});
  if(status.status===0){run("pg_ctl", ["-D", data, "-m", "fast", "stop"]);console.log('Cluster PostgreSQL proyek dihentikan.');}
  else console.log('Cluster PostgreSQL proyek sudah berhenti.');
} else {
  mkdirSync(resolve("../.local"), { recursive: true });
  if (!existsSync(".env")) {
    const password = randomBytes(32).toString("hex");
    const url = `postgresql://langkahku:${password}@127.0.0.1:55432/`;
    writeFileSync(
      ".env",
      `NODE_ENV=development\nPORT=3001\nDATABASE_URL=${url}langkahku\nTEST_DATABASE_URL=${url}langkahku_test\nSESSION_SECRET=${randomBytes(48).toString("hex")}\nAPP_ORIGIN=http://127.0.0.1:5173\nTRUST_PROXY=0\nDEMO_MODE=false\nRETENTION_ENABLED=false\n`,
    );
  }
  const env = Object.fromEntries(
    readFileSync(".env", "utf8")
      .split(/\r?\n/)
      .filter((x) => x.includes("="))
      .map((x) => [x.slice(0, x.indexOf("=")), x.slice(x.indexOf("=") + 1)]),
  );
  const parsed = new URL(env.DATABASE_URL);
  if (parsed.port !== "55432" || parsed.hostname !== "127.0.0.1")
    throw new Error(
      "db:local hanya untuk cluster proyek 127.0.0.1:55432. Gunakan migrate untuk database Anda.",
    );
  if (!existsSync(resolve(data, "PG_VERSION"))) {
    const pwfile = resolve("../.local/init-password");
    writeFileSync(pwfile, `${parsed.password}\n`);
    try {
      run("initdb", [
        "-D",
        data,
        "-U",
        "langkahku",
        "--encoding=UTF8",
        "--locale=C",
        "--auth=scram-sha-256",
        `--pwfile=${pwfile}`,
      ]);
    } finally {
      rmSync(pwfile, { force: true });
    }
  }
  const status = spawnSync(resolve(bin, "pg_ctl"), ["-D", data, "status"], {
    windowsHide: true,
  });
  if (status.status !== 0)
    run("pg_ctl", [
      "-D",
      data,
      "-l",
      resolve("../.local/postgres.log"),
      "-o",
      "-p 55432 -h 127.0.0.1",
      "-w",
      "start",
    ]);
  const client = new pg.Client({
    connectionString: `${parsed.origin === "null" ? `postgresql://${parsed.username}:${parsed.password}@${parsed.host}` : parsed.origin}/postgres`,
  });
  await client.connect();
  for (const name of ["langkahku", "langkahku_test"]) {
    if (
      !(
        await client.query("SELECT 1 FROM pg_database WHERE datname=$1", [name])
      ).rowCount
    )
      await client.query(`CREATE DATABASE ${name}`);
  }
  await client.end();
  console.log(
    "PostgreSQL proyek siap pada 127.0.0.1:55432; database development/test terpisah. Secret acak tersimpan hanya di backend/.env (diabaikan Git).",
  );
}

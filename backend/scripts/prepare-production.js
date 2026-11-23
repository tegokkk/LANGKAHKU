import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readConfig } from "../src/config/env.js";
import { createPool } from "../src/config/database.js";
import { prepareProduction } from "../src/utils/production-setup.js";

let pool, rl;
try {
  const config = readConfig();
  let input;
  if (stdin.isTTY) {
    rl = createInterface({ input: stdin, output: stdout });
    input = {
      schoolName: await rl.question(
        "Nama sekolah (atau LANGKAHKU sebelum dikonfigurasi): ",
      ),
      username: await rl.question("Username superadmin: "),
      password: await rl.question(
        "Kata sandi (minimal 12 karakter; terminal privat): ",
      ),
    };
  } else {
    let raw = "";
    for await (const chunk of stdin) {
      raw += chunk;
      if (raw.length > 4096) throw new Error("Input terlalu panjang.");
    }
    input = JSON.parse(raw.replace(/^\uFEFF/, ""));
  }
  pool = createPool(config.DATABASE_URL);
  console.log(JSON.stringify(await prepareProduction(pool, input), null, 2));
} catch {
  console.error(
    "Setup gagal; transaksi dibatalkan. Periksa migrasi, input schoolName/username/password (minimal 12 karakter), koneksi, dan akun superadmin yang sudah ada. Secret tidak dicetak.",
  );
  process.exitCode = 1;
} finally {
  rl?.close();
  await pool?.end();
}

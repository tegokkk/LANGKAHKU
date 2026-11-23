import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { z } from "zod";
import { readConfig } from "../src/config/env.js";
import { createPool, transaction, one, audit } from "../src/config/database.js";
import { hashPassword } from "../src/utils/password.js";
import { username, password } from "../src/modules/auth/auth.schema.js";
const config = readConfig(),
  pool = createPool(config.DATABASE_URL),
  rl = stdin.isTTY ? createInterface({ input: stdin, output: stdout }) : null;
try {
  const schema=z.strictObject({schoolName:z.string().trim().min(3).max(180),username,password});
  let input;
  if(rl)input={schoolName:await rl.question('Nama sekolah: '),username:await rl.question('Username superadmin: '),password:await rl.question('Kata sandi baru (minimal 12 karakter; terminal privat): ')};
  else{
    let raw='';for await(const chunk of stdin){raw+=chunk;if(raw.length>4096)throw new Error('Input bootstrap terlalu panjang.');}
    try{input=JSON.parse(raw);}catch{throw new Error('Masukkan satu objek JSON lewat stdin: schoolName, username, password. Input tidak dicetak.');}
  }
  const {schoolName:name,username:login,password:secret}=schema.parse(input);
  const hash = await hashPassword(secret);
  await transaction(pool, async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(61482027)");
    if (
      (await db.query("SELECT id FROM users WHERE role='superadmin'")).rowCount
    )
      throw new Error("Bootstrap hanya untuk superadmin pertama.");
    const school = await one(
      db,
      "INSERT INTO schools(name,public_registration) VALUES($1,true) RETURNING id",
      [name],
    );
    const user = await one(
      db,
      "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,$2,$3,'Administrator','superadmin','approved') RETURNING id",
      [school.id, login, hash],
    );
    await audit(db, user.id, "superadmin_bootstrapped", user.id);
  });
  console.log("Superadmin pertama berhasil dibuat.");
} finally {
  rl?.close();
  await pool.end();
}

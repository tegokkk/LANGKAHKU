import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { readConfig } from "../../src/config/env.js";
import { createPool, one, transaction } from "../../src/config/database.js";
import { hashPassword } from "../../src/utils/password.js";
import { seedContent } from "./content.js";
const config = readConfig();
if (
  config.NODE_ENV !== "test" ||
  config.DEMO_MODE !== "true" ||
  !new URL(config.DATABASE_URL).pathname.endsWith("_test") ||
  process.env.TEST_DATABASE_URL !== config.DATABASE_URL
)
  throw new Error(
    "Fixture ditolak. Hanya NODE_ENV=test, DEMO_MODE=true dan database test terpisah berakhiran _test.",
  );
const pool = createPool(config.DATABASE_URL);
try {
  const existing = await one(
    pool,
    "SELECT id FROM users WHERE username='admin.demo'",
  );
  if (existing) {
    console.log("Seed demo sudah tersedia; tidak menimpa akun/data.");
  } else {
    const secret = randomBytes(20).toString("base64url"),
      hash = await hashPassword(secret);
    await transaction(pool, async (db) => {
      const school = await one(
        db,
        "INSERT INTO schools(name,public_registration,service_settings) VALUES('SMA Ruang Tumbuh (Demo)',true,$1) RETURNING id",
        [
          JSON.stringify({
            hours: "Contoh demo: Senin–Jumat, 08.00–15.00 WIB",
            responseEstimate: "Belum ditetapkan untuk penggunaan nyata",
            helpContact: "",
            responsible: "Petugas demo",
            verifiedAt: "2026-11-22",
          }),
        ],
      );
      const user = async (username, nickname, role, status = "approved") =>
        one(
          db,
          "INSERT INTO users(school_id,username,password_hash,nickname,role,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
          [school.id, username, hash, nickname, role, status],
        );
      await user("admin.demo", "Admin Demo", "superadmin");
      const teacher = await user("bk.demo", "Bu Sari (Demo)", "bk");
      for (let i = 0; i < 33; i++) {
        const u = await user(
          i === 0 ? "siswa.demo" : `siswa.demo.${i}`,
          i === 0 ? "Rani (Demo)" : `Siswa Fiktif ${i}`,
          "siswa",
          i === 30
            ? "pending_approval"
            : i === 31
              ? "rejected"
              : i === 32
                ? "suspended"
                : "approved",
        );
        await db.query(
          "INSERT INTO student_profiles(user_id,grade,semester,age_band) VALUES($1,'XI',1,'under18')",
          [u.id],
        );
        await db.query(
          "INSERT INTO consents(user_id,notice_version,student_agreed_at,guardian_status) VALUES($1,'2026-11-v1',now(),$2)",
          [u.id, i === 30 ? "pending" : "verified"],
        );
        const stage = Math.floor(i / 6);
        await db.query(
          "INSERT INTO progress_states(user_id,reflection,exploration,comparison,plan) VALUES($1,$2,$3,$4,$5)",
          [u.id, stage >= 1, stage >= 2, stage >= 3, stage >= 4],
        );
        if (i === 0) {
          await db.query(
            "INSERT INTO student_documents(user_id,kind,data,version) VALUES($1,'plan',$2,1)",
            [
              u.id,
              JSON.stringify({
                primaryGoal: "Mengenal jalur pendidikan dan keterampilan",
                backupGoal: "Mencoba proyek kecil bersama teman",
                reviewed: false,
                steps: [
                  {
                    id: randomUUID(),
                    semester: "XI-1",
                    title: "Pelajari dua pilihan jalur",
                    note: "Mulai dari katalog publik.",
                    dueDate: "",
                    done: false,
                  },
                  {
                    id: randomUUID(),
                    semester: "XI-1",
                    title: "Catat pertanyaan untuk guru BK",
                    note: "",
                    dueDate: "",
                    done: false,
                  },
                  {
                    id: randomUUID(),
                    semester: "XI-1",
                    title: "Diskusi dengan orang tua",
                    note: "",
                    dueDate: "",
                    done: false,
                  },
                ],
              }),
            ],
          );
          await db.query(
            "INSERT INTO consultations(student_id,teacher_id,school_id,topic,availability,note,idempotency_key,request_hash) VALUES($1,$2,$3,'Pilihan jalur','Contoh demo: setelah kelas','Permintaan fiktif tanpa lampiran.',$4,$5)",
            [
              u.id,
              teacher.id,
              school.id,
              randomUUID(),
              randomBytes(32).toString("hex"),
            ],
          );
        }
      }
      await seedContent(db, school.id);
    });
    await mkdir("../.local", { recursive: true });
    await writeFile(
      process.env.DEMO_CREDENTIALS_PATH || "../.local/demo-credentials.txt",
      `DATA FIKTIF — hanya untuk pengembangan lokal.\nUsername: admin.demo / bk.demo / siswa.demo\nKata sandi acak untuk ketiga akun: ${secret}\n\nStatus demo tambahan: siswa.demo.30 (pending), .31 (rejected), .32 (suspended).\nJangan gunakan akun atau kata sandi demo untuk produksi.\n`,
    );
    console.log(
      "Seed fiktif berhasil. Kredensial acak disimpan di .local/demo-credentials.txt (diabaikan Git), tidak dicetak ke log.",
    );
  }
} finally {
  await pool.end();
}

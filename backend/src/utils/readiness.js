import { constants } from "node:fs";
import { access, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { assertMigrations } from "./runtime.js";

// Operational evidence only. School consent/content approval must still be signed off.
export async function readinessReport(pool, config, environment = process.env) {
  const checks = [];
  const add = (id, ok, action) => checks.push({ id, ok: Boolean(ok), action });
  add(
    "production-mode",
    config.NODE_ENV === "production" && config.DEMO_MODE === "false",
    "Gunakan NODE_ENV=production dan DEMO_MODE=false.",
  );
  add(
    "https-origin",
    config.APP_ORIGIN.startsWith("https://"),
    "Konfigurasikan domain HTTPS dan reverse proxy.",
  );
  add(
    "retention-policy",
    config.RETENTION_ENABLED === "true",
    "Sahkan jadwal retensi sekolah, lalu aktifkan retensi otomatis.",
  );
  try {
    await assertMigrations(pool);
    add("database-migrations", true, "Migrasi database lengkap.");
  } catch {
    add(
      "database-migrations",
      false,
      "Jalankan migrasi sebelum menerima trafik.",
    );
    return { ok: false, checks };
  }
  const {
    rows: [worker],
  } = await pool.query(
    "SELECT 1 FROM worker_health WHERE name='retention' AND failed=false AND last_success_at>now()-interval '3 minutes'",
  );
  add(
    "retention-worker",
    worker,
    "Jalankan worker dan periksa heartbeat/penghapusan gagal.",
  );
  const {
    rows: [role],
  } = await pool.query(
    "SELECT rolsuper,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user",
  );
  const {
    rows: [ddl],
  } = await pool.query(
    "SELECT has_schema_privilege(current_user,'public','CREATE') AS can_create",
  );
  add(
    "runtime-db-role",
    role &&
      !role.rolsuper &&
      !role.rolcreatedb &&
      !role.rolcreaterole &&
      !ddl.can_create,
    "Gunakan role runtime tanpa superuser, CREATE DATABASE/ROLE, atau CREATE pada schema public.",
  );
  const {
    rows: [dummy],
  } = await pool.query(`SELECT
    EXISTS(SELECT 1 FROM schools WHERE name='SMA Ruang Tumbuh (Demo)') OR
    EXISTS(SELECT 1 FROM users WHERE username IN ('admin.demo','bk.demo','siswa.demo') OR username ~ '^siswa[.]demo[.][0-9]+$') OR
    EXISTS(SELECT 1 FROM content_items WHERE demo=true) AS present`);
  add(
    "no-dummy-data",
    !dummy.present,
    "Jalankan setup:production untuk menghapus sekolah, akun, dan materi demo sebelum rilis.",
  );
  const { rows: schools } = await pool.query(`SELECT s.id,s.service_settings,
    EXISTS(SELECT 1 FROM users WHERE school_id=s.id AND role='superadmin' AND status='approved' AND deletion_requested_at IS NULL) AS admin,
    EXISTS(SELECT 1 FROM users WHERE school_id=s.id AND role='bk' AND status='approved' AND deletion_requested_at IS NULL) AS bk,
    (SELECT count(DISTINCT category) FROM content_items WHERE school_id=s.id AND status='published' AND demo=false AND reviewed_at<=CURRENT_DATE AND valid_until>=CURRENT_DATE AND reviewer<>'' AND jsonb_array_length(sources)>0)::int AS categories,
    EXISTS(SELECT 1 FROM users u JOIN student_profiles p ON p.user_id=u.id LEFT JOIN cohorts c ON c.id=p.cohort_id WHERE u.school_id=s.id AND u.role='siswa' AND u.status IN ('approved','suspended') AND u.deletion_requested_at IS NULL AND c.deletion_at IS NULL) AS missing_retention
    FROM schools s WHERE public_registration=true`);
  add(
    "school-registration",
    schools.length > 0 && schools.every((school) => school.admin && school.bk),
    "Setiap sekolah yang membuka pendaftaran memerlukan superadmin dan guru BK aktif.",
  );
  add(
    "verified-catalog",
    schools.length > 0 && schools.every((school) => school.categories === 4),
    "Terbitkan materi non-demo bersumber dan masih berlaku untuk keempat kategori jalur di tiap sekolah.",
  );
  const today = new Date().toISOString().slice(0, 10);
  add(
    "school-services",
    schools.length > 0 &&
      schools.every(
        ({ service_settings: s }) =>
          [s.hours, s.responseEstimate, s.helpContact, s.responsible].every(
            (value) => typeof value === "string" && value.trim().length > 0,
          ) &&
          /^\d{4}-\d{2}-\d{2}$/.test(s.verifiedAt || "") &&
          s.verifiedAt <= today,
      ),
    "Guru BK perlu mengisi kontak bantuan, jam layanan, estimasi respons, penanggung jawab, dan tanggal verifikasi aktual.",
  );
  add(
    "student-retention-dates",
    schools.every((school) => !school.missing_retention),
    "Hubungkan siswa aktif ke angkatan dengan tanggal penghapusan yang disahkan.",
  );
  try {
    if (!config.DELETION_LEDGER_PATH) throw new Error();
    const ledger = resolve(config.DELETION_LEDGER_PATH);
    if (!(await stat(ledger)).isFile()) throw new Error();
    await access(ledger, constants.R_OK | constants.W_OK);
    add(
      "deletion-ledger",
      true,
      "Ledger tersedia; replikasi eksternal dan uji restore tetap wajib.",
    );
  } catch {
    add(
      "deletion-ledger",
      false,
      "Sediakan ledger penghapusan persisten yang dapat dibaca/ditulis worker dan disalin di luar backup database.",
    );
  }
  if (config.STATIC_DIR) {
    try {
      await access(resolve(config.STATIC_DIR, "index.html"), constants.R_OK);
      add("frontend-build", true, "Build SPA tersedia.");
    } catch {
      add(
        "frontend-build",
        false,
        "Build frontend dan atur STATIC_DIR dengan benar.",
      );
    }
  } else
    add(
      "frontend-build",
      false,
      "Atur STATIC_DIR untuk deployment satu origin, atau verifikasi hosting frontend terpisah secara manual.",
    );
  // The API container intentionally does not receive BACKUP_KEY. Check freshness on disk.
  try {
    const { readdir } = await import("node:fs/promises");
    const directory = environment.BACKUP_DIRECTORY;
    const files = (await readdir(directory)).filter((file) =>
      /^langkahku-[0-9T.Z-]+-[a-f0-9]{6}\.lkb$/.test(file),
    );
    const dates = await Promise.all(
      files.map(async (file) => (await stat(resolve(directory, file))).mtimeMs),
    );
    add(
      "recent-encrypted-backup",
      dates.some((time) => Date.now() - time < 26 * 60 * 60 * 1000),
      "Backup terenkripsi berusia kurang dari 26 jam wajib; uji restore dan salin off-site.",
    );
  } catch {
    add(
      "recent-encrypted-backup",
      false,
      "Jalankan backup terenkripsi dan sediakan BACKUP_DIRECTORY persisten.",
    );
  }
  return { ok: checks.every((check) => check.ok), checks };
}

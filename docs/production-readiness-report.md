# Laporan Pengujian Kesiapan Production — LANGKAHKU

> Pembaruan implementasi pada 22 November 2026 tersedia di [audit hardening terbaru](production-hardening-2026-11-22.md). Temuan pool, timeout, heartbeat worker, rate limit lintas proses, dan paket deployment pada laporan historis ini telah ditindaklanjuti. Status operasional tetap NO-GO sampai staging dan validasi sekolah selesai; angka pengujian terbaru mengikuti laporan pembaruan tersebut.

| Atribut | Keterangan |
| --- | --- |
| **Keputusan Akhir** | **NO-GO** (belum layak rilis produksi / menerima data siswa nyata) |
| **Tanggal Audit** | 22 November 2026 |
| **Workspace** | `D:\PEOJECTTTTTTT\LANGKAHKU` |
| **Lingkungan Uji** | Windows, Node.js `v24.21.0`, npm `11.19.0`, PostgreSQL `15.19` (cluster proyek terisolasi `127.0.0.1:55432`), Headless Chrome (CDP) |
| **Database Uji** | `langkahku_test` (terisolasi dari database dev `langkahku`; tidak ada database production yang disentuh) |
| **Cakupan Pengujian** | Audit dokumen & kode, inventaris lockfile & `npm audit`, lint/test/build backend & frontend, uji konfigurasi `NODE_ENV=production` & `DEMO_MODE=false`, uji keamanan/akses/privasi API, uji beban pilot 30 sesi bersamaan, serta audit build produksi PWA/luring/zoom 200%/kinerja Fast 4G |

---

## Ringkasan Keputusan: **NO-GO**

Secara **rekayasa perangkat lunak inti (aplikasi lokal terisolasi)**, LANGKAHKU menunjukkan kualitas fondasi yang sangat kuat: seluruh 15 pengujian integrasi backend PostgreSQL, 8 pengujian frontend, lint, build produksi, audit dependensi (`0` kerentanan), validasi konfigurasi produksi, isolasi privasi/peran, backup AES-256-GCM + restore tombstone terisolasi, PWA luring tanpa cache data pribadi, serta uji beban pilot 30 sesi bersamaan (`0%` error) **LULUS**.

Namun keputusan rilis adalah **NO-GO** karena **tiga gerbang wajib rilis produksi belum terpenuhi / belum terverifikasi**:
1. **Infrastruktur produksi & staging belum tersedia** (hosting, HTTPS/domain, reverse proxy, secret manager, penyimpanan eksternal persisten untuk `DELETION_LEDGER_PATH` dan backup `.lkb`, supervisor worker `jobs:work`, serta monitoring/alerting).
2. **Tata kelola & kebijakan operasional sekolah belum disahkan** (prosedur izin wali nyata, kebijakan retensi angkatan/pendaftaran `RETENTION_ENABLED=true`, pemulihan manual bila kode hilang, petugas penanggung jawab insiden, dan kontak/jam layanan BK aktual).
3. **Konten non-demo terverifikasi & validasi ahli/pengguna belum terlaksana** — pada mode produksi (`DEMO_MODE=false`), katalog publik mengembalikan **0 materi** karena seluruh materi awal berstatus `demo=true`, dan validasi ahli BK/media serta uji 5–8 siswa belum dilakukan.

Selain itu, ditemukan beberapa **kelemahan hardening backend** (penanganan error idle `pg.Pool`, timeout query, observabilitas worker & `/health`) yang perlu diperbaiki sebelum uji staging.

---

## 1. Inventaris dan Baseline

### 1.1 Runtime & Struktur Aplikasi
- **Runtime**: Node.js `v24.21.0`, npm `11.19.0`, PostgreSQL `15.19`.
- **Struktur**: Dua aplikasi JavaScript ES Modules terpisah (`backend/` dan `frontend/`) dengan lockfile masing-masing (`backend/package-lock.json`, `frontend/package-lock.json`). Root workspace belum diinisialisasi sebagai repositori Git.
- **Versi Dependency Terkunci (dari Lockfile)**:
  - **Backend**: `express@5.3.0`, `pg@8.23.1`, `argon2@0.44.0`, `express-session@1.19.0`, `connect-pg-simple@10.0.0`, `helmet@8.3.0`, `express-rate-limit@8.7.5`, `pino@10.4.0`, `zod@4.6.7`, `supertest@7.3.2`, `eslint@9.39.5`, `prettier@3.10.1`.
  - **Frontend**: `react@19.3.1`, `react-dom@19.3.1`, `react-router-dom@7.18.6`, `vite@7.3.8`, `tailwindcss@4.3.5`, `@tailwindcss/vite@4.3.5`, `framer-motion@14.14.0`, `lucide-react@0.468.0`, `@fontsource/plus-jakarta-sans@5.3.0`, `vitest@4.1.12`, `@testing-library/react@16.3.3`, `jsdom@27.2.0`.

### 1.2 Cara Menjalankan Komponen & Pengujian
| Komponen / Tugas | Perintah |
| --- | --- |
| API Server | `cd backend && npm run start` (dev: `npm run dev`) |
| Frontend Build & Preview | `cd frontend && npm run build && npm run preview` |
| Migrasi Database | `cd backend && npm run migrate` (advisory lock `61482026`, tabel `schema_migrations`) |
| Worker Retensi/Hapus | `cd backend && npm run jobs:work` (interval 60 detik; sekali jalan: `npm run jobs:retention`) |
| Backup Terenkripsi | `cd backend && npm run backup` (membutuhkan `BACKUP_KEY`, `BACKUP_DIRECTORY`, `PG_BIN`) |
| Restore Terisolasi | `cd backend && npm run restore` (membutuhkan `RESTORE_DATABASE_URL` berakhiran `_restore`, `BACKUP_FILE`, `BACKUP_KEY`, `DELETION_LEDGER_PATH`) |
| Pengujian Otomatis | `backend`: `npm run lint && npm test` · `frontend`: `npm run lint && npm test && npm run build` |

### 1.3 Hasil Baseline Otomatis & Audit Kerentanan
| Pemeriksaan | Status | Bukti Aktual |
| --- | --- | --- |
| `backend: npm audit` | **LULUS** | Exit code `0` (`0` kerentanan). |
| `frontend: npm audit` | **LULUS** | Exit code `0` (`0` kerentanan). |
| `backend: npm run lint` | **LULUS** | Exit code `0`, tanpa error/peringatan. |
| `backend: npm test` | **LULUS** | **15/15 pengujian lulus** (`0` gagal, durasi `15.27s`) terhadap `langkahku_test`. |
| `frontend: npm run lint` | **LULUS** | Exit code `0`, tanpa error/peringatan. |
| `frontend: npm test` | **LULUS** | **4 file / 8 pengujian lulus** (`api.test.js`, `time.test.js`, `service-worker.test.js`, `privacy.test.jsx`). |
| `frontend: npm run build` | **LULUS** | `vite build` + `build-worker.js` menghasilkan `dist/` berhash (termasuk `dist/sw.js` allowlist shell publik). |

---

## 2. Daftar Pemeriksaan Menyeluruh (8 Area)

### Area 1: Inventaris & Baseline
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Lockfile, lint, unit/integration test, build produksi | **LULUS** | Seluruh perintah berjalan bersih dengan exit code `0`. |
| Audit kerentanan dependensi | **LULUS** | `npm audit` backend & frontend melaporkan `0` kerentanan. |
| Layanan eksternal & lingkungan staging/production | **BELUM TERVERIFIKASI** | Belum ada hosting, staging, domain, atau layanan monitoring yang dikonfigurasi. |

### Area 2: Konfigurasi Production
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Validasi `NODE_ENV=production` & `DEMO_MODE=false` | **LULUS** | `readConfig()` ([env.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/config/env.js#L16-L27)) terbukti menolak `DEMO_MODE=true`, `APP_ORIGIN` non-HTTPS, `SESSION_SECRET` `<32` karakter atau berawalan `replace-`, serta `DELETION_LEDGER_PATH` kosong. |
| Secret tidak masuk bundle frontend | **LULUS** | Pemindaian seluruh berkas `frontend/dist/**/*.{js,css,html,json,webmanifest}` menemukan `0` pola secret, connection string, atau kredensial demo. |
| HTTPS, origin, cookie `Secure/HttpOnly/SameSite`, `TRUST_PROXY` | **LULUS** | Uji langsung Express dalam mode produksi (`TRUST_PROXY=1`, header `X-Forwarded-Proto: https`) memancarkan cookie `langkahku.sid` dengan flag `HttpOnly; Secure; SameSite=Lax`, header `Helmet` (`nosniff`, `CSP`, tanpa `X-Powered-By`), `Cache-Control: no-store, private`, serta menolak `Origin` lintas domain (`403 ORIGIN_INVALID`). |
| Koneksi DB, pool, timeout, error handling | **LULUS (Setelah Perbaikan PR-04)** | `pg.Pool` ([database.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/config/database.js#L3-L22)) kini mengatur `max: 15`, `connectionTimeoutMillis: 5000`, `idleTimeoutMillis: 30000`, `statement_timeout: 15000`, `query_timeout: 20000`, `idle_in_transaction_session_timeout: 30000`, dan memasang listener `pool.on("error", ...)` tanpa mencetak kredensial. Hak akses user DB produksi minimum tetap menunggu provisioning DB produksi. |
| Migrasi terlacak & idempoten | **LULUS** | Re-eksekusi `migrate(pool)` dua kali berturut-turut pada `langkahku_test` lulus tanpa error (2 migrasi tercatat di `schema_migrations`, memakai `pg_advisory_xact_lock`). |
| Seed demo ditolak di produksi & konten demo tersembunyi | **LULUS** | `tests/seed.test.js` lulus menolak seed saat `NODE_ENV=production`. Uji langsung `/api/v1/public/content` saat `DEMO_MODE=false` mengembalikan `0` item demo (`demo items leaked: false`). |
| Penyimpanan ledger & backup persisten, supervisor worker | **BELUM TERVERIFIKASI** | Di lingkungan lokal hanya memakai path lokal; penyimpanan persisten eksternal, replikasi backup/ledger, dan supervisor proses (`systemd`/container restart) belum tersedia di infrastruktur produksi. |

### Area 3: Autentikasi, Role, dan Approval
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Registrasi hanya membuat `siswa` + `pending_approval`; tolak field admin | **LULUS** | Terverifikasi di `auth.routes.js` & `tests/integration.test.js` (`role`/`status` ditolak oleh `z.strictObject`). |
| Satu login mengarahkan 3 role berdasarkan server | **LULUS** | `destination(u)` di [access.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/middleware/access.js#L16-L23) mengarahkan `superadmin`, `bk`, `siswa` aktif, dan `/status` untuk akun terbatas. |
| Gate `pending`, `rejected`, `suspended`, & izin wali belum lengkap | **LULUS** | `authorize()` ([access.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/middleware/access.js#L66-L75)) menolak seluruh API privat (`403 ACCOUNT_RESTRICTED`) hingga akun `approved`, `student_agreed_at` valid, dan wali `verified`/`not_required`. Approval akun tidak mengubah `guardian_status`. |
| Keputusan hanya oleh superadmin, transaksi konsisten, konflik/klik ganda | **LULUS** | `SELECT ... FOR UPDATE` + cek `version` di [approvals.routes.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/modules/approvals/approvals.routes.js#L126-L154) memastikan 2 keputusan bersamaan menghasilkan tepat 1 sukses dan 1 konflik (`409 VERSION_CONFLICT`), dengan alasan penolakan & riwayat tersimpan. |
| Suspend/aktifkan kembali & proteksi superadmin terakhir | **LULUS** | Kunci baris sekolah (`SELECT id FROM schools WHERE id=$1 FOR UPDATE`), menolak akun non-approved/suspended dan melindungi superadmin aktif terakhir; sesi langsung dicabut (`revokeSessions`). |
| Rotasi sesi, logout, pemulihan sekali pakai, CSRF, origin, rate limit | **LULUS** | `req.session.regenerate` saat login/register/recover, `timingSafeEqual` untuk CSRF & hash kode pemulihan, `clearCookie` konsisten, dan rate limit aktif (`30/15m` auth, `20/15m` rights). Catatan: store rate-limit masih in-memory (PR-06). |

### Area 4: Privasi dan Keamanan Data
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Jurnal 100% privat; superadmin & BK tidak memiliki akses baca | **LULUS** | Endpoint `/student/journals*` dilindungi `authorize("siswa")` + filter `user_id=$1`. Tidak ada endpoint baca jurnal untuk BK/superadmin. |
| Isolasi lintas siswa, guru, sekolah, dan IDOR | **LULUS** | Terverifikasi di `tests/integration.test.js` untuk dokumen, jurnal, konsultasi, agregat, dan kurasi konten antar sekolah/guru. |
| Perlindungan SQL injection, XSS, error & redaksi log | **LULUS** | Seluruh query menggunakan parameter (`$1..$n`); uji probe SQLi (`' OR 1=1; DROP TABLE users; --`) & UUID rusak menghasilkan respons aman (`200`/`422`) tanpa stack trace. `content.schema.js` menolak skema non-HTTPS (`javascript:`). `pino` menyensor `password`, `cookie`, `authorization`, `body`, `headers`. |
| Mekanisme berbagi (checkbox kosong, tanpa lampiran, pratinjau, snapshot, cabut/kedaluwarsa, tolak jurnal) | **LULUS** | Terverifikasi di `frontend/src/tests/privacy.test.jsx` dan `backend/tests/integration.test.js`: checkbox kosong bawaan, pratinjau memeriksa versi dokumen (`409 SNAPSHOT_CONFLICT` jika berubah), jurnal ditolak oleh enum `sections`, perubahan sumber tidak mengubah `content_copy`, serta pencabutan/kedaluwarsa mengosongkan `data` pada pembacaan berikutnya. |

### Area 5: Fitur dan Integritas
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Beranda, refleksi 6 langkah, katalog, matriks 2–3 opsi, rencana 3 langkah, jurnal | **LULUS** | Seluruh alur CRUD berversi diuji pada PostgreSQL (`tests/integration.test.js`) dan UI React; tanpa skor rekomendasi otomatis; konflik 2 tab mengembalikan `409 VERSION_CONFLICT`. |
| Konsultasi (idempotensi, jadwal, status, batal), kurasi & layanan BK | **LULUS** | Kunci idempotensi mencegah duplikasi konsultasi; draf/arsip tidak muncul di endpoint publik; kurasi mensyaratkan sumber HTTPS, peninjau, tanggal tinjau, dan batas berlaku. |
| Agregat kelompok kecil & sel pelengkap | **LULUS** | [content.routes.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/modules/content/content.routes.js#L213-L250) menolak parameter query filter individu (`422`), mensyaratkan total `>= 10` dan setiap sel `>= 5` tanpa membocorkan total/sel pelengkap saat `suppressed: true`. |
| Status simpan UI berbasis konfirmasi server | **LULUS** | Wrapper [api.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/frontend/src/services/api.js) melempar `ApiError` saat gagal/luring sehingga UI menampilkan error dan tidak mengklaim tersimpan sebelum respons HTTP sukses. |

### Area 6: Ekspor, Penghapusan, Retensi, dan Restore
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Ekspor re-autentikasi, jurnal opt-in, tanpa URL publik/cache | **LULUS** | `POST /student/export` mensyaratkan kata sandi ulang, respons berheader `Cache-Control: no-store, private` & `Content-Disposition: attachment`, diunduh lokal lewat Blob memori lalu direvoke. |
| Hapus per fitur & hapus akun (blokir segera + job + retry) | **LULUS** | Hapus fitur mencabut snapshot terkait; hapus akun segera menandai `deletion_requested_at`, mencabut sesi & snapshot, mengantrekan `deletion_jobs`, dan job gagal dicoba ulang oleh worker. |
| Retensi berbasis kebijakan sekolah | **BELUM TERVERIFIKASI** | Mesin retensi lulus uji lokal, namun `RETENTION_ENABLED=false` secara bawaan karena jadwal retensi angkatan/pendaftaran/konsultasi belum disahkan oleh sekolah. |
| Backup AES-256-GCM & restore database kosong + replay tombstone | **LULUS (Lokal) / BELUM TERVERIFIKASI (Produksi)** | `tests/backup.test.js` membuktikan enkripsi AES-256-GCM tanpa dump plaintext, penolakan key salah, restore hanya ke DB kosong `*_restore`, pembersihan sesi, dan replay tombstone dari `DELETION_LEDGER_PATH`. Namun jadwal backup otomatis, penyimpanan kunci terpisah di secret manager, dan uji restore staging/produksi belum tersedia. |

### Area 7: UI, PWA, Aksesibilitas, dan Kinerja
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Responsif 1280/1440/1920 px & mobile 390/360 px | **LULUS** | Terverifikasi nol overflow horizontal (`scrollWidth <= innerWidth`) pada seluruh 9 halaman publik dan `/beranda` siswa. |
| Zoom 200%, skip-link, landmark, alt/label, `prefers-reduced-motion` | **LULUS (Otomatis) / BELUM TERVERIFIKASI (Pembaca Layar Penuh)** | Uji headless Chrome pada zoom 200% (`720px` @ DPR 2): `overflowX = -15`, `hasSkipLink = true`, `hasMainLandmark = true`, `imgsMissingAlt = 0`, `btnsNoLabel = 0`. `prefers-reduced-motion: reduce` langsung menampilkan seluruh 7 blok `.reveal-block`. Audit pembaca layar (NVDA/VoiceOver) dan perangkat fisik belum dilakukan. |
| PWA luring & audit cache/localStorage | **LULUS** | Pada build produksi (`vite preview`), Service Worker aktif (`langkahku-shell-04cbc811ce61`, `langkahku-public-selected-v1`), reload saat offline menampilkan halaman & banner luring, `privateInCache = false`, `localStorageKeys = []` (`privateInLS = false`), dan tidak ada pengiriman pribadi otomatis saat daring kembali. |
| Cetak / PDF A4 tanpa jurnal otomatis | **LULUS** | Media `@media print` menyembunyikan `.topbar`, `footer`, dan `.staff-sidebar`, menampilkan `.print-only` tanpa teks jurnal privat; PDF lembar kerja 7 halaman A4 tersedia di `frontend/public/worksheets/lembar-kerja-langkahku.pdf`. |
| Kinerja Jaringan (Fast 4G: 1.6 Mbps / 750 Kbps / 150 ms RTT) | **LULUS** | Build produksi halaman utama: `DOMContentLoaded = 1146 ms`, `Load = 1146 ms`, `FCP = 1292 ms`, total transfer `182 KB` (11 resource) — sangat ringan untuk target kuota terbatas PRD. |
| Uji Beban Pilot (30 Sesi Bersamaan pada `langkahku_test`) | **LULUS** | **240 request** (termasuk 30 login Argon2id paralel + tulis refleksi PostgreSQL + baca jurnal + logout): **Error rate `0.00%` (`0/240`)**, durasi total `1842 ms` (`130.3 req/s`), latensi API non-login `p50 = 116.4 ms` / `p95 = 370.8 ms` / `max = 432.4 ms`, latensi login Argon2id paralel `p50 = 685.0 ms` / `p95 = 875.6 ms`, puncak koneksi DB `15/15`, memori proses `RSS = 112.0 MB` (`heapUsed = 32.3 MB`). |

### Area 8: Kesiapan Operasional
| Item | Status | Alasan / Bukti |
| --- | --- | --- |
| Hosting, staging, domain, HTTPS, lokasi penyimpanan | **BELUM TERVERIFIKASI** | Belum dipilih dan belum diprovisioning (`task.md` M01–M02 terbuka). |
| Monitoring error, health check, worker, kapasitas, backup | **BELUM TERVERIFIKASI** | Belum ada sistem monitoring/alerting eksternal maupun supervisor worker (`task.md` M04 terbuka). |
| Penanggung jawab operasi & insiden, kontak/jam layanan aktual | **BELUM TERVERIFIKASI** | Belum ditetapkan pihak sekolah (`task.md` A07, J09, M06 terbuka). |
| Kebijakan retensi & persetujuan wali sekolah | **BELUM TERVERIFIKASI** | Belum disahkan secara resmi (`task.md` I05, A07 terbuka). |
| Tinjauan konten Indonesia & validasi ahli/pengguna | **BELUM TERVERIFIKASI** | Belum ada hasil validasi ahli BK/media maupun uji 5–8 siswa (`task.md` E05–E06, L02–L03, L05, L07 terbuka). |
| Dokumentasi prosedur rilis, rollback, restore, panduan peran | **LULUS** | Tersedia lengkap di [docs/operations.md](file:///d:/PEOJECTTTTTTT/LANGKAHKU/docs/operations.md) dan [docs/validation-protocol.md](file:///d:/PEOJECTTTTTTT/LANGKAHKU/docs/validation-protocol.md). |

---

## 3. Daftar Temuan Berdasarkan Dampak

### KRITIS (Penghambat Rilis Produksi)

#### PR-01 — Lingkungan Produksi, Staging, Penyimpanan Persisten Ledger/Backup, dan Supervisor Worker Belum Tersedia
- **Acuan**: `PRD.md`, `docs/operations.md`, `task.md` (M01, M02, M04, M05, M07).
- **Skenario**: Memeriksa kesiapan infrastruktur untuk menjalankan aplikasi dengan data siswa nyata.
- **Hasil yang Diharapkan**: Tersedia staging & production terpisah dengan HTTPS/domain, reverse proxy, secret manager, penyimpanan eksternal terenkripsi untuk `DELETION_LEDGER_PATH` dan backup `.lkb`, supervisor proses worker `jobs:work`, serta monitoring error/kapasitas.
- **Hasil Aktual**: Hanya berjalan di mesin pengembangan lokal (`127.0.0.1`, `NODE_ENV=development`, `DEMO_MODE=true`). Belum ada bukti deployment staging, sertifikat TLS, jadwal backup produksi, atau monitoring.
- **Langkah Reproduksi**: Periksa `backend/.env` dan `task.md` bagian M01–M07.

#### PR-02 — Kebijakan Operasional Sekolah, Izin Wali, Retensi, dan Kontak Bantuan Aktual Belum Disahkan
- **Acuan**: `PRD.md` (Bagian 3.3, 8.2), `task.md` (A07, C09, I05, J09, M06).
- **Skenario**: Memeriksa kesiapan tata kelola data sebelum menerima data siswa di bawah 18 tahun.
- **Hasil yang Diharapkan**: Sekolah mengesahkan prosedur verifikasi izin wali, jadwal retensi kelulusan/pendaftaran (`RETENTION_ENABLED=true`), prosedur pemulihan akun jika kode pemulihan hilang, petugas penanggung jawab insiden, serta kontak/jam layanan BK aktual yang terverifikasi.
- **Hasil Aktual**: `RETENTION_ENABLED=false` secara bawaan; data kontak & jadwal yang ada di DB pengembangan adalah data demo/contoh.
- **Langkah Reproduksi**: Periksa `backend/.env.example`, `docs/verification.md` baris 66, dan `task.md` bagian A07/I05/M06.

#### PR-03 — Katalog Publik Kosong pada Mode Produksi (`DEMO_MODE=false`) & Validasi Ahli/Pengguna Belum Terlaksana
- **Acuan**: `PRD.md` (Bagian 6, S5), `task.md` (E05, E06, L02, L03, L05, L07), [content.routes.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/modules/content/content.routes.js#L33).
- **Skenario**: Menjalankan aplikasi dengan `NODE_ENV=production` dan `DEMO_MODE=false`, lalu meminta `GET /api/v1/public/content`.
- **Hasil yang Diharapkan**: Minimal 6 kartu jalur, 18 kartu profesi, Cerita Langkah berizin, dan lembar kerja non-demo telah ditinjau ahli BK/media dan siap tampil; hasil uji terbatas (5–8 siswa + guru BK) tersedia.
- **Hasil Aktual**: `GET /api/v1/public/content` mengembalikan `0` item pada `DEMO_MODE=false` karena seluruh konten yang ada saat ini berstatus `demo=true`. Belum ada laporan hasil validasi ahli maupun uji peserta nyata.
- **Langkah Reproduksi**: Jalankan query `GET /api/v1/public/content` dengan `DEMO_MODE=false` pada database pengujian/bersih.

---

### TINGGI (Hardening Teknis — **DIPERBAIKI**)

#### PR-04 — `pg.Pool` Event Listener `error` & Batas Timeout (**DIPERBAIKI**)
- **File & Baris**: [backend/src/config/database.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/config/database.js#L3-L22).
- **Status**: **DIPERBAIKI** — `pool.on("error", ...)` kini terpasang dengan log aman (`database_idle_error`), serta `statement_timeout: 15000`, `query_timeout: 20000`, dan `idle_in_transaction_session_timeout: 30000` telah aktif.

#### PR-05 — Observabilitas Worker & Validasi Path Backup Lintas-OS (**DIPERBAIKI**)
- **File & Baris**: [backend/scripts/job-worker.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/scripts/job-worker.js#L16-L28) dan [backend/src/utils/backup.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/utils/backup.js#L23-L75).
- **Status**: **DIPERBAIKI** — `job-worker.js` kini memakai `workerTick` (mencatat `worker_health` untuk `/api/v1/health/ready`) dan mencatat kode error non-sensitif pada kegagalan; `backup.js` mendukung `/usr/bin` pada Linux, penulisan atomik `.tmp -> .lkb`, serta menolak fallback direktori lokal bila `NODE_ENV=production` dan `BACKUP_DIRECTORY` kosong.

---

### SEDANG

#### PR-06 — Rate Limiter Memakai Store In-Memory
- **File & Baris**: [backend/src/modules/auth/auth.routes.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/modules/auth/auth.routes.js#L36-L47), [backend/src/modules/data-rights/rights.routes.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/modules/data-rights/rights.routes.js#L11-L23).
- **Skenario**: Menskalakan backend ke lebih dari 1 replika/proses di balik load balancer.
- **Hasil yang Diharapkan**: Batas percobaan login/pemulihan/ekspor konsisten lintas replika, atau topologi pilot dibatasi secara eksplisit pada 1 instance backend.
- **Hasil Aktual**: Menggunakan default `MemoryStore` dari `express-rate-limit`. Memadai untuk pilot single-instance (sesuai kapasitas 30 sesi), namun akan kehilangan konsistensi jika dijalankan multi-instance.

#### PR-07 — Pemisahan Health Check Liveness & Readiness Worker (**DIPERBAIKI**)
- **File & Baris**: [backend/src/app.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/app.js#L44-L61).
- **Status**: **DIPERBAIKI** — Tersedia `/api/v1/health/live` dan `/api/v1/health/ready` yang memeriksa `draining`, `SELECT 1` PostgreSQL, serta kesegaran heartbeat `worker_health` (`retention` dalam 3 menit terakhir) pada mode produksi.

#### PR-08 — Pengujian Pembaca Layar & Perangkat Fisik Android/iOS Belum Dilakukan
- **Acuan**: `PRD.md`, `task.md` (J08, J10).
- **Skenario**: Menguji aksesibilitas nyata dengan NVDA/VoiceOver serta instalasi PWA & cetak dari ponsel Android/iOS.
- **Hasil yang Diharapkan**: Pengujian langsung pada pembaca layar dan minimal satu perangkat mobile fisik tercatat tanpa hambatan tugas inti.
- **Hasil Aktual**: Baru diverifikasi melalui inspeksi DOM, keyboard, zoom 200%, dan emulasi Chrome headless.

---

### RENDAH

#### PR-09 — Filter `demo=false` pada `POST /api/v1/student/exploration` (**DIPERBAIKI**)
- **File & Baris**: [backend/src/modules/student/student.routes.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/modules/student/student.routes.js#L87-L93) & [backend/src/app.js](file:///d:/PEOJECTTTTTTT/LANGKAHKU/backend/src/app.js#L131).
- **Status**: **DIPERBAIKI** — `studentRoutes(pool, config)` kini menyaring `AND ($2::boolean OR demo=false)` saat menandai materi telah dipelajari.

#### PR-10 — Workspace Belum Dikelola dalam Repositori Git
- **Hasil Aktual**: `git status` mengembalikan `fatal: not a git repository`. Untuk rilis produksi yang dapat diaudit dan di-rollback bersih, sumber kode dan migrasi wajib dikelola dalam version control (Git) dengan tag rilis.

---

## 4. Penghambat Rilis & Prioritas Perbaikan

| Prioritas | ID | Tindakan yang Diperlukan |
| --- | --- | --- |
| **P0 (Wajib sebelum staging)** | PR-04, PR-05 | Tambahkan `pool.on('error', ...)` dan `statement_timeout` di `database.js`; perkuat logging kode error & heartbeat pada `job-worker.js`; wajibkan `BACKUP_DIRECTORY` & `PG_BIN` lintas-OS di `backup.js`. |
| **P0 (Wajib sebelum rilis)** | PR-01 | Provisioning staging & produksi (HTTPS, reverse proxy, secret manager, user DB minimum privilege, penyimpanan eksternal persisten `DELETION_LEDGER_PATH` & backup `.lkb`, supervisor worker, dan alerting). |
| **P0 (Wajib sebelum data nyata)** | PR-02 | Sahkan kebijakan sekolah (prosedur izin wali, retensi angkatan/pendaftaran/konsultasi, pemulihan manual jika kode hilang, petugas insiden, dan kontak/jam BK aktual). |
| **P0 (Wajib sebelum rilis)** | PR-03 | Kurasi dan terbitkan materi publik non-demo (`demo=false`) yang ditinjau ahli BK/media; jalankan validasi ahli & uji terbatas 5–8 siswa + 1 guru BK sesuai `docs/validation-protocol.md`. |
| **P1 (Sebelum rilis luas)** | PR-07, PR-08, PR-10 | Tambahkan pemantauan keterlambatan `deletion_jobs`, lakukan uji pembaca layar & perangkat fisik Android/iOS, serta inisialisasi Git & penandaan versi rilis. |
| **P2 (Skalabilitas lanjut)** | PR-06, PR-09 | Gunakan shared store untuk rate limiter jika akan menjalankan >1 instance backend; tambahkan filter `demo=false` pada `/student/exploration`. |

---

## 5. Pengujian yang Harus Diulang Setelah Perbaikan

1. **Setelah perbaikan PR-04 & PR-05**:
   - Ulangi `backend: npm run lint`, `backend: npm test` (15/15 tes), uji simulasi putus koneksi PostgreSQL untuk memastikan proses tidak crash, serta uji `npm run backup` dan `npm run restore` pada OS target produksi (Linux/Windows).
2. **Setelah provisioning staging (PR-01) & kurasi konten non-demo (PR-03)**:
   - Jalankan smoke test end-to-end di staging (`NODE_ENV=production`, `DEMO_MODE=false`, HTTPS nyata): bootstrap superadmin → buat akun BK → kurasi konten non-demo → registrasi siswa → approval → verifikasi wali → refleksi/katalog/matriks/rencana/jurnal → konsultasi & cabut izin → ekspor & hapus akun → verifikasi worker `<= 24 jam` → backup & restore ke `*_restore` dengan replay tombstone.
   - Ulangi uji beban pilot 30 sesi pada staging untuk memverifikasi koneksi DB, reverse proxy, dan memori pada mesin target.
3. **Setelah validasi kebijakan & pengguna (PR-02, PR-03, PR-08)**:
   - Catat skor validasi ahli (`>= 75%`), tingkat keberhasilan tugas pengguna (`>= 80%`), skor SUS (`>= 68`), serta hasil uji pembaca layar & PWA pada perangkat nyata sebelum mengubah keputusan menjadi **GO**.

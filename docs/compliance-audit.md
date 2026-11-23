# Audit Kesesuaian Implementasi LANGKAHKU

| Atribut            | Nilai                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Tanggal audit      | 22 November 2026                                                                                       |
| Workspace          | `D:\PEOJECTTTTTTT\LANGKAHKU`                                                                           |
| Acuan prioritas    | Instruksi terbaru pengguna → `structure.md` → `design.md` → `PRD.md` → `task.md` & `docs/*`            |
| Status `AGENTS.md` | Tidak ditemukan di workspace                                                                           |
| Prinsip audit      | Kode aplikasi dan checklist `task.md` dipertahankan (read-only terhadap kode & checklist selama audit) |

---

## 1. Ringkasan Tingkat Kesesuaian dan Batas Pemeriksaan

Secara keseluruhan, fondasi teknis **backend (Express 5 + PostgreSQL + sesi server)** dan **frontend (React 19 + Vite + Tailwind CSS v4 + React Router v7)** telah terimplementasi nyata dengan alur UI → API → database yang berjalan untuk tiga peran (`superadmin`, `bk`, `siswa`), privasi jurnal, berbagi snapshot eksplisit, agregat k-anonymity, hak ekspor/hapus data, backup/restore terenkripsi, dan tampilan 9 template (plus pemisahan landing/login sesuai instruksi terbaru pengguna).

| Area Pemeriksaan                     | Tingkat Kesesuaian                 | Ringkasan                                                                                                                                                                                                                                                                   |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Struktur & stack**              | **SESUAI** (catatan dok.)          | Dua aplikasi ESM (`backend/`, `frontend/`), `.js`/`.jsx`, Vite/Tailwind/React Router, Express/PostgreSQL/`pg`/migrasi/sesi PG; terdapat perbedaan penamaan path & penambahan `framer-motion` yang belum disinkronkan di `structure.md`.                                     |
| **B. Akun & otorisasi**              | **SESUAI**                         | 3 role, satu form login, registrasi publik hanya `siswa`/`pending_approval`, approval & wali terpisah, transaksi `FOR UPDATE`, batas sekolah, dan 15 pengujian integrasi backend lulus.                                                                                     |
| **C. Fitur produk**                  | **SEBAGIAN**                       | Fitur inti UI → API → DB berjalan, namun ditemukan **bug runtime offline/restricted di `frontend/src/services/api.js`** serta materi konten masih berstatus demo (belum divalidasi ahli).                                                                                   |
| **D. Privasi & keamanan**            | **SEBAGIAN**                       | Kontrak server (jurnal privat, snapshot allowlist, CSRF, Argon2id, rate limit, `no-store`, backup AES-256-GCM + tombstone) kuat; terdapat bug client pada penanganan `ACCOUNT_RESTRICTED`/offline di `api.js` dan minor hardening di `rights.routes.js` & `auth.routes.js`. |
| **E. Tampilan**                      | **SESUAI** (dengan catatan bundle) | 9 template terwakili + landing/login terpisah, 56/56 titik viewport (1280/1440/1920/390/360 px + zoom 200%) lulus dengan 0 overflow, transisi menu/tab & `TextRoll` berjalan; bundle JS > 500 kB setelah `framer-motion`.                                                   |
| **F. Validasi eksternal & produksi** | **BELUM TERVERIFIKASI**            | Validasi ahli BK/media, uji pengguna 5–8 siswa, kebijakan sekolah aktual, hosting/HTTPS, dan pemantauan produksi belum tersedia.                                                                                                                                            |

### Batas Pemeriksaan

- Pengujian dilakukan pada lingkungan lokal Windows dengan cluster PostgreSQL lokal (`127.0.0.1:55432`), backend (`127.0.0.1:3001`), frontend (`127.0.0.1:5173`), dan headless Chromium.
- Tidak dilakukan uji pembaca layar penuh (NVDA/VoiceOver), instalasi PWA pada perangkat Android/iOS nyata, uji beban multi-sesi pilot, maupun uji deployment staging/produksi.

---

## 2. Temuan Berurutan Menurut Dampak

### Kritis

_Tidak ditemukan kebocoran data lintas peran, bypass otorisasi server, atau eksposur jurnal privat pada lapisan API/database._

### Tinggi

1. **[KODE] Bug `ReferenceError` (Temporal Dead Zone) saat jaringan putus & event `session-restricted` salah tempat di `frontend/src/services/api.js`**
   - **Lokasi**: `frontend/src/services/api.js:29-42`
   - **Bukti kode**:

     ```js
     } catch {
       if (data.error?.code === "ACCOUNT_RESTRICTED")
         window.dispatchEvent(new Event("session-restricted"));
       throw new ApiError(
         "Tidak terhubung. Perubahan belum tersimpan; coba lagi saat daring.",
         0,
         "OFFLINE",
       );
     }
     const data = await response.json().catch(() => ({}));
     ```

   - **Dampak**:
     1. Ketika `fetch()` gagal (luring/server putus), blok `catch` mengakses `data` sebelum `const data` dideklarasikan sehingga melempar `ReferenceError: Cannot access 'data' before initialization` alih-alih `ApiError("OFFLINE")` yang ramah pengguna.
     2. Ketika server mengembalikan `403 ACCOUNT_RESTRICTED` (misalnya akun dinonaktifkan atau izin wali belum aktif saat sesi berjalan), `window.dispatchEvent(new Event("session-restricted"))` tidak pernah dipanggil karena berada di blok `catch`, bukan di `if (!response.ok)`.
   - **Tindakan**: Pindahkan pemeriksaan `if (response.status === 403 && data.error?.code === "ACCOUNT_RESTRICTED")` ke dalam blok `if (!response.ok)` setelah `const data = ...`, dan hapus referensi `data` di blok `catch`. Tambahkan unit test frontend untuk jalur `fetch` reject (offline) dan respons `403 ACCOUNT_RESTRICTED`.

### Sedang

1. **[KODE / KEAMANAN] `res.clearCookie("langkahku.sid")` pada hapus akun tidak menyertakan opsi cookie lengkap**
   - **Lokasi**: `backend/src/modules/data-rights/rights.routes.js:161` (bandingkan dengan `backend/src/modules/auth/auth.routes.js:152-157`).
   - **Dampak**: Pada lingkungan produksi HTTPS (`secure: true`, `sameSite: "lax"`, `httpOnly: true`, `path: "/"`), pemanggilan `clearCookie` tanpa opsi yang cocok dapat membuat browser tidak langsung menghapus cookie sesi (meski sesi server sudah dihapus dari tabel `sessions`).
   - **Tindakan**: Samakan opsi `res.clearCookie("langkahku.sid", { path: "/", httpOnly: true, sameSite: "lax", secure: config.NODE_ENV === "production" })`.

2. **[KODE / KEAMANAN] Perbandingan hash kode pemulihan menggunakan `!==` alih-alih `timingSafeEqual`**
   - **Lokasi**: `backend/src/modules/auth/auth.routes.js:135`
   - **Dampak**: Lebih lemah terhadap serangan perbedaan waktu dibandingkan pola `timingSafeEqual` yang sudah diterapkan pada validasi CSRF di `backend/src/app.js:58`.
   - **Tindakan**: Gunakan `timingSafeEqual(Buffer.from(digest(input.code)), Buffer.from(user.recovery_hash))` dengan pengecekan panjang buffer.

3. **[KODE / KINERJA] Ukuran bundle JavaScript frontend melebihi 500 kB pasca-penambahan `framer-motion`**
   - **Lokasi**: `frontend/package.json:17`, `frontend/dist/assets/index-*.js` (`520.26 kB`, gzip `165.08 kB`).
   - **Dampak**: Memicu peringatan Vite (`Some chunks are larger than 500 kB`) dan menambah beban muat awal pada ponsel siswa dengan kuota terbatas (acuan ringan di `PRD.md` bagian 1 & `task.md` J10).
   - **Tindakan**: Terapkan `React.lazy` + `Suspense` per area rute (publik/siswa/BK/superadmin) atau gunakan `LazyMotion` (`domAnimation`) dari `framer-motion` / CSS murni untuk `TextRoll`.

4. **[EKSTERNAL / OPERASIONAL] Materi konten masih berlabel demo & kebijakan sekolah/validasi ahli belum tersedia**
   - **Lokasi**: `backend/seeds/content.js:1-241`, `task.md:60,122-123,190,238-243,249-255`.
   - **Dampak**: Dalam mode produksi (`DEMO_MODE=false`), katalog publik akan kosong (`backend/src/modules/content/content.routes.js:33` menyaring `demo=false`) sampai konten terverifikasi ahli diterbitkan; retensi angkatan/pendaftaran default nonaktif (`RETENTION_ENABLED=false`).
   - **Tindakan**: Selesaikan kurasi konten terverifikasi, penetapan kebijakan sekolah (`A07`, `I05`), dan validasi ahli/pengguna (`L02–L07`) sebelum membuka data siswa nyata.

### Rendah

1. **[DOKUMENTASI] Ketidaksinkronan struktur folder, nama rute API/frontend, dan daftar dependency pada `structure.md` & `design.md`**
   - **Lokasi**: `structure.md:21-33,156-186,309-354`, `design.md:27-39,126-139`.
   - **Dampak**: Rancangan awal di bagian atas `structure.md` belum sepenuhnya sama dengan realisasi kode (sebagian sudah dicatat singkat di `structure.md:433-437`, namun penambahan `framer-motion`, pemisahan `LandingPage.jsx` vs `AccessPage.jsx`, dan folder `components/ui/TextRoll.jsx` belum dicatat).
   - **Tindakan**: Perbarui catatan realisasi di `structure.md` dan `design.md` agar 100% sinkron dengan implementasi terkini.

---

## 3. Matriks Kesesuaian Kebutuhan

| ID             | Dokumen & Baris                             | Kebutuhan                                                                                                                                                 | Status                  | Bukti Implementasi (File & Baris)                                                                                                                                                      | Bukti Pemeriksaan                                                                                                                                                                   | Kekurangan & Tindakan                                                                                                                      |
| -------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **A-STACK**    | `structure.md:7-65`                         | Dua folder (`backend/`, `frontend/`), ESM `.js`/`.jsx`, React/Vite/Tailwind/Router, Express/PostgreSQL/`pg`/sesi PG                                       | **SESUAI**              | `backend/package.json:5-35`, `frontend/package.json:5-22`, `backend/src/app.js:1-53`, `backend/migrations/001_initial.sql:1-89`                                                        | Lint & test backend (15/15) dan frontend (5/5) + build lulus                                                                                                                        | Tambahkan `framer-motion` ke catatan stack `structure.md`.                                                                                 |
| **A-ENV**      | `structure.md:360-397`                      | `.env.example`, lockfile, proxy Vite `/api`, validasi env produksi, tanpa secret di `VITE_*`                                                              | **SESUAI**              | `backend/.env.example:1-18`, `frontend/.env.example:1-2`, `frontend/vite.config.js:8-12`, `backend/src/config/env.js:2-27`                                                             | `readConfig` menolak `DEMO_MODE=true` atau HTTP di produksi; build dist bebas secret                                                                                                | Tidak ada celah kode.                                                                                                                      |
| **B-ROLE**     | `structure.md:225-245`, `task.md:C01-C06`   | 3 role (`superadmin`, `bk`, `siswa`), satu form login, registrasi publik hanya `siswa`/`pending_approval`, tolak injeksi role                             | **SESUAI**              | `backend/migrations/001_initial.sql:10-14`, `backend/src/modules/auth/auth.schema.js:16-30`, `backend/src/modules/auth/auth.routes.js:56-120`, `backend/src/middleware/access.js:4-76` | `backend/tests/integration.test.js` lulus (role injection, login 3 role, guard pending/rejected/suspended)                                                                          | Tidak ada.                                                                                                                                 |
| **B-APPROVAL** | `structure.md:246-282`, `task.md:D01-D09`   | Approval/reject hanya superadmin dengan alasan & riwayat, aman terhadap konflik bersamaan, wali terpisah, akun BK & suspend                               | **SESUAI**              | `backend/src/modules/approvals/approvals.routes.js:22,116-265`, `frontend/src/pages/ApprovalsPage.jsx:17-475`                                                                          | `integration.test.js` menguji concurrency (`FOR UPDATE`), alasan wajib, wali terpisah, proteksi superadmin terakhir, dan pencabutan sesi                                            | Tidak ada.                                                                                                                                 |
| **B-RECOVER**  | `task.md:C09`, `structure.md:334`           | Pemulihan kode sekali pakai ter-hash, reset sandi, cabut sesi lama, dan prosedur sekolah bila kode hilang                                                 | **SEBAGIAN**            | `backend/src/modules/auth/auth.routes.js:121-147`, `frontend/src/pages/AccessPage.jsx:83-91`                                                                                           | `integration.test.js` menguji pemulihan sekali pakai & pencabutan sesi                                                                                                              | Ganti `!==` ke `timingSafeEqual` di `auth.routes.js:135`; prosedur verifikasi manual sekolah bila kode hilang masih terbuka (`A07`/`C09`). |
| **C-HOME**     | `PRD.md:226-236`, `task.md:F04`             | Beranda memakai data nyata API (nama, 4 status, langkah terdekat, tanpa cuplikan jurnal)                                                                  | **SESUAI**              | `backend/src/modules/student/student.routes.js:10-32`, `frontend/src/pages/HomePage.jsx:57-191`                                                                                        | Diverifikasi di browser (`polish-s02-1440.png`) dengan data PostgreSQL nyata                                                                                                        | Tidak ada.                                                                                                                                 |
| **C-REFLECT**  | `PRD.md:237-258`, `task.md:F01-F03`         | Wizard refleksi 6 langkah, opsional/lewati, tanpa skor/tipe pasti, simpan berversi & muat ulang                                                           | **SESUAI**              | `backend/src/modules/student/student.routes.js:33-82`, `frontend/src/pages/ReflectionPage.jsx:19-242`                                                                                  | `integration.test.js` uji simpan/konflik versi; browser uji render (`polish-s03-1440.png`)                                                                                          | Tidak ada.                                                                                                                                 |
| **C-PATHWAY**  | `PRD.md:259-272`, `task.md:E01-E07`         | Katalog 4 kategori, pencarian, 6 jalur & 18 profesi, sumber/tinjau, unduh luring, tamu boleh baca                                                         | **SEBAGIAN**            | `backend/src/modules/content/content.routes.js:18-55`, `backend/seeds/content.js:1-241`, `frontend/src/pages/PathwaysPage.jsx:40-380`                                                  | Browser uji katalog + panel detail (`polish-s04-1440.png`, `polish-s04-panel-1440.png`); API menolak draf/arsip                                                                     | Konten masih berlabel demo; cerita alumni nyata berizin & validasi sumber oleh ahli masih terbuka (`E05`, `E06`).                          |
| **C-COMPARE**  | `PRD.md:273-285`, `task.md:F05-F07`         | Matriks 2–3 opsi, 5 kriteria 1–5/Belum tahu, alasan opsional, tanpa total/skor/pemenang otomatis                                                          | **SESUAI**              | `backend/src/modules/student/student.routes.js:33-82`, `frontend/src/pages/PlanPage.jsx:479-656`                                                                                       | `integration.test.js` menolak nilai di luar 1–5; UI tidak menghitung skor/peringkat                                                                                                 | Tidak ada.                                                                                                                                 |
| **C-PLAN**     | `PRD.md:286-298`, `task.md:F08-F10,J04`     | Tujuan utama/cadangan, semester XI-1..XII-2, checklist, panel tambah/edit, cetak A4 tanpa jurnal                                                          | **SESUAI**              | `frontend/src/pages/PlanPage.jsx:123-478`, `frontend/src/styles/index.css:1540-1615` (`@media print`)                                                                                  | Browser (`polish-s05-1440.png`, `polish-s05-390.png`) & `integration.test.js` lulus                                                                                                 | Tidak ada.                                                                                                                                 |
| **C-JOURNAL**  | `PRD.md:299-309`, `task.md:F11-F12`         | Jurnal privat pemilik saja, 2–3 pertanyaan, tanpa berbagi/endpoint BK/superadmin                                                                          | **SESUAI**              | `backend/src/modules/student/student.routes.js:100-168`, `frontend/src/components/panels/JournalPanel.jsx:15-191`                                                                      | `integration.test.js` menolak akses jurnal lintas akun/BK/superadmin; `privacy.test.jsx` memastikan jurnal absen di form berbagi                                                    | Tidak ada.                                                                                                                                 |
| **C-CONSULT**  | `PRD.md:310-336`, `task.md:G01-G08`         | Pengajuan konsultasi, berbagi kosong bawaan, tanpa lampiran valid, pratinjau, idempotensi, cabut/perbarui snapshot                                        | **SESUAI**              | `backend/src/modules/consultations/consultations.routes.js:1-348`, `frontend/src/pages/ConsultationPage.jsx:24-663`                                                                    | `integration.test.js` & `privacy.test.jsx` membuktikan allowlist, idempotensi, revoke/renew/expire                                                                                  | Tidak ada.                                                                                                                                 |
| **C-BK**       | `PRD.md:337-361`, `task.md:H01-H09`         | Antrean BK, agregat k-anonymity (>=10 grup, >=5 sel, sembunyi sel pelengkap), kurasi konten & pengaturan layanan                                          | **SESUAI**              | `backend/src/modules/consultations/consultations.routes.js:177-301`, `backend/src/modules/content/content.routes.js:67-252`, `frontend/src/pages/BkPages.jsx:26-782`                   | `integration.test.js` uji agregat aman & suppressed, kurasi, dan batas sekolah; browser uji `t01`–`t03`                                                                             | Validasi jam/kontak sekolah aktual masih terbuka (`A07`/`J09`).                                                                            |
| **C-RIGHTS**   | `PRD.md:362-375`, `task.md:I01-I08`         | Ekspor reauth (jurnal opt-in), hapus fitur (cabut snapshot), hapus akun + job worker, backup AES-256-GCM + restore tombstone                              | **SEBAGIAN**            | `backend/src/modules/data-rights/rights.routes.js:33-180`, `backend/src/jobs/deletion.job.js:8-72`, `backend/src/jobs/retention.job.js:3-24`, `backend/src/utils/backup.js:52-144`     | `integration.test.js` & `backup.test.js` lulus                                                                                                                                      | Perbaiki opsi `clearCookie` di `rights.routes.js:161`; kebijakan retensi sekolah belum disahkan (`I05`, `RETENTION_ENABLED=false`).        |
| **D-OFFLINE**  | `PRD.md:376-387`, `task.md:J01-J02,K07,K13` | PWA publik saja, API/privat tidak dicache, error jaringan/luring tertangani bersih                                                                        | **BELUM SESUAI**        | `frontend/public/sw.js:1-58`, `frontend/src/services/offline.js:1-22`, `frontend/src/services/api.js:29-42`                                                                            | `service-worker.test.js` lulus (API tidak dicache), **namun** `api.js:30` memiliki bug TDZ `ReferenceError` saat `fetch()` gagal/luring dan `ACCOUNT_RESTRICTED` tidak ter-dispatch | Wajib perbaiki `frontend/src/services/api.js:29-42` dan tambahkan test unit offline/restricted.                                            |
| **E-UI**       | `design.md:53-105`, instruksi terbaru       | 9 template + landing/login terpisah, desktop 1440 px (1280–1920), mobile 390/360, token maroon/pastel, transisi menu & `TextRoll`, tanpa overlap/overflow | **SESUAI**              | `frontend/src/styles/tokens.css`, `frontend/src/styles/index.css`, `frontend/src/components/ui.jsx`, `frontend/src/components/ui/TextRoll.jsx`, `frontend/src/pages/LandingPage.jsx`   | 56/56 viewport check (`0` overflow), verifikasi landing/login, verifikasi transisi & `prefers-reduced-motion`, build & lint lulus                                                   | Optimalkan ukuran chunk JS > 500 kB (`framer-motion` / code-splitting rute).                                                               |
| **F-EXT**      | `task.md:L02-L07,M01-M07`                   | Validasi ahli BK/media, uji pengguna 5–8 siswa, hosting/HTTPS/monitoring produksi                                                                         | **BELUM TERVERIFIKASI** | `docs/validation-protocol.md`, `docs/operations.md`                                                                                                                                    | Belum ada peserta, ahli, atau infrastruktur eksternal                                                                                                                               | Terbuka sesuai rencana rilis; jangan gunakan untuk data siswa nyata sebelum selesai.                                                       |

---

## 4. Checklist Selesai (`[x]` di `task.md`) yang Belum Sepenuhnya Didukung Bukti

| ID di `task.md` | Klaim di `task.md`                                                                                        | Temuan Audit                                                                                                                                                                                                                                  | Status Sebenarnya |
| --------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **K07**         | _"jaringan putus saat simpan -> konflik/gagal terlihat; UI tidak mengklaim tersimpan sebelum konfirmasi"_ | Konflik versi (409) teruji di backend & UI, **tetapi** jalur jaringan putus (`fetch()` melempar exception) di `frontend/src/services/api.js:30` melempar `ReferenceError` karena membaca `data` sebelum deklarasi `const data` pada baris 38. | **BELUM SESUAI**  |
| **C08**         | _"penanganan sesi berakhir / pembatasan akses"_                                                           | Event `session-restricted` di `AuthContext.jsx:38-39` tidak pernah terpicu saat backend mengembalikan `403 ACCOUNT_RESTRICTED` karena pemanggilan `dispatchEvent` salah ditempatkan di blok `catch` (`frontend/src/services/api.js:30-31`).   | **SEBAGIAN**      |
| **I04**         | _"hapus akun: akses/sesi/snapshot diblokir segera"_                                                       | Sesi server dan snapshot benar-benar diblokir/dihapus di DB, namun `res.clearCookie("langkahku.sid")` di `rights.routes.js:161` belum menyertakan opsi `{ path, httpOnly, sameSite, secure }` yang seragam dengan `/auth/logout`.             | **SEBAGIAN**      |

Seluruh item `[x]` lainnya yang diperiksa (`A01–A06`, `B01–B13`, `C01–C07`, `C10`, `D01–D09`, `E01–E04`, `E07`, `F01–F13`, `G01–G08`, `H01–H09`, `I01–I03`, `I06–I08`, `J01–J07`, `K01–K06`, `K08–K16`) memiliki bukti kode dan pengujian aktual yang sesuai, sementara item yang belum divalidasi (`A07`, `C09`, `E05–E06`, `I05`, `J08–J10`, `L02–L03`, `L05`, `L07`, `M01–M02`, `M04–M07`) sudah dibiarkan terbuka `[ ]` secara jujur di `task.md`.

---

## 5. Perbedaan Antara Dokumentasi dan Implementasi Aktual

1. **Pemisahan Landing Page dan Login**: `design.md` (S01) merancang pembuka dan form akses dalam satu layar gabungan; implementasi terbaru memisahkan `/` (`LandingPage.jsx`) dari `/masuk`, `/daftar`, `/pemulihan`, `/status` (`AccessPage.jsx`) sesuai instruksi terbaru pengguna.
2. **Pustaka Animasi**: `structure.md` bagian 1 belum mencantumkan `framer-motion` yang kini terpasang di `frontend/package.json` untuk komponen `frontend/src/components/ui/TextRoll.jsx`.
3. **Peta Rute API & Frontend**: `structure.md` bagian 6 menulis `/api/v1/superadmin/*`, `/api/v1/siswa/*`, `/siswa/beranda`, sedangkan implementasi memakai `/api/v1/admin/*`, `/api/v1/student/*`, `/beranda`, `/kenali-diriku`, `/rencana`, `/timbang-pilihan`, `/sapa-bk` (sebagian sudah dicatat pada `structure.md` bagian 10).
4. **Struktur Folder Frontend**: `structure.md` bagian 2 mencantumkan subdirektori `pages/public/`, `pages/siswa/`, `pages/bk/`, `pages/superadmin/`, sedangkan implementasi memakai struktur datar `frontend/src/pages/` dan `frontend/src/components/ui/TextRoll.jsx`.

---

## 6. Pemeriksaan yang Dijalankan dan Hasilnya

| Pemeriksaan                             | Perintah / Metode                                                          | Hasil                                                                                                                                                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend lint                            | `cd backend && npm run lint`                                               | **LULUS** (0 error, 0 warning)                                                                                                                                                                                                         |
| Backend integration & security tests    | `cd backend && npm test`                                                   | **LULUS** (15/15 test suites: auth, approval concurrency, consent gate, journal privacy, consultation snapshots/revoke, aggregates k-anonymity, curation, export/delete/retention, backup/restore tombstone, CLI bootstrap, demo seed) |
| Frontend lint                           | `cd frontend && npm run lint`                                              | **LULUS** (0 error, 0 warning)                                                                                                                                                                                                         |
| Frontend unit/UI tests                  | `cd frontend && npm test`                                                  | **LULUS** (5/5 test: `service-worker.test.js`, `time.test.js`, `privacy.test.jsx`)                                                                                                                                                     |
| Frontend production build               | `cd frontend && npm run build`                                             | **LULUS** (dist + SW allowlist terbentuk; peringatan chunk JS `520.26 kB` > 500 kB)                                                                                                                                                    |
| Layout & responsivitas browser          | Headless Chrome CDP (`polish-layout-checks.json`)                          | **LULUS** (56/56 titik viewport 1280/1440/1920/390/360 px + zoom 200%, **0 overflow**)                                                                                                                                                 |
| Alur landing → login, panel, & transisi | Headless Chrome CDP (`verify-landing-login.mjs`, `verify-transitions.mjs`) | **LULUS** (landing tanpa form, klik Masuk → `/masuk`, Escape tutup panel, header/sidebar/tabs stabil tanpa remount, `prefers-reduced-motion` dihormati)                                                                                |

---

## 7. Penghambat Spesifik dan Prioritas Perbaikan

### Prioritas 1 (Segera — Perbaikan Kode)

1. Perbaiki bug TDZ & penempatan `session-restricted` pada `frontend/src/services/api.js:29-42`, lalu tambahkan unit test Vitest untuk simulasi `fetch` gagal (luring) dan respons `403 ACCOUNT_RESTRICTED`.
2. Lengkapi opsi `clearCookie` pada `backend/src/modules/data-rights/rights.routes.js:161` dan gunakan `timingSafeEqual` pada `backend/src/modules/auth/auth.routes.js:135`.

### Prioritas 2 (Kinerja & Sinkronisasi Dokumentasi)

1. Pecah bundle frontend (`React.lazy` per area rute atau `LazyMotion`) agar chunk awal kembali di bawah 500 kB dan lebih ramah kuota seluler.
2. Sinkronkan `structure.md` (penambahan `framer-motion` dan struktur `pages/` + `components/ui/`) serta `design.md` (pemisahan `/` dan `/masuk`).

### Prioritas 3 (Gerbang Sebelum Data Siswa Nyata)

1. Tetapkan kebijakan operasional sekolah (`A07`, `C09` prosedur manual bila kode hilang, `I05` retensi, `J09` kontak/jam terverifikasi).
2. Lakukan kurasi konten non-demo bersama ahli BK/media (`E05`, `E06`, `L02`), uji pengguna 5–8 siswa (`L03`, `L05`), audit pembaca layar penuh & perangkat nyata (`J08`, `J10`), serta kesiapan infrastruktur produksi (`M01–M07`).

---

## 8. Log Perbaikan Pasca-Audit (22 November 2026)

Seluruh temuan kode, keamanan, kinerja, dan dokumentasi pada **Prioritas 1 dan Prioritas 2** telah diperbaiki dan diverifikasi ulang:

1. **`frontend/src/services/api.js` + `frontend/src/tests/api.test.js`**: Bug TDZ pada jalur luring diperbaiki dan event `session-restricted` dipindahkan ke blok `if (!response.ok)` untuk `403 ACCOUNT_RESTRICTED`. Ditambahkan 3 unit test baru (`OFFLINE`, `ACCOUNT_RESTRICTED`, `SESSION_EXPIRED`). Status `D-OFFLINE`, `K07`, dan `C08` kini **SESUAI**.
2. **`backend/src/modules/data-rights/rights.routes.js`**: `res.clearCookie("langkahku.sid", ...)` kini menggunakan opsi `{ path: "/", httpOnly: true, sameSite: "lax", secure: config.NODE_ENV === "production" }` selaras dengan `/auth/logout`.
3. **`backend/src/modules/auth/auth.routes.js`**: Perbandingan hash kode pemulihan kini menggunakan `timingSafeEqual`.
4. **Code-splitting & `LazyMotion`** (`frontend/src/App.jsx`, `frontend/src/components/ui/TextRoll.jsx`): Chunk utama turun dari `520.26 kB` menjadi `395.17 kB` (`130.20 kB` gzip) tanpa peringatan ukuran chunk Vite.
5. **Sinkronisasi dokumentasi**: `structure.md` (bagian 10) dan `design.md` (S01) diperbarui mengikuti pemisahan `/` vs `/masuk`, `LazyMotion`, dan struktur aktual.

Hasil verifikasi ulang: `frontend` lint lulus, **8/8 test lulus**, build produksi lulus tanpa peringatan; `backend` lint lulus, **15/15 test integrasi lulus**. Gerbang eksternal pada **Prioritas 3** tetap terbuka.

# LANGKAHKU - Struktur Proyek dan Tech Stack

| Atribut               | Keputusan                                         |
| --------------------- | ------------------------------------------------- |
| Versi                 | 1.0                                               |
| Tanggal               | 22 November 2026                                  |
| Folder aplikasi utama | `backend/` dan `frontend/`                        |
| Bahasa                | **JavaScript**, menggunakan ES Modules            |
| Frontend              | **React + Vite**                                  |
| Backend               | **Node.js + Express**                             |
| Database              | **PostgreSQL**                                    |
| Role login            | **`superadmin`, `bk`, `siswa`**                   |
| Pendaftaran siswa     | Mandiri, kemudian menunggu persetujuan superadmin |

Dokumen ini adalah rancangan struktur, bukan aplikasi yang sudah dibangun. Struktur kode di bawah disiapkan untuk tahap implementasi berikutnya.

**Pembaruan kebutuhan:** arahan terbaru menggantikan rancangan lama yang mewajibkan undangan akun siswa. Siswa sekarang dapat mendaftar sendiri. Akunnya tidak mendapat akses fitur pribadi sebelum disetujui superadmin dan memenuhi persyaratan persetujuan yang berlaku. Rincian autentikasi dalam dokumen ini menjadi acuan terbaru bila berbeda dengan PRD/design versi sebelumnya.

## 1. Tech stack yang digunakan

### Frontend

| Teknologi                           | Kegunaan                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------- |
| React                               | Komponen UI untuk siswa, BK, dan superadmin                                |
| Vite                                | Development server dan build frontend; gunakan template `react` JavaScript |
| React Router, declarative mode      | Routing dan pembagian akses halaman berdasarkan sesi/role                  |
| Tailwind CSS melalui integrasi Vite | Styling responsif dan token maroon/pastel dari `design.md`                 |
| Fetch API                           | Komunikasi HTTP ke backend melalui wrapper bersama                         |
| React Context + hooks               | Sesi pengguna, state UI lokal, dan pengelolaan panel                       |
| Lucide React                        | Ikon outline yang konsisten                                                |
| Web App Manifest + service worker   | Pemasangan PWA dan unduhan konten publik saja                              |

React mendokumentasikan pendekatan aplikasi dari awal dengan build tool seperti Vite; Vite menyediakan template React JavaScript. Rujukan: [React](https://react.dev/learn/build-a-react-app-from-scratch), [Vite](https://vite.dev/guide/). Routing dan styling mengikuti [React Router](https://reactrouter.com/start/declarative/installation) dan [Tailwind CSS untuk Vite](https://tailwindcss.com/docs/installation/using-vite).

Tidak perlu menambah state manager global lain pada versi awal. Data server tetap berasal dari API; role/status yang disimpan UI bukan sumber otorisasi.

### Backend dan database

| Teknologi                               | Kegunaan                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| Node.js                                 | Runtime JavaScript; pilih rilis LTS aktif yang kompatibel saat setup            |
| Express                                 | REST API, middleware autentikasi, role, validasi, dan error handling            |
| PostgreSQL                              | Akun, persetujuan, sesi, konten, aktivitas siswa, konsultasi, dan audit         |
| `pg` / node-postgres                    | Koneksi database, query berparameter, dan transaksi                             |
| `node-pg-migrate`                       | Migrasi database yang terlacak; konfigurasi/migrasi memakai JavaScript atau SQL |
| `express-session` + `connect-pg-simple` | Sesi server dengan session store PostgreSQL                                     |
| `argon2`                                | Hash kata sandi dengan Argon2id; bukan menyimpan password asli                  |
| `zod`                                   | Validasi body, parameter, query, dan konfigurasi server                         |
| `helmet` + `express-rate-limit`         | Header keamanan dan batas percobaan endpoint sensitif                           |
| Node.js crypto                          | Token pemulihan, token CSRF, dan pengacakan yang aman                           |
| Pino                                    | Log terstruktur dengan penyensoran field sensitif                               |

Keputusan memakai sesi server memudahkan pencabutan akses saat akun ditolak/dinonaktifkan. `express-session` menyimpan data sesi di server dan hanya ID sesi di cookie; gunakan store persisten, bukan MemoryStore untuk produksi. Rujukan: [express-session](https://github.com/expressjs/session), [panduan keamanan Express](https://expressjs.com/en/advanced/best-practice-security/).

Transaksi persetujuan memakai satu koneksi database untuk `BEGIN/COMMIT/ROLLBACK`, sesuai [dokumentasi transaksi node-postgres](https://node-postgres.com/features/transactions).

### Tool pengembangan

- **npm** untuk package manager; setiap folder aplikasi mempunyai `package.json` dan `package-lock.json` sendiri.
- **ESLint + Prettier** untuk kualitas dan konsistensi kode.
- **Vitest + React Testing Library** untuk perilaku UI penting; **Supertest** untuk integrasi API dengan runner pengujian yang dipilih saat setup.
- Database pengujian terpisah; data fiktif untuk seluruh pengujian.

Gunakan file `.js` untuk logika dan `.jsx` untuk komponen React. Tidak memakai TypeScript/`.ts`/`.tsx`. Versi dependency dikunci di lockfile saat implementasi setelah kompatibilitas diverifikasi.

## 2. Struktur direktori utama

```text
LANGKAHKU/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── migrations/
│   ├── seeds/
│   │   └── demo.js
│   ├── scripts/
│   │   ├── bootstrap-superadmin.js
│   │   └── run-retention.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── config/
│   │   │   ├── env.js
│   │   │   ├── database.js
│   │   │   └── session.js
│   │   ├── constants/
│   │   │   ├── roles.js
│   │   │   └── account-status.js
│   │   ├── middleware/
│   │   │   ├── authenticate.js
│   │   │   ├── authorize.js
│   │   │   ├── require-active-account.js
│   │   │   ├── validate.js
│   │   │   ├── csrf.js
│   │   │   └── error-handler.js
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── auth.service.js
│   │   │   │   ├── auth.repository.js
│   │   │   │   └── auth.schema.js
│   │   │   ├── approvals/
│   │   │   ├── accounts/
│   │   │   ├── consents/
│   │   │   ├── content/
│   │   │   ├── reflections/
│   │   │   ├── comparisons/
│   │   │   ├── plans/
│   │   │   ├── journals/
│   │   │   ├── consultations/
│   │   │   ├── aggregates/
│   │   │   ├── data-rights/
│   │   │   └── settings/
│   │   ├── jobs/
│   │   │   ├── retention.job.js
│   │   │   └── deletion.job.js
│   │   └── utils/
│   │       ├── password.js
│   │       ├── audit.js
│   │       └── logger.js
│   └── tests/
│       ├── auth.test.js
│       ├── approvals.test.js
│       └── permissions.test.js
│
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── public/
│   │   ├── manifest.webmanifest
│   │   ├── sw.js
│   │   ├── icons/
│   │   └── worksheets/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── routes/
│       │   ├── AppRoutes.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── RoleRoute.jsx
│       ├── layouts/
│       │   ├── PublicLayout.jsx
│       │   ├── StudentLayout.jsx
│       │   └── StaffLayout.jsx
│       ├── pages/
│       │   ├── public/
│       │   │   └── AccessPage.jsx
│       │   ├── siswa/
│       │   │   ├── HomePage.jsx
│       │   │   ├── ReflectionPage.jsx
│       │   │   ├── PathwaysPage.jsx
│       │   │   ├── PlanPage.jsx
│       │   │   └── ConsultationPage.jsx
│       │   ├── bk/
│       │   │   ├── RequestsPage.jsx
│       │   │   ├── AggregatesPage.jsx
│       │   │   └── ManagePage.jsx
│       │   └── superadmin/
│       │       └── StudentApprovalsPage.jsx
│       ├── components/
│       │   ├── ui/
│       │   ├── navigation/
│       │   └── panels/
│       │       ├── JournalPanel.jsx
│       │       ├── AccountSettingsPanel.jsx
│       │       └── HelpPanel.jsx
│       ├── features/
│       │   ├── auth/
│       │   ├── approvals/
│       │   ├── content/
│       │   ├── reflections/
│       │   ├── plans/
│       │   ├── comparisons/
│       │   ├── journals/
│       │   ├── consultations/
│       │   └── data-rights/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       ├── services/
│       │   └── api.js
│       ├── constants/
│       │   └── roles.js
│       ├── styles/
│       │   ├── index.css
│       │   ├── tokens.css
│       │   └── print.css
│       ├── assets/
│       ├── utils/
│       └── tests/
│
├── PRD.md
├── design.md
└── structure.md
```

`backend` dan `frontend` adalah dua folder kode aplikasi. Dokumen proposal dan aset referensi desain yang sudah ada tetap menjadi bahan pendukung. Tree di atas tidak menampilkan `node_modules`, berkas build, atau semua berkas fitur agar tetap mudah dibaca.

### Pembagian tanggung jawab kode

| Bagian            | Tanggung jawab                                                           |
| ----------------- | ------------------------------------------------------------------------ |
| `*.routes.js`     | URL, middleware, dan handler tujuan                                      |
| `*.controller.js` | Baca request tervalidasi dan kirim respons HTTP                          |
| `*.service.js`    | Aturan bisnis, kepemilikan, transaksi, serta proses persetujuan          |
| `*.repository.js` | Query database berparameter; tidak menentukan respons UI                 |
| `*.schema.js`     | Validasi input modul                                                     |
| `pages/`          | Merangkai layar utama; bukan tempat query SQL atau seluruh logika bisnis |
| `features/`       | Form, komponen domain, dan panggilan API per fitur                       |
| `components/`     | Komponen bersama, navigasi, dan panel                                    |
| `services/api.js` | Fetch dengan cookie, CSRF, format error, dan penanganan sesi berakhir    |

Modul backend lain mengikuti pola `auth/` jika membutuhkan seluruh bagian tersebut. Modul kecil boleh digabung secukupnya; jangan membuat file kosong hanya untuk memenuhi pola. `app.js` merangkai Express untuk runtime dan pengujian, sedangkan `server.js` menjalankan HTTP server.

## 3. Role dan pembagian fitur

| Kemampuan                                            | Superadmin                      | BK                                          | Siswa                                |
| ---------------------------------------------------- | ------------------------------- | ------------------------------------------- | ------------------------------------ |
| Meninjau pendaftaran siswa                           | Ya                              | Tidak                                       | Status milik sendiri                 |
| Menyetujui/menolak pendaftaran                       | **Ya, fitur utama**             | Tidak                                       | Tidak                                |
| Membuat/menonaktifkan akun BK                        | Ya                              | Tidak                                       | Tidak                                |
| Verifikasi status izin wali melalui prosedur sekolah | Ya; metadata minimum            | Hanya bila kelak diberi kewenangan khusus   | Melihat status sendiri               |
| Menggunakan refleksi, perbandingan, rencana          | Tidak untuk data siswa          | Hanya ringkasan yang dipilih siswa          | Milik sendiri                        |
| Membaca jurnal                                       | Tidak                           | Tidak                                       | **Milik sendiri saja**               |
| Mengelola konsultasi                                 | Tidak secara bawaan             | Permintaan yang ditugaskan dalam sekolahnya | Mengajukan dan melihat milik sendiri |
| Mengelola konten karier dan layanan                  | Tidak secara bawaan             | Ya, sesuai sekolah/kewenangan               | Baca konten terbit                   |
| Melihat agregat kebutuhan                            | Tidak secara bawaan             | Ya, dengan batas privasi                    | Tidak                                |
| Ekspor/hapus data pribadi siswa                      | Tidak membaca/mengekspor massal | Tidak                                       | Milik sendiri                        |

Role `superadmin` mengelola administrasi akun. Namanya tidak otomatis memberi akses membaca jurnal, refleksi, atau seluruh permintaan konseling. Pengecekan peran, sekolah, kepemilikan, dan status akun tetap berlaku di backend.

**Halaman utama superadmin:** daftar **Pendaftaran siswa** dengan filter status, pencarian akun, detail data pendaftaran minimum, tombol **Setujui**, tombol **Tolak** dengan alasan operasional, dan riwayat keputusan. Pengelolaan akun BK serta pengaturan administratif dapat berupa tab/panel di area yang sama.

Untuk menjaga desain tetap ringkas, gunakan kembali komponen antrean/detail pada panel BK sebagai template visual superadmin. Ini variasi berdasarkan role, bukan alasan menambah banyak layar atau membuka data BK kepada superadmin.

## 4. Pendaftaran dan persetujuan siswa

### Status akun

| Status             | Makna                                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `pending_approval` | Pendaftaran masuk, menunggu keputusan superadmin                               |
| `approved`         | Pendaftaran disetujui; akses pribadi tetap memerlukan persetujuan yang berlaku |
| `rejected`         | Pendaftaran ditolak; fitur pribadi tidak dapat digunakan                       |
| `suspended`        | Akun yang sudah disetujui dinonaktifkan                                        |

Persetujuan wali disimpan terpisah sebagai `pending`, `verified`, atau `not_required`. Persetujuan siswa juga mempunyai waktu dan versi pemberitahuan tersendiri. **Menyetujui akun tidak sama dengan memverifikasi persetujuan wali.**

### Alur utama

1. Siswa membuka **Daftar akun siswa** pada template akses.
2. Form meminta username/ID login yang dipilih, kata sandi, nama panggilan, kelas, semester, sekolah yang tersedia, kategori usia, dan persetujuan siswa. Tidak meminta email, telepon, NISN, atau tanggal lahir lengkap.
3. Backend memvalidasi data, memeriksa username unik, menyimpan hash password, dan menetapkan `role=siswa` serta `status=pending_approval`. Form tidak boleh menentukan role atau status sendiri.
4. Tampilkan **“Pendaftaran diterima. Tunggu persetujuan superadmin.”** Siswa dapat memeriksa status melalui akses terbatas menggunakan kredensial yang dibuat.
5. Superadmin membuka antrean, memeriksa data minimum dan konteks sekolah, kemudian menyetujui atau menolak. Penolakan membutuhkan alasan yang sopan dan tidak memuat informasi sensitif.
6. Keputusan, pelaku, dan waktunya dicatat. Approval serta audit disimpan dalam transaksi agar konsisten.
7. Jika disetujui dan semua persetujuan yang berlaku terpenuhi, login diarahkan ke Beranda siswa. Jika izin wali belum diverifikasi, tetap tampilkan status menunggu izin dan akses konten publik saja.

Data pendaftaran dibatasi untuk keperluan administrasi akun. Refleksi, jurnal, rencana, dan konsultasi belum dapat dibuat sebelum akses pribadi aktif. Kebijakan retensi juga mencakup pendaftaran tertunda/ditolak; usulan awal 30 hari setelah pendaftaran tanpa keputusan atau setelah penolakan, dengan pemberitahuan dan peninjauan sekolah sebelum penerapan nyata.

### Aturan login dan keamanan approval

- Satu form login melayani tiga role. Role tujuan berasal dari database, bukan pilihan atau nilai dari browser.
- Akun pending/rejected hanya memperoleh sesi terbatas untuk status sendiri, keluar, dan pembatalan/penghapusan pendaftaran; bukan akses aplikasi siswa.
- Backend memeriksa status terkini pada setiap permintaan privat. Persetujuan aktif mensyaratkan `status=approved`, persetujuan siswa valid, serta wali `verified/not_required` sesuai ketentuan.
- Endpoint publik pendaftaran hanya menerima siswa. Tolak input tambahan seperti `role`, `status`, `approved_by`, atau `school_id` yang tidak diizinkan konteks pendaftaran.
- `approve/reject` hanya untuk akun siswa `pending_approval`. Keputusan bersamaan harus dikendalikan melalui transaksi dan penguncian/pemeriksaan kondisi; keputusan yang bertentangan tidak boleh saling menimpa.
- Endpoint suspend/aktifkan kembali hanya mengubah akun yang sebelumnya sudah disetujui antara `approved` dan `suspended`; tidak boleh menjadi jalan pintas untuk menyetujui akun pending/ditolak. Hindari penonaktifan superadmin aktif terakhir atau penghapusan akses sendiri secara tidak sengaja.
- Nonaktifkan sesi lama saat akun disuspensi, ditolak, dihapus, atau kredensial dipulihkan. Login ulang merotasi ID sesi.
- BK dibuat oleh superadmin. Superadmin pertama dibuat melalui CLI `bootstrap-superadmin.js` dengan kredensial aman, tanpa akun/password default yang ditanam di kode dan tanpa endpoint registrasi publik.
- Persetujuan pendaftaran dan pencabutan status dicatat tanpa password, token asli, atau isi aktivitas pribadi.

## 5. Rancangan data inti

| Tabel                               | Isi utama                                                                                          |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `users`                             | ID acak, username unik, password_hash, role, account_status, school_id, created_at                 |
| `student_profiles`                  | user_id, nama panggilan, kelas, semester, kategori usia, cohort_id                                 |
| `registration_reviews`              | student_id, keputusan, alasan, reviewed_by, reviewed_at                                            |
| `consents`                          | Persetujuan siswa/versi, status wali, waktu verifikasi, petugas, referensi dokumen sekolah minimum |
| `sessions`                          | Sesi server dan waktu kedaluwarsa                                                                  |
| `schools`, `cohorts`                | Konteks sekolah/angkatan, zona waktu, tanggal kelulusan/retensi                                    |
| `content_items`, `content_sources`  | Kartu jalur/profesi/cerita/lembar kerja, sumber dan versi                                          |
| `reflections`                       | Jawaban enam langkah dan ringkasan milik siswa                                                     |
| `comparisons`, `comparison_options` | Matriks pilihan pribadi dan alasan                                                                 |
| `plans`, `plan_steps`               | Tujuan, cadangan, semester, dan checklist                                                          |
| `journal_entries`                   | Jurnal privat, hanya pemilik                                                                       |
| `consultations`, `shared_snapshots` | Permintaan dan salinan ringkasan yang secara eksplisit dibagikan                                   |
| `progress_states`                   | Metadata tahap untuk beranda dan agregat tanpa narasi                                              |
| `school_settings`                   | Jam layanan, bantuan terverifikasi, dan pengaturan sekolah                                         |
| `audit_logs`, `deletion_jobs`       | Audit minimum serta pekerjaan penghapusan/retensi                                                  |

Kunci asing menjaga relasi antarobjek; batas role/status memakai nilai yang terkontrol. `registration_reviews` menyimpan keputusan administratif, bukan catatan konseling. Semua query privat selalu membatasi pemilik/sekolah sesuai kewenangan. Akses jurnal tidak diperluas hanya karena pengguna adalah superadmin.

## 6. Rute frontend dan API

### Frontend

| Rute                                          | Tujuan dan akses                                            |
| --------------------------------------------- | ----------------------------------------------------------- |
| `/`, `/login`, `/daftar`                      | Template akses publik yang sama, dengan mode berbeda        |
| `/status-pendaftaran`                         | State status pada template akses; sesi siswa terbatas       |
| `/peta-jalur`                                 | Publik/tamu; detail melalui panel                           |
| `/siswa/beranda`                              | Siswa disetujui dengan persetujuan lengkap                  |
| `/siswa/diriku`                               | Refleksi siswa                                              |
| `/siswa/rencana?tab=rencana`                  | Tujuan dan checklist                                        |
| `/siswa/rencana?tab=perbandingan`             | Timbang Pilihan di template Rencana                         |
| `/siswa/bk`                                   | Pengajuan dan status konsultasi                             |
| `/bk/permintaan`, `/bk/agregat`, `/bk/kelola` | Khusus BK                                                   |
| `/superadmin/pendaftaran`                     | Khusus superadmin; tab/panel untuk akun BK dan administrasi |

Pengaturan, jurnal, bantuan, dan detail tetap berupa panel. `ProtectedRoute`/`RoleRoute` mengatur pengalaman UI; backend tetap menjalankan seluruh pemeriksaan keamanan.

### API utama

Prefix seluruh endpoint: **`/api/v1`**.

| Endpoint                                                | Akses / tujuan                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `POST /auth/register`                                   | Publik; mendaftar sebagai siswa pending                                                                        |
| `POST /auth/login`, `POST /auth/logout`                 | Masuk/keluar tiga role                                                                                         |
| `GET /auth/me`                                          | Identitas, role, status, dan scope sesi milik sendiri                                                          |
| `GET /auth/registration-status`                         | Status pendaftaran siswa terautentikasi, termasuk sesi terbatas                                                |
| `POST /auth/recovery`                                   | Pemulihan dengan kode; rate limit ketat                                                                        |
| `GET /auth/csrf`                                        | Token CSRF untuk mutasi berbasis cookie                                                                        |
| `GET /superadmin/registrations`                         | Antrean siswa; filter/pagination                                                                               |
| `GET /superadmin/registrations/:id`                     | Detail administratif minimum                                                                                   |
| `POST /superadmin/registrations/:id/approve`            | Persetujuan siswa pending, dengan audit                                                                        |
| `POST /superadmin/registrations/:id/reject`             | Penolakan siswa pending dan alasan                                                                             |
| `POST /superadmin/bk-accounts`                          | Membuat akun BK                                                                                                |
| `PATCH /superadmin/accounts/:id/status`                 | `approved` <-> `suspended` pada akun yang sudah disetujui, tanpa perubahan role atau melewati antrean approval |
| `POST /superadmin/students/:id/guardian-verification`   | Verifikasi terpisah status persetujuan wali                                                                    |
| `GET /public/content`, `GET /public/content/:slug`      | Konten terbit yang dapat diakses tamu                                                                          |
| `GET /public/settings`                                  | Konfigurasi bantuan publik yang aman                                                                           |
| `GET/PUT /siswa/reflection`                             | Refleksi milik siswa aktif                                                                                     |
| `/siswa/comparisons`, `/siswa/plans`, `/siswa/journals` | CRUD milik sendiri dengan metode/ID yang sesuai                                                                |
| `POST/GET /siswa/consultations`                         | Buat/lihat permintaan sendiri                                                                                  |
| `DELETE /siswa/consultations/:id/shares/:shareId`       | Cabut bagian ringkasan yang dibagikan                                                                          |
| `GET /bk/consultations`                                 | Antrean yang menjadi kewenangan guru                                                                           |
| `GET/PATCH /bk/consultations/:id`                       | Detail yang diizinkan dan perubahan jadwal/status                                                              |
| `GET /bk/aggregates`                                    | Agregat dengan perlindungan kelompok kecil                                                                     |
| `/bk/content`, `/bk/settings`                           | Pengelolaan konten/layanan sesuai metode dan kewenangan                                                        |
| `POST /siswa/data-export`, `DELETE /siswa/account`      | Ekspor/hapus milik sendiri; autentikasi ulang                                                                  |
| `DELETE /auth/registration`                             | Membatalkan/menghapus pendaftaran sendiri pada sesi terbatas                                                   |

Endpoint yang diringkas dengan prefix modul dijabarkan saat implementasi. Jangan membuat endpoint baca jurnal siswa untuk BK atau superadmin.

Alur request: **route -> autentikasi -> role/status/CSRF -> validasi -> controller -> service -> repository -> database**. Pada service, periksa kembali kepemilikan, sekolah, persetujuan, dan kondisi transaksi yang relevan.

## 7. Konfigurasi dan cara menjalankan yang direncanakan

### Backend `.env.example`

```dotenv
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://app_user:replace_me@localhost:5432/langkahku
SESSION_SECRET=replace_with_a_long_random_secret
APP_ORIGIN=http://localhost:5173
SCHOOL_TIMEZONE=Asia/Jakarta
```

### Frontend `.env.example`

```dotenv
VITE_API_BASE_URL=/api/v1
```

Gunakan proxy Vite `/api` ke backend lokal. Produksi diarahkan melalui satu origin: frontend pada `/`, backend pada `/api`, sehingga pengaturan cookie lebih sederhana. Bila kelak memakai origin terpisah, konfigurasi ulang cookie/CORS secara eksplisit dengan allowlist, bukan wildcard berkredensial.

Tidak ada database URL, password, atau session secret di variabel `VITE_*`, bundle browser, maupun repositori. Cookie produksi memakai `HttpOnly`, `Secure`, kebijakan `SameSite` yang sesuai, dan proteksi CSRF. Konfigurasi trusted proxy hanya untuk proxy yang benar-benar digunakan.

Script yang perlu disediakan saat implementasi:

| Lokasi     | Script                         | Fungsi                                                              |
| ---------- | ------------------------------ | ------------------------------------------------------------------- |
| `backend`  | `npm run dev`                  | Server pengembangan dengan reload                                   |
| `backend`  | `npm start`                    | Server produksi                                                     |
| `backend`  | `npm run db:migrate`           | Migrasi database                                                    |
| `backend`  | `npm run seed:demo`            | Data fiktif; ditolak pada lingkungan produksi                       |
| `backend`  | `npm run bootstrap:superadmin` | Provisioning admin pertama melalui CLI yang aman                    |
| `backend`  | `npm run jobs:retention`       | Pekerjaan retensi/penghapusan, dipicu scheduler di luar proses HTTP |
| `frontend` | `npm run dev`                  | Vite dev server                                                     |
| `frontend` | `npm run build`                | Build frontend                                                      |
| Keduanya   | `npm run lint`, `npm test`     | Pemeriksaan kode dan pengujian relevan                              |

Script ini adalah kontrak rencana, belum dapat dijalankan sebelum proyek dibuat. Scheduler harus memastikan pekerjaan aman diulang dan tidak menghidupkan kembali akun/data yang dihapus. Migrasi dijalankan sebagai langkah rilis terkontrol, bukan setiap request.

## 8. Aturan implementasi penting

- **Approval adalah gerbang backend.** Mengubah role/status pada state browser tidak boleh membuka fitur privat.
- **Sesi terbatas berbeda dari sesi aktif.** Hanya endpoint status, keluar, dan pembatalan yang menerima sesi pendaftaran; semua fitur siswa memakai guard akun aktif.
- **Superadmin tidak dapat memberikan role lewat form siswa.** Pembuatan BK adalah operasi terpisah; pembuatan superadmin bukan registrasi publik.
- **Hak data tetap milik siswa.** Jurnal hanya pemilik; BK hanya ringkasan terpilih; akses superadmin dibatasi administrasi.
- **Service worker memakai allowlist konten publik.** Jangan cache `/auth`, API privat, journal, atau respons sesi. Unduhan luring publik dilakukan atas tindakan pengguna.
- **Sesi/isi pribadi tidak disimpan di localStorage.** Respons privat memakai `Cache-Control: no-store`; logout membersihkan state akun pada frontend.
- **Penyimpanan dan audit akurat.** Approval, penolakan, pencabutan, dan penghapusan dicatat tanpa menyalin teks pribadi/kredensial ke log.
- **Batas privasi PRD tetap berlaku.** Agregat kelompok kecil terlindungi, snapshot dapat dicabut, data terhapus tidak kembali setelah restore backup.

## 9. Urutan pembangunan dan pemeriksaan

1. Setup `backend`/`frontend`, koneksi PostgreSQL, migrasi, environment, dan komponen dasar maroon-pastel.
2. Implementasikan register/login/logout, sesi, tiga role, persetujuan, dan CLI superadmin awal.
3. Bangun antrean persetujuan superadmin; pastikan pending/rejected/suspended tidak mengakses fitur siswa.
4. Bangun fitur siswa sesuai PRD: refleksi, katalog, perbandingan, rencana, jurnal privat, konsultasi.
5. Bangun fitur BK: antrean, ringkasan berizin, penjadwalan, agregat, kurasi/layanan.
6. Lengkapi ekspor/hapus, retensi, unduhan publik PWA, aksesibilitas, dan pengujian penerimaan.

Pemeriksaan kritis sebelum penggunaan nyata:

- Siswa mendaftar selalu menjadi `siswa/pending_approval`, termasuk saat payload mencoba menyisipkan role admin.
- Hanya superadmin dapat menyetujui/menolak; BK/siswa ditolak pada endpoint yang sama.
- Dua keputusan bersamaan tidak menghasilkan status/audit yang bertentangan.
- Persetujuan akun tidak melewati kebutuhan persetujuan wali.
- Siswa pending/rejected/suspended tidak dapat mengirim request langsung ke API privat.
- Role tidak dapat membaca jurnal atau objek siswa lain yang tidak diizinkan.
- Sesi terputus/pemulihan/suspensi benar-benar mencabut akses berikutnya.
- Pendaftaran dapat dibatalkan, mempunyai retensi, dan tidak menyimpan password asli.

Struktur ini menjaga dua aplikasi utama tetap jelas, memakai JavaScript dan React sesuai permintaan, serta menempatkan **persetujuan pendaftaran siswa sebagai pekerjaan utama superadmin**.


## 10. Catatan realisasi implementasi

Implementasi kini tersedia pada backend/ dan frontend/; tree dan URL bagian sebelumnya adalah rancangan, bukan daftar file wajib satu per satu. SQL migrations terlacak dengan advisory lock, satu koneksi transaksi pg; tiga dokumen pribadi menggunakan JSONB tervalidasi dan versi, sementara identitas, persetujuan, jurnal, konsultasi/snapshot, konten, progress dan deletion_jobs terpisah. Tidak ada file kosong untuk memenuhi tree.

URL final: /api/v1/auth, /admin, /student, /bk, /public. Port backend lokal 3001, frontend 5173. Rute frontend final mencakup halaman publik (`/`, `/tentang`, `/cara-menggunakan`, `/peta-jalur`, `/cerita-langkah`, `/panduan-orang-tua`, `/faq`, `/privasi`, `/unduhan`), halaman akses (`/masuk`, `/daftar`, `/pemulihan`, `/status` pada `AccessPage.jsx`), portal siswa (`/beranda`, `/kenali-diriku`, `/rencana`, `/timbang-pilihan`, `/sapa-bk`), portal BK (`/bk/permintaan`, `/bk/agregat`, `/bk/kelola`), dan superadmin (`/superadmin/pendaftaran`) dengan lazy-loading rute serta komponen UI `components/ui/TextRoll.jsx`, `components/ui/AdaptiveNavPill.jsx`, `components/ui/AsmrBackground.jsx`, dan `components/ui/Reveal.jsx`. Script alias db:migrate, seed:demo, bootstrap:superadmin, jobs:retention tersedia bersama migrate, seed, bootstrap, retention. Worker kontinu jobs:work, backup dan restore terpisah dari HTTP. Lihat README.md dan docs/operations.md untuk konfigurasi nyata serta docs/verification.md untuk hasil. Fitur/operasi yang belum divalidasi tetap terbuka di task.md.

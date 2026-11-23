# LANGKAHKU

Persiapan deployment manual tanpa data dummy: [hasil persiapan 23 November 2026](docs/production-preparation-2026-11-23.md) dan [panduan deployment](deploy/README.md). Database lokal telah dibersihkan; hanya akun SuperAdmin yang disiapkan. Pemeriksaan historis sebelum pembersihan: [audit 22 November 2026](docs/readiness-status-2026-11-22.md).

Paket deployment production dan gerbang pra-rilis tersedia di [deploy/README.md](deploy/README.md). Baca [audit hardening terbaru](docs/production-hardening-2026-11-22.md) untuk perubahan UI/kode, hasil pengujian, dan gerbang operasional yang masih terbuka. Dari `backend/`, jalankan `npm run check:production` untuk pemeriksaan otomatis; exit `1` berarti belum memenuhi gerbang tersebut.

Runtime yang didukung: Node.js 24 LTS. Gunakan build statis dan reverse proxy HTTPS untuk production.

Aplikasi lokal React/Vite/Tailwind/React Router + Express ES Modules + PostgreSQL (`pg`, sesi server). Desktop terlebih dahulu, sembilan template Stitch dikonversi menjadi React; referensi asli dipertahankan.

Milestone registrasi siswa → pending → keputusan superadmin → izin wali terpisah → akses server telah diimplementasikan. Fitur siswa, konsultasi berizin, area BK, hak data, worker retensi, backup terenkripsi, PWA publik, dan cetak menggunakan API/database nyata. Kesiapan produksi tetap bergantung pada validasi sekolah dan operasi; rincian bukti/pekerjaan terbuka ada di `task.md` dan `docs/verification.md`.

## Menjalankan

Terminal backend:

```powershell
cd D:\PEOJECTTTTTTT\LANGKAHKU\backend
npm ci
npm run db:local
npm run migrate
# Untuk database baru: buat superadmin pertama, tanpa mengisi data contoh.
npm run setup:production
npm run dev
```

Terminal frontend:

```powershell
cd D:\PEOJECTTTTTTT\LANGKAHKU\frontend
npm ci
npm run dev
```

Terminal worker:

```powershell
cd D:\PEOJECTTTTTTT\LANGKAHKU\backend
npm run jobs:work
```

Buka [LANGKAHKU lokal](http://127.0.0.1:5173). API [health](http://127.0.0.1:3001/api/v1/health). Helper lokal memakai PostgreSQL yang terpasang di `D:/ProgramFile/PostgreSQL/15/bin`; ubah `PG_BIN` jika berbeda. Untuk database lain, isi `backend/.env` dari `.env.example` dan lewati `db:local`. Helper tidak menimpa `.env` yang sudah ada.

Untuk pemakaian harian, cukup jalankan `npm run dev` di masing-masing terminal backend dan frontend. Backend development otomatis menyalakan cluster proyek `127.0.0.1:55432/langkahku` dan menerapkan migrasi yang belum dijalankan sebelum server dimulai. Database lain dan mode production tetap memakai langkah setup/migrasi manual. Jika Vite menampilkan `ECONNREFUSED 127.0.0.1:3001`, periksa terminal backend: API belum berhasil berjalan.

Mode demo default nonaktif. `setup:production` menghapus sekolah seed beserta akun/relasinya dan seluruh materi bertanda demo, lalu membuat superadmin pertama. Perintah ini hanya dijalankan operator; tidak berjalan saat startup/migrasi dan tidak menimpa password jika diulang. Fixture fiktif hanya tersedia di `backend/tests/fixtures`, dibatasi ke database test, dan tidak masuk image production. Setelah login sebagai superadmin, buat akun BK dan isi konten aktual. Kredensial awal deployment tersedia di file privat `deploy/bootstrap-superadmin.json` (diabaikan Git dan Docker build); password tidak disimpan di kode atau bundle.

Login dipisahkan menjadi [akses siswa](http://127.0.0.1:5173/masuk) dan [akses superadmin/BK](http://127.0.0.1:5173/masuk?akses=staf). Pemilih akses membalik kartu dengan animasi 3D; perangkat dengan pengurangan animasi beralih langsung. Backend memeriksa kecocokan `audience` login dengan role akun sebelum membuat sesi. Hak akses setiap endpoint tetap ditentukan role dari database.

## Pemeriksaan

```powershell
# backend; database test terpisah wajib, nama berakhiran _test
npm run lint
npm test

# frontend
npm run lint
npm test
npm run build
```

Build menghasilkan `frontend/dist/` termasuk worker dengan allowlist aset berhash. Untuk memeriksa PWA produksi lokal, hentikan Vite dev lalu `npm run preview -- --port 5173` agar origin tetap sesuai konfigurasi. API privat selalu no-store; hanya shell publik dan materi yang dipilih eksplisit yang boleh disimpan luring.

Konfigurasi utama: `DATABASE_URL`, `TEST_DATABASE_URL`, `SESSION_SECRET`, `APP_ORIGIN`, `PORT`, `NODE_ENV`, `TRUST_PROXY`, `DEMO_MODE`. Retensi otomatis usia/angkatan default nonaktif: `RETENTION_ENABLED=false`. Lihat [panduan operasi](docs/operations.md) untuk kebijakan retensi, worker, backup AES-GCM, restore dengan tombstone, rilis, dan panduan tiap role. Semua secret tetap server-side, tidak ada `VITE_*` berisi kredensial.

[Audit sembilan template](docs/design-audit.md) · [Bukti verifikasi](docs/verification.md) · [Protokol validasi sekolah](docs/validation-protocol.md).

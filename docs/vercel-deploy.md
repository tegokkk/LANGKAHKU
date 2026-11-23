# Panduan Deploy LANGKAHKU di Vercel

Dokumen ini menjelaskan dua skenario deployment LANGKAHKU di Vercel beserta konfigurasi environment yang wajib disiapkan.

---

## Opsi 1 (Direkomendasikan untuk Produksi / Data Siswa Nyata): Frontend di Vercel + Backend/Worker di Host Persisten

Karena LANGKAHKU memerlukan **worker retensi/penghapusan berkala** (`npm run jobs:work`), **penyimpanan ledger penghapusan persisten** (`DELETION_LEDGER_PATH` di luar database), dan **backup terenkripsi harian** (`npm run backup`), arsitektur paling aman untuk produksi adalah:

1. **Backend + Worker + PostgreSQL** dijalankan di host persisten (Railway, Render, Fly.io, atau VPS Linux).
   - Jalankan migrasi (`npm run migrate`) dan bootstrap superadmin (`npm run bootstrap:superadmin`).
   - Jalankan proses API (`npm run start`) dan proses worker (`npm run jobs:work`) di bawah supervisor.
2. **Frontend di Vercel**:
   - Pada pengaturan proyek Vercel, set **Root Directory** ke `frontend`.
   - Vercel akan otomatis membaca `frontend/vercel.json`.
   - Tambahkan aturan rewrite same-origin pada `frontend/vercel.json` **sebelum** rewrite fallback `/index.html` agar cookie sesi (`SameSite=Lax; HttpOnly; Secure`) tetap berada pada satu origin yang sama:
     ```json
     {
       "source": "/api/:path*",
       "destination": "https://api-domain-anda.example.com/api/:path*"
     }
     ```
   - Di server backend, set `APP_ORIGIN=https://nama-proyek.vercel.app` dan `TRUST_PROXY=1`.

---

## Opsi 2 (Cepat untuk Staging / Preview Full-Stack di Vercel)

Konfigurasi root `vercel.json` dan `api/index.mjs` memungkinkan frontend statis (`frontend/dist`) dan Express API (`/api/v1/*`) berjalan langsung pada satu domain Vercel yang sama.

### Langkah Deploy
1. Pastikan **Root Directory** di Vercel dibiarkan kosong (`.` / root proyek).
2. Siapkan database PostgreSQL eksternal (misalnya Neon, Supabase, atau Railway Postgres) dan jalankan migrasi dari terminal lokal ke database target:
   ```powershell
   cd backend
   $env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require"
   npm run migrate
   npm run bootstrap:superadmin
   ```
3. Tambahkan **Environment Variables** berikut di **Vercel Project Settings → Environment Variables**:

| Variabel | Contoh / Nilai Wajib |
| --- | --- |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require` |
| `SESSION_SECRET` | String acak minimal 32 karakter (buat dengan `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) |
| `APP_ORIGIN` | `https://domain-vercel-anda.vercel.app` (wajib HTTPS, tanpa garis miring di akhir) |
| `TRUST_PROXY` | `1` |
| `DEMO_MODE` | `false` (wajib `false` di `NODE_ENV=production`) |
| `RETENTION_ENABLED` | `false` (aktifkan `true` hanya setelah kebijakan retensi sekolah disahkan) |
| `DELETION_LEDGER_PATH` | `/tmp/langkahku-deletions.ndjson` *(khusus preview/staging; lihat catatan batas serverless di bawah)* |

4. Deploy melalui dashboard Vercel (GitHub/GitLab) atau Vercel CLI (`npx vercel --prod`).

> **Batasan Penting Mode Serverless (Opsi 2)**:
> - Filesystem serverless Vercel bersifat sementara (`/tmp` hilang saat container recycle). Untuk **data siswa nyata**, ledger penghapusan (`DELETION_LEDGER_PATH`) dan worker (`npm run jobs:work`) **wajib** berjalan pada penyimpanan persisten (gunakan **Opsi 1**).
> - Jangan pernah mengaktifkan `DEMO_MODE=true` atau menjalankan `seed:demo` pada database produksi.

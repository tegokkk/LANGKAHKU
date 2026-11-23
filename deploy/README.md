# Deployment LANGKAHKU

Paket ini menyediakan satu origin untuk SPA/API, PostgreSQL 15, Caddy dengan TLS otomatis, worker retensi, dan backup AES-GCM harian. Paket belum diuji dengan Docker di workstation audit karena Docker tidak terpasang. Jalankan semua langkah di staging terpisah sebelum menerima data siswa nyata.

## Persiapan

1. Siapkan Linux dengan Docker Engine dan Compose v2. Domain harus mengarah ke server dan port 80/443 dapat dijangkau. Jangan publikasikan port API atau PostgreSQL.
2. Salin `deploy/.env.example` menjadi `deploy/.env`. Batasi izin file (`chmod 600 deploy/.env`). Isi domain, kontak operator, password DB owner/runtime yang berbeda, session secret acak, dan backup key dari 32 byte acak dalam base64. URL-encode password di kedua connection string. Jangan menyalin `.env` development ke server. File privat `deploy/bootstrap-superadmin.json` sudah disiapkan dengan akun yang diminta; salin secara privat ke server dan batasi izinnya (`chmod 600 deploy/bootstrap-superadmin.json`). Ganti `schoolName` dengan nama sekolah aktual bila sudah diketahui; nilai awal `LANGKAHKU` adalah nama aplikasi, tanpa kontak atau layanan fiktif.
3. Simpan backup key di secret manager terpisah; kehilangan key membuat backup tidak dapat dipulihkan. Volume Docker bertahan saat container diganti, tetapi bukan salinan off-site. Replikasi volume ledger dan backup terenkripsi ke penyimpanan lain; ledger harus lebih baru daripada backup yang dipulihkan.
4. Seluruh perintah Compose berikut dijalankan dari root proyek. Gunakan `--env-file deploy/.env` pada **setiap** perintah. File ini dibaca untuk interpolasi; API hanya menerima variabel runtime, tanpa kredensial owner DB atau backup key.

## Peluncuran staging

```sh
docker compose --env-file deploy/.env -f compose.production.yml config --quiet
docker compose --env-file deploy/.env -f compose.production.yml build
docker compose --env-file deploy/.env -f compose.production.yml up -d
docker compose --env-file deploy/.env -f compose.production.yml ps
```

Migrasi satu kali harus sukses sebelum API/worker berjalan. `init-database.sh` membuat role `langkahku_app` hanya pada volume database baru. Untuk database yang sudah ada, DBA perlu membuat role tersebut dan mencabut izin CREATE schema sebelum menjalankan migrasi. Migrator menggunakan `MIGRATION_DATABASE_URL`; API menggunakan role runtime tanpa superuser/DDL. Jangan menjalankan seed demo di production; seed tidak disertakan dalam image.

Siapkan database tanpa dummy dan buat superadmin pertama memakai file input privat (shell Linux, dari root proyek):

```sh
docker compose --env-file deploy/.env -f compose.production.yml exec -T api node scripts/prepare-production.js < deploy/bootstrap-superadmin.json
rm deploy/bootstrap-superadmin.json
```

Alternatif PowerShell: `Get-Content -Raw deploy/bootstrap-superadmin.json | docker compose --env-file deploy/.env -f compose.production.yml exec -T api node scripts/prepare-production.js`, lalu hapus file privat tersebut setelah berhasil. Alternatif interaktif: `docker compose --env-file deploy/.env -f compose.production.yml exec api node scripts/prepare-production.js`; masukkan nama sekolah, username dan password di terminal privat. Password tidak dimasking. Tidak ada password default dalam image. Menyalin source/image tidak menyalin akun database lokal; bootstrap pada database server tetap diperlukan.

Setup menghapus seluruh sekolah seed dan relasinya serta materi `demo=true`, kemudian membuat tepat satu superadmin pada database baru dalam transaksi yang sama. Pengulangan dengan akun/password sama aman dan tidak meresetnya; akun berbeda/bertabrakan ditolak. Tidak ada akun BK/siswa, konsultasi, cerita alumni, atau katalog contoh yang dibuat. Username login tidak membedakan kapital: `SuperAdmin` diterima dan disimpan sebagai `superadmin`. Akses melalui `/masuk?akses=staf`.

Masuk sebagai superadmin, buat akun BK, catat angkatan dan tanggal penghapusan. Masuk sebagai BK, isi jam layanan/kontak aktual dan terbitkan konten bersumber yang ditinjau sekolah. Katalog tetap kosong sampai konten aktual diterbitkan. Sahkan prosedur izin wali, bantuan akun, retensi, serta penanggung jawab insiden; setelah itu aktifkan `RETENTION_ENABLED=true` dan terapkan ulang container API/worker.

Pemeriksaan pra-rilis dijalankan dari container worker karena container ini memiliki akses tulis ledger:

```sh
docker compose --env-file deploy/.env -f compose.production.yml exec worker node scripts/check-production.js
```

Exit code `1` berarti ada gerbang teknis yang belum terpenuhi. Exit `0` memverifikasi pemeriksaan otomatis, bukan pengesahan konten, hukum/kebijakan sekolah, kelayakan hosting, atau hasil uji pengguna. Pengujian manual tetap mengikuti `docs/validation-protocol.md`.

## Pemantauan

| Probe | Makna |
| --- | --- |
| `/api/v1/health/live` | Proses HTTP hidup; tidak bergantung database |
| `/api/v1/health` | Database dapat diakses; tetap kompatibel dengan probe lama |
| `/api/v1/health/ready` | Database dan, di production, worker retensi sukses dalam 3 menit terakhir; mengembalikan 503 jika sedang shutdown |
| `check-worker.js` | Heartbeat worker belum kedaluwarsa dan tidak ada kegagalan pada siklus terakhir |
| `check-backup.js` | Ada berkas backup terenkripsi berumur kurang dari 26 jam; tidak membuktikan validitas hasil restore |

Caddy menghentikan forwarding ke API yang tidak siap. Aktifkan monitor eksternal terhadap HTTPS dan status container serta alert `request_failed`, `database_idle_error`, `retention_failed`, `retention_result.failed>0`, `backup_failed`, dan `shutdown_timeout`. Pantau disk/volume, antrean penghapusan dan usianya (target maksimal 24 jam), penggunaan koneksi, serta lonjakan 429/503. Docker `restart: unless-stopped` memulihkan proses yang keluar; status **unhealthy saja tidak memicu restart**. Operator/monitor harus menindaklanjuti status tersebut.

Setiap respons API memuat `X-Request-ID` untuk mencocokkan laporan pengguna dengan log. Log hanya berisi event, route template, metode, status, durasi, serta kode; body, password, jurnal, cookie, dan username tidak dicatat. Ledger hanya berisi ID penghapusan dan waktu; file ditulis dengan flush sebelum transaksi hapus di-commit. Worker membatasi tiap siklus maksimal 500 antrean retensi dan 100 penghapusan; sesuaikan kapasitas dan alert jika antrean tertinggal.

## Backup, restore, dan rilis berikutnya

Backup dijalankan saat proses backup mulai dan setiap 24 jam setelah sukses; kegagalan dicoba ulang setelah 5 menit. Berkas disimpan terenkripsi dengan masa simpan lokal 30 hari. Volume API hanya dapat membaca ledger/backup; worker hanya menulis ledger, proses backup hanya menulis direktori backup.

Implementasi backup saat ini menampung dump dalam memori dan membatasi keluaran proses PostgreSQL 256 MiB. Pantau ukuran database; untuk skala di atas batas tersebut gunakan backup streaming yang diuji atau solusi backup PostgreSQL terkelola. Berkas `.lkb` baru dipublikasikan melalui rename setelah penulisan lengkap agar file parsial tidak lolos probe freshness.

Lakukan uji restore berkala ke database kosong berakhiran `_restore`, dengan binary PostgreSQL yang cocok serta backup key dan ledger eksternal terbaru. Jalankan migrasi baru jika backup berasal dari versi lama. Verifikasi akun yang sudah dihapus tidak kembali, sesi lama kosong, worker dimulai ulang, dan alur fitur berjalan sebelum promosi. `docs/operations.md` menjelaskan prosedur restore; jangan arahkan restore langsung ke database aktif.

Untuk pembaruan gunakan `RELEASE_TAG` unik dan simpan image versi sebelumnya. Ambil backup, uji staging, bangun image, jalankan migrasi, lalu ganti service. Migrasi saat ini bersifat tambahan. Rollback kode hanya aman selama skema tetap kompatibel; jangan menghapus tabel atau mengembalikan backup di database aktif sebagai rollback otomatis. Jangan menjalankan `docker compose down -v` pada lingkungan yang berisi data yang diperlukan.

Origin cookie memerlukan HTTPS nyata. Pengujian lokal HTTP memakai `NODE_ENV=development` dan tidak mewakili konfigurasi cookie production. Vite dev/preview bukan server production; image melayani build statis melalui Express di belakang Caddy.

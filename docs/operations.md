# Panduan operasi LANGKAHKU

## Menjalankan pengembangan

Node.js 24 LTS dan PostgreSQL 15+ telah diuji pada Windows. Jalankan perintah npm dari folder aplikasi terkait. PostgreSQL yang sedang berjalan di komputer tidak dimodifikasi: helper membuat cluster proyek `.local/postgres` di loopback port 55432, dengan password acak. `PG_BIN` dapat menunjuk direktori bin PostgreSQL yang lain.

Backend: `npm ci`, `npm run db:local`, `npm run migrate`, `npm run setup:production` (hanya database awal), `npm run dev`. Helper db:local membuat `.env` jika belum ada dengan `DEMO_MODE=false`, menyiapkan database `langkahku` dan `langkahku_test` terpisah. Jika memakai PostgreSQL Anda sendiri, salin `.env.example` menjadi `.env`, isi konfigurasi, dan lewati db:local. Jangan mengganti `.env` yang telah berisi kredensial pengguna.

Frontend: `npm ci`, `npm run dev`. Buka `http://127.0.0.1:5173`. Proxy `/api` menuju backend port 3001. Cookie origin harus konsisten; `localhost` dan `127.0.0.1` jangan dicampur. Produksi harus memakai satu origin HTTPS, frontend statis `/`, API `/api`, reverse proxy menuju backend loopback.

Worker: `npm run jobs:work` dari backend. Proses terpisah memeriksa setiap 60 detik, menyelesaikan hapus mandiri, mengosongkan snapshot berakhir, serta membersihkan sesi kedaluwarsa. `npm run jobs:retention` untuk satu kali eksekusi. Retensi angkatan/pending hanya berjalan jika `RETENTION_ENABLED=true`; hapus mandiri tetap berjalan. Pastikan worker dipantau dan dimulai ulang oleh supervisor di produksi agar target <=24 jam tercapai. Job gagal dicatat tanpa isi pribadi dan otomatis dicoba ulang. Superadmin dapat melihat status job sekolahnya di tab Retensi & pekerjaan data.

Data dummy telah dikeluarkan dari alur aplikasi. Fixture hanya berada di `tests/fixtures`, memerlukan `NODE_ENV=test` dan database test terpisah berakhiran `_test`, serta tidak disertakan dalam image production. `setup:production` menghapus sekolah `SMA Ruang Tumbuh (Demo)` berikut seluruh akun/relasi sekolah itu dan materi `demo=true` di semua sekolah. Jalankan hanya sebagai persiapan awal yang disengaja; tidak ada pembersihan otomatis saat startup. Data operasional di sekolah lain dipertahankan. Perintah menolak akun yang bertabrakan dan tidak mengganti password admin yang sudah tersedia.

Bootstrap bersih: gunakan database kosong, migrasi, lalu `npm run bootstrap:superadmin`. CLI menanyakan sekolah, username, dan kata sandi baru melalui stdin. Jalankan di terminal privat; input password pada CLI ini tidak dimasking. Tidak ada endpoint pendaftaran staf. Superadmin membuat akun BK melalui UI dan mengirim kredensial melalui prosedur sekolah di luar aplikasi.

Untuk otomasi non-TTY, kirim satu objek JSON berisi `schoolName`, `username`, `password` melalui stdin yang terlindungi, bukan argumen shell/file sumber/log. CLI tidak mencetak input dan menolak bootstrap kedua. Alur CLI → migrasi/database kosong diuji pada `tests/bootstrap.test.js`.

## Peran dan tugas rutin

Siswa: daftar, simpan kode pemulihan yang ditampilkan satu kali, pantau keputusan, hubungi petugas sekolah bila izin wali masih pending. Gunakan Diriku/Jalur/Rencana/BK setelah aktif. Jurnal di panel Beranda/Rencana; pengaturan melalui nama akun. Pengeksporan dan penghapusan memerlukan kata sandi ulang. Kode pemulihan mengganti password dan mencabut sesi lama; bila kode hilang, verifikasi langsung di sekolah. Mekanisme pemulihan manual harus ditetapkan operator tanpa membuka isi siswa.

Superadmin: filter antrean; beri keputusan sekali, alasan wajib untuk penolakan; verifikasi wali lewat operasi terpisah dan catat referensi minimum. Status approved/suspended hanya untuk akun yang sudah disetujui; perubahan status mencabut sesi. Akun BK terikat sekolah. Tab retensi mencatat angkatan/tanggal, lalu tetapkan siswa ke angkatan dari detail pendaftaran. Tidak ada hak baca data konseling otomatis.

BK: hanya permintaan yang ditugaskan ke dirinya dalam sekolah. Jadwalkan dengan waktu/lokasi, usulkan penjadwalan ulang, tandai selesai setelah dijadwalkan, atau tutup dengan alasan. Ringkasan diperiksa ulang pada setiap muat; UI memperbarui berkala. Guru tidak membaca jurnal atau jawaban asli. Kurasi memakai teks biasa dan sumber HTTPS; publikasi memerlukan peninjau, tanggal tinjau, batas berlaku, dan sumber. Arsip tidak mengubah label pilihan yang telah disimpan siswa. Perbarui kontak/jam layanan berdasarkan verifikasi sekolah.

## Backup, penghapusan, dan restore

`npm run backup` membutuhkan `BACKUP_KEY` base64 32 byte acak dari secret manager, `BACKUP_DIRECTORY` terbatas aksesnya, dan `PG_BIN`. Key tidak memiliki nilai bawaan dan tidak dicetak. Hasil `.lkb` berformat AES-256-GCM terautentikasi; dump tidak ditulis sebagai plaintext. Helper menghapus hanya file backup bernama miliknya yang berumur >30 hari di direktori tersebut. Jadwalkan harian dan pantau hasil; simpan kunci terpisah, replikasi backup serta ledger ke penyimpanan yang ditentukan sekolah. Batas memori dump 256 MB dan timeout 120 detik cocok untuk pilot, perlu dievaluasi sebelum kapasitas lebih besar.

`DELETION_LEDGER_PATH` menyimpan tombstone UUID dan waktu penghapusan, tanpa profil/jawaban. **Wajib persisten di luar siklus restore database**. Path lokal pengembangan `.local/deletion-ledger.ndjson` hanya contoh penyimpanan; bukan pengganti penyimpanan tahan insiden produksi. Tetapkan kontrol akses, replikasi, dan retensi ledger melalui operator sebelum data nyata.

Pemulihan dilakukan saat target belum melayani pengguna:

1. Buat database kosong terisolasi dengan nama berakhiran `_restore`.
2. Sediakan `RESTORE_DATABASE_URL`, `BACKUP_FILE`, `BACKUP_KEY`, dan `DELETION_LEDGER_PATH` terbaru melalui environment aman. CLI menolak ledger hilang, key salah, target tidak kosong atau tanpa suffix yang diwajibkan.
3. Jalankan `npm run restore`. Sesi backup dihapus; semua tombstone dan permintaan penghapusan yang ada dalam backup diterapkan; snapshot dicabut/kedaluwarsa dikosongkan sebelum sukses.
4. Jalankan migrasi tertinggal di target, periksa jumlah/akses, login ulang dengan akun uji, verifikasi data terhapus tidak ada. Lakukan smoke test staging. Baru operator dapat mengalihkan trafik setelah verifikasi selesai.
5. Simpan bukti restore dan kegagalannya tanpa isi siswa. Jangan rollback ke salinan yang menghidupkan ulang sesi atau data terhapus.

`tests/backup.test.js` menguji enkripsi, key salah, restore terisolasi, sesi kosong dan penerapan tombstone menggunakan database test; bukan klaim backup produksi telah terpasang. Jadwal backup, penyimpanan eksternal, RPO/RTO dan uji insiden operasional tetap memerlukan pilihan hosting/operator.

## Checklist rilis terkontrol

- Pisahkan database development, test, staging, produksi; `NODE_ENV=production`, `DEMO_MODE=false`, HTTPS, secret acak kuat, `TRUST_PROXY` sesuai jumlah proxy tepercaya.
- Akun database aplikasi minimum hak; role migrasi/backup terpisah. Batasi log, cookie, koneksi, akses ledger/backup dan environment.
- Migrasi sebelum membuka trafik. Build frontend dan cek worker cache publik. Uji register → approval/wali → rencana → konsultasi → BK → cabut → ekspor/hapus pada staging dengan data fiktif.
- Tetapkan petugas, pemberitahuan/persetujuan sekolah, retensi, bantuan aktual, monitoring worker/job gagal, backup harian, dan prosedur insiden.
- Jalankan validasi ahli dan peserta pada protokol `validation-protocol.md`. Temuan privasi atau tugas inti yang gagal memblokir rilis data nyata.

Menonaktifkan server pengembangan tidak menghapus database. `npm run db:stop` menghentikan hanya cluster proyek. Instalasi PostgreSQL yang sudah berjalan tetap dibiarkan.

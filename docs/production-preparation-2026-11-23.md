# Persiapan deployment manual — 23 November 2026

Pembersihan database aplikasi lokal dan persiapan source/build selesai. Deployment ke server belum dilakukan. Gunakan [panduan deployment](../deploy/README.md) untuk konfigurasi infrastruktur dan bootstrap database tujuan.

## Data aplikasi

- Dihapus: satu sekolah demo, 36 akun demo/uji, 26 materi demonstrasi, beserta profil, rencana, jurnal, konsultasi, snapshot, persetujuan dan pekerjaan data terkait.
- Tersisa: satu sekolah bernama aplikasi `LANGKAHKU`, tanpa kontak/jam layanan rekaan, dan satu superadmin berstatus `approved`.
- Username login `SuperAdmin` diterima tanpa membedakan kapital dan disimpan sebagai `superadmin`. Password disimpan sebagai hash Argon2id. Nilai plaintext hanya berada dalam file bootstrap privat yang diminta pemilik; file itu dikecualikan dari Git dan Docker build.
- Akun siswa/BK, katalog, dokumen siswa, jurnal, konsultasi, snapshot, angkatan, dan pekerjaan penghapusan kosong.
- `DEMO_MODE=false`; helper database baru juga memakai default ini. Perintah seed demo dihapus dari npm scripts. Fixture hanya dapat berjalan pada database test terpisah dan tidak disertakan dalam image production.
- Cache materi luring lama tidak dipakai versi baru dan dibersihkan ketika service worker baru aktif. Landing page menampilkan keadaan kosong sampai materi aktual diterbitkan.

## Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| Backend lint, tanpa warning | Lulus |
| Backend tests | 23/23 lulus |
| Frontend lint, tanpa warning | Lulus |
| Frontend tests | 21/21 lulus, 8 file |
| Build statis production dan service worker | Lulus |
| Audit dependensi backend/frontend | 0 kerentanan |
| Login HTTP melalui proxy frontend lokal | Berhasil, role superadmin, tujuan `/superadmin/pendaftaran` |
| Respons API lokal | Mode demo false; katalog, akun BK dan pendaftaran siswa kosong |
| Setup transaksi | Pembersihan relasi, pelestarian data sekolah lain, penolakan bentrok akun, tidak mereset password saat diulang, dan login admin diuji |
| Aktivasi service worker | Cache versi lama dihapus; cache versi baru dipertahankan |

Pemeriksaan `check:production` di workstation pengembangan menghasilkan **3/14 lulus**, termasuk migrasi, tidak ada data dummy, dan tidak ada siswa yang kehilangan tanggal retensi. Pemeriksaan ini tetap keluar dengan kode 1 karena workstation memakai HTTP/development, role DB pengembangan, dan belum memiliki konfigurasi operasi server production. Hasil tersebut tidak disembunyikan atau dipaksakan lulus.

## Yang dilakukan operator saat deployment

1. Isi `deploy/.env` dari contoh dengan domain/origin HTTPS, secret acak, kredensial database owner/runtime terpisah dan backup key. Konfigurasi Compose sudah memakai `NODE_ENV=production`, mode demo nonaktif, build statis, reverse proxy, worker dan volume persisten.
2. Jalankan build, migrasi dan service sesuai panduan. Bootstrap dari file privat `deploy/bootstrap-superadmin.json` pada database server; akun lokal tidak otomatis ikut source/image. Hapus file privat setelah bootstrap server berhasil.
3. Isi nama sekolah aktual, buat akun BK, lengkapi jam/kontak layanan dan konten aktual melalui alur pengelola. Tetapkan kebijakan retensi, backup/off-site, monitoring dan uji restore sebelum menerima data siswa nyata.
4. Jalankan ulang `check:production` dari worker server dan verifikasi HTTPS/staging. Docker tidak tersedia di workstation ini, sehingga build/run container dan TLS di server belum teruji.

Dokumen audit tanggal 22 November adalah catatan historis sebelum pembersihan dan tidak menggambarkan isi database lokal terbaru.

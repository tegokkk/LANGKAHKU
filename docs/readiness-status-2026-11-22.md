# Status kesiapan LANGKAHKU â€” 22 November 2026

Pemeriksaan lingkungan: **22:56 WIB (Asia/Bangkok, UTC+7)**. Keputusan: **NO-GO untuk production/data siswa nyata**. Layanan lokal berfungsi dan seluruh pengujian otomatis lulus, tetapi konfigurasi serta operasi production belum dipenuhi.

Ini merupakan pemeriksaan ulang setelah penyatuan desain kartu dan perbaikan tombol Tinjau/persetujuan. Tidak ada keputusan persetujuan, penolakan, atau penghapusan siswa pada database pengembangan yang dijalankan dalam audit ini. Tes integrasi menggunakan database pengujian terpisah.

## Hasil yang diverifikasi ulang

| Pemeriksaan | Hasil | Bukti/cakupan |
| --- | --- | --- |
| Backend lint | Lulus, 0 warning | `npm run lint -- --max-warnings=0` |
| Backend test | **21/21 lulus** | PostgreSQL nyata: registrasi, approval, izin wali, role/sekolah, konflik versi, jurnal, konsultasi/snapshot, ekspor, penghapusan, retensi, runtime, backup dan restore terisolasi |
| Frontend lint | Lulus, 0 warning | `npm run lint -- --max-warnings=0` |
| Frontend test | **16/16 lulus**, 7 file | `npm test -- --pool=threads --maxWorkers=1`; termasuk 3 regresi approval, privasi, sesi, respons API, race request, cetak dan allowlist service worker |
| Build | Lulus | `npm run build`; Vite dan generator service worker berhasil |
| Audit dependensi | **0 kerentanan** backend/frontend | `npm audit --audit-level=high` |
| Login tiga role | Lulus | `admin.demo`, `bk.demo`, `siswa.demo` aktif; login, akses endpoint sesuai peran, lalu logout berhasil |
| HTTP melalui frontend/proxy | **8/8 sesuai harapan** | Lima endpoint publik/health merespons 200; tiga endpoint privat tanpa sesi merespons 401 |
| Privasi respons API | Lulus | Respons yang diperiksa memiliki `Cache-Control: no-store, private`; tidak memberikan data privat kepada pengunjung tanpa sesi |
| Scan bundle | 0 kecocokan pada 20 berkas teks | Mencari session secret, URL database, backup key jika disediakan, password demo lokal, connection string PostgreSQL, dan penanda private key; nilai secret tidak disimpan dalam laporan |
| Migrasi | Lulus | Migrasi yang ada lengkap |
| Compose | Pemeriksaan statis lulus | YAML dapat dibaca; API/database tidak memublikasikan port; API tidak menerima backup key atau kredensial migrator |
| Docker/staging/HTTPS | **Belum diuji** | Docker Engine tidak tersedia pada workstation; tidak ada deployment staging/production yang diverifikasi |
| Gerbang production | **2/13 lulus** | `npm run check:production` keluar dengan kode 1; yang lulus hanya migrasi dan ketersediaan akun pengelola sekolah |

## Penghambat rilis, menurut prioritas

| Prioritas | Penghambat | Dampak / langkah berikutnya |
| --- | --- | --- |
| P0 | Lingkungan masih `development`, `DEMO_MODE=true`, HTTP | Siapkan staging/production terpisah, domain HTTPS, secret production, cookie aman dan reverse proxy. Jangan menggunakan akun demo sebagai akun operasional |
| P0 | Heartbeat worker retensi/penghapusan kosong | Belum ada bukti worker berjalan. Permintaan hapus dapat tertahan dan target pemrosesan 24 jam belum terjamin. Pasang supervisor, jalankan worker sesuai kebijakan, serta alert antrean/gagal/kedaluwarsa |
| P0 | Ledger persisten dan backup production belum dikonfigurasi/terverifikasi | Sediakan penyimpanan persisten terpisah, backup terenkripsi harian, kunci terpisah, salinan off-site, dan latihan restore dengan ledger terbaru |
| P0 | Semua **26 materi terbit masih demo** | Tidak ada materi non-demo terbit. Kurasi dan sahkan sumber oleh ahli BK untuk keempat kategori jalur; jangan sekadar mengganti flag demo |
| P0 | Kontak/jam layanan, kebijakan retensi, dan jadwal penghapusan siswa belum lengkap | Tetapkan penanggung jawab, kontak/jam/estimasi layanan, SOP izin wali dan pemulihan akun, jadwal angkatan, lalu aktifkan retensi setelah kebijakan disahkan |
| P1 | Role DB runtime memiliki hak berlebih | Terapkan role runtime minimum yang terpisah dari owner/migrator sebelum deployment |
| P1 | Frontend masih dilayani Vite dev; `STATIC_DIR` belum disetel | Build tersedia, tetapi hosting production satu origin belum dikonfigurasi. Ini bukan kegagalan build. Terapkan paket deployment dan uji SPA deep links/asset caching |
| P1 | Git/CI/monitoring operasional belum aktif terverifikasi | Folder belum merupakan repositori Git. Workflow CI tersedia sebagai berkas, tetapi belum dijalankan di penyedia CI; tetapkan rilis bertag, rollback dan monitoring eksternal |
| P1 | Uji pengguna/perangkat/staging belum lengkap | Lakukan validasi ahli BK/media, 5â€“8 pengguna, keyboard/pembaca layar, perangkat fisik, cetak/PDF dan PWA offline pada deployment staging |

`/api/v1/health/ready` saat ini merespons 200 karena pada **mode development** probe tersebut hanya memeriksa database. Pemeriksaan heartbeat worker baru diwajibkan oleh endpoint itu pada mode production. Respons hijau ini tidak menggantikan hasil pra-rilis **2/13**.

Implementasi backup saat ini membatasi dump yang ditampung dalam memori hingga 256 MiB. Uji kapasitas sebelum penggunaan lebih besar; kesiapan untuk skala database di atas batas tersebut belum terbukti.

## Langkah menuju GO

1. Terapkan paket deployment di staging dengan secret berbeda, HTTPS dan role DB minimum.
2. Konfigurasikan worker, ledger, backup/off-site, monitoring dan restore; verifikasi penghapusan dalam target operasional.
3. Lengkapi materi non-demo, layanan BK, kebijakan sekolah dan jadwal retensi; gunakan akun operasional yang sesuai.
4. Jalankan ulang preflight dari worker dan tuntaskan validasi pengguna/perangkat. Exit 0 pada preflight tetap harus disertai bukti manual staging dan pengesahan sekolah.

Panduan: [deployment](../deploy/README.md). Bukti lingkungan tanpa secret: [readiness-evidence-2026-11-22.json](readiness-evidence-2026-11-22.json). Riwayat implementasi: [audit hardening](production-hardening-2026-11-22.md). Bukti visual perbaikan approval dari pemeriksaan sebelumnya: [panel persetujuan](../design/verification/approval-review-visible.jpg).

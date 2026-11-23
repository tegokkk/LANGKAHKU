# Audit dan perbaikan production — 22 November 2026

> Pemeriksaan ulang setelah perubahan kartu dan persetujuan tersedia di [status kesiapan terbaru](readiness-status-2026-11-22.md): 21 tes backend dan 16 tes frontend lulus; gerbang production masih 2/13. Angka di bawah merupakan bukti historis tahap hardening.

Status: **perbaikan rekayasa sudah diterapkan dan diuji lokal; rilis data siswa nyata tetap NO-GO sampai gerbang operasional dipenuhi**. Laporan ini memperbarui bukti pada `production-readiness-report.md`; hasil audit lama tidak otomatis dianggap sebagai pengujian build terbaru.

## Cakupan dan temuan

Aplikasi React/Vite + Express/PostgreSQL diperiksa dari navigasi publik, masuk/daftar/status, dashboard siswa, refleksi, katalog, matriks pilihan, rencana, jurnal, berbagi konsultasi, approval superadmin, layanan/kurasi BK, ekspor, retensi, sampai backup/restore. Sumber data lokal fiktif dipertahankan. Tidak ada akun/data production yang digunakan.

| Area | Temuan | Perbaikan / hasil |
| --- | --- | --- |
| Database | Idle error pool dapat keluar dari handler; query tidak dibatasi | Listener error dengan metadata aman, statement timeout 15 detik, query timeout 20 detik, idle transaction timeout 30 detik; rollback yang gagal membuang koneksi |
| Autentikasi | Rate limit hilang setelah restart dan berbeda antarproses | Store PostgreSQL atomik, bucket terpisah auth/hak data, alamat IP disimpan sebagai hash, pembersihan bucket kedaluwarsa oleh worker |
| Worker | Tidak ada heartbeat, penghentian dapat mendahului pekerjaan berjalan | Heartbeat sukses/gagal, probe kedaluwarsa 3 menit, tunggu siklus saat shutdown, deadline 25 detik, batch retensi/penghapusan terbatas |
| HTTP | Health tidak membedakan proses hidup dari siap melayani; tidak ada korelasi request | Probe live/ready, 503 saat drain/DB bermasalah, request ID, log route/status/durasi tanpa payload, timeout request/header |
| API client | JSON rusak dapat dianggap sukses; jaringan dapat menunggu lama | Respons wajib JSON objek, batas tunggu 20 detik, pesan hasil penyimpanan belum dapat dikonfirmasi, tidak mengulang mutasi otomatis |
| Data UI | Reload lama dapat menimpa data record baru; perubahan akun bisa meninggalkan komponen lama | Abort + nomor urut request, data disekat berdasarkan path, remount halaman saat identitas berubah, sinkronisasi perubahan login/logout antartab melalui BroadcastChannel tanpa data pribadi |
| Sesi UI | Sesi berakhir dapat tertahan di panel retry; kegagalan logout tidak terlihat | Hilangkan tampilan privat dan kembali ke login, ambil CSRF baru; tampilkan kegagalan logout dan blokir akses ketika akun dibatasi |
| Formulir | Login bergantung pada daftar sekolah; input masih bisa diubah selama save | Daftar sekolah hanya dimuat untuk registrasi; retry/keadaan kosong jelas; fieldset editor refleksi/rencana/perbandingan dinonaktifkan saat simpan; transfer tujuan memiliki status sibuk dan pesan galat yang tepat |
| Aksesibilitas | Latar panel masih dapat dijangkau teknologi bantu | Latar dibuat inert selama dialog, menu seluler tertutup inert, main dapat difokuskan skip-link, filter kategori memiliki aria-pressed; Escape dan pengembalian fokus diuji browser |
| Katalog | Permintaan pencarian pada tiap karakter; keadaan katalog kosong membingungkan | Debounce 250 ms, pembatalan permintaan lama, pesan materi sedang disiapkan dan tautan lembar kerja |
| Hosting SPA | Belum ada artefak deployment satu origin | Express dapat melayani STATIC_DIR, fallback deep link, aset hash immutable, HTML/worker revalidasi, API tidak berubah menjadi HTML, dot-path tidak dijadikan fallback SPA |
| Cetak | Selektor print mengasumsikan dokumen menjadi anak langsung main, sehingga wrapper transisi dapat menyembunyikan seluruh dokumen | Tampilkan rantai wrapper yang berisi dokumen cetak dan dokumennya; formulir dan panel privat tetap tersembunyi. Regresi CSS pada DOM bertingkat diuji; hasil printer/PDF fisik masih perlu diuji di staging |
| Backup/ledger | Durabilitas tulis belum dipaksakan, worker backup belum tersedia | Flush dan mode file privat, backup harian dengan retry 5 menit, probe freshness, heartbeat worker hasil restore dibersihkan |
| Operasi | Belum ada paket deployment atau gerbang CI | Docker multistage non-root, Compose DB/worker/backup/Caddy, role DB runtime terpisah, mount baca/tulis sesuai peran, CI lint/test/build/audit, CLI check:production |

## Bukti pengujian

- Baseline: backend **15/15** lulus. Frontend semula **7/8**; tes pending account melewati batas tunggu pemuatan lazy 1 detik ketika runner sibuk. Tes terisolasi lulus; setup kini memberi batas tunggu 5 detik dan mengabaikan canvas dekoratif yang tidak tersedia di jsdom.
- Setelah perbaikan: backend **21 pengujian** (15 alur fitur + 6 runtime), frontend **13 pengujian**. Lint keduanya menggunakan `--max-warnings=0`. Build produksi Vite dan generator service worker diperiksa ulang.
- Regresi tambahan mencakup timeout/rollback PostgreSQL nyata, config production yang tidak aman, DB outage, worker gagal/pulih/kedaluwarsa, drain, rate limit serentak dan antarinstance, preflight gagal tertutup, SPA/cache/JSON/413, respons JSON rusak, timeout mutasi, respons record lama, dan sesi frontend kedaluwarsa.
- Pengujian integrasi fitur mempertahankan coverage registrasi/approval/izin wali, isolasi peran dan sekolah, jurnal privat, konflik versi, idempotensi konsultasi, snapshot/pratinjau/cabut izin, agregat tersupresi, ekspor/hapus, retensi, seed demo, bootstrap, backup terenkripsi dan restore dengan ledger.
- Audit dependensi backend/frontend melaporkan **0 kerentanan** pada pemeriksaan ini. Ini bukan jaminan keamanan menyeluruh dan harus diulang oleh CI.
- Browser lokal memverifikasi landing, katalog 26 materi demo, detail panel, Escape/pengembalian fokus, form masuk/daftar, dan persetujuan kosong bawaan. Pemeriksaan DOM pada lebar CSS efektif 487, 709, dan 1800 px tidak menunjukkan overflow horizontal. Override viewport browser tidak selalu sesuai dimensi yang diminta dan satu screenshot gagal; pengujian 360/390 px serta pembaca layar/perangkat fisik tetap perlu di staging. Alur privat lengkap diuji integrasi dan tes komponen, bukan seluruhnya melalui browser pada sesi audit ini.
- Docker Engine tidak tersedia: image, Compose stack, penerbitan sertifikat TLS, supervisor container, dan workflow CI eksternal **belum dieksekusi**. Jangan menganggap konfigurasi yang ditulis sudah menjadi infrastruktur yang terpasang.

## Gerbang rilis tersisa

`npm run check:production` terhadap lingkungan lokal mengembalikan exit **1**, sesuai harapan. Bukti lokal hanya lolos migrasi dan ketersediaan akun sekolah; belum lolos mode production, HTTPS, retensi, heartbeat worker, role DB minimum, katalog empat kategori non-demo, kontak/jam layanan terverifikasi, jadwal retensi siswa, ledger persisten, STATIC_DIR, dan backup terkini.

Sebelum GO: uji stack di staging, konfigurasi domain dan secret, bootstrap tanpa demo, sahkan kebijakan sekolah/izin wali/retensi/prosedur pemulihan akun, validasi materi oleh ahli BK, uji 5–8 pengguna, verifikasi aksesibilitas perangkat nyata, jadwalkan salinan backup/ledger off-site dan latihan restore, tetapkan operator/alert/penanganan insiden. CLI hanya membuktikan kondisi otomatis, bukan pengesahan sekolah atau keabsahan materi.

Paket dan langkah pelaksanaan: `deploy/README.md`. Pemeriksaan produksi tersedia di `backend/scripts/check-production.js`. Migrasi tambahan: `003_runtime_health.sql` (sudah diterapkan pada database lokal pengembangan dan pengujian; tidak ada database production disentuh).

Rujukan teknis untuk keputusan pool/timeout dan shutdown: [node-postgres Pool](https://node-postgres.com/apis/pool), [node-postgres Client](https://node-postgres.com/apis/client), [Express health checks dan graceful shutdown](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown/), serta [kontrak custom store express-rate-limit](https://github.com/express-rate-limit/express-rate-limit/blob/main/docs/guides/creating-a-store.mdx).

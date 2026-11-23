# Bukti verifikasi implementasi lokal

Tanggal: 22 November 2026. Lingkungan: Windows, Node 24.21.0, PostgreSQL 15.19, browser Chromium/Chrome 158. Database development `langkahku` dan test `langkahku_test` terpisah pada cluster proyek 127.0.0.1:55432. Semua identitas, jawaban, dan izin dalam pengujian adalah fiktif. Instalasi PostgreSQL lain yang sudah berjalan tidak diubah.

## Hasil otomatis

| Pemeriksaan | Hasil |
|---|---|
| `backend: npm run lint` | Lulus tanpa galat |
| `backend: npm test` | **15 pengujian lulus**, mencakup banyak assertion integrasi PostgreSQL |
| `frontend: npm run lint` | Lulus tanpa galat/peringatan |
| `frontend: npm test` | **5 pengujian lulus** (dua perilaku privasi UI, dua kontrak cache, satu zona waktu sekolah) |
| `frontend: npm run build` | Lulus; manifest, PDF dan worker allowlist aset berhash di dist |
| Migrasi SQL 001/002 | Berhasil pada database lokal, test, dan database seed/restore terisolasi; aman dijalankan ulang |
| Health API, worker statis, PDF publik | HTTP 200; PDF `application/pdf` |
| Helper database lokal | Stop idempoten, start kembali dengan data yang sama, stop cluster proyek, dan lint lulus; layanan PostgreSQL lain tetap berjalan |
| Instalasi dependency dan audit npm | Lockfile terpisah; audit instalasi tidak menemukan kerentanan |

Tambahan verifikasi: CLI bootstrap pertama melalui stdin privat pada database kosong lulus; bootstrap kedua ditolak. Pengaturan zona waktu sekolah dipakai formatter UI dan diuji pada pergantian tanggal Jakarta/Makassar.

Backend menguji:

- Payload role/status/field administratif ditolak; role dan status dibuat server. Sesi diputar saat login, cookie HttpOnly/SameSite, CSRF/origin dan rate limit benar-benar ditegakkan.
- Tiga tujuan role, pending/rejected/suspended/wali pending, approve/reject, alasan keputusan, daftar antrean, suspend/aktifkan kembali dan pencabutan sesi.
- Dua keputusan berlawanan bersamaan menghasilkan tepat satu keberhasilan, satu konflik, satu review dan satu audit; retry tidak menimpa.
- Refleksi/rencana bertahan setelah muat ulang; konflik versi; matriks menolak nilai di luar 1–5; jurnal lintas pemilik/BK/superadmin ditolak.
- Konsultasi tanpa lampiran atau rencana saja; idempotensi; guru lain dalam sekolah maupun lintas sekolah ditolak; jurnal ditolak sebagai lampiran; perubahan sumber tidak diam-diam mengubah snapshot; versi berubah sejak preview ditolak.
- Transisi jadwal/status, pencabutan, izin baru, kedaluwarsa; respons tidak menyertakan isi snapshot yang dicabut/berakhir.
- Ekspor bagian pilihan dan jurnal opt-in dengan autentikasi ulang; hapus fitur mencabut isi snapshot; hapus akun segera mencabut sesi dan menghapus seluruh entitas melalui job.
- Retensi angkatan dan pendaftaran; kegagalan ledger disimulasikan, job failed/retry terbukti pulih. UI status job tetap tersedia tanpa profil siswa yang telah dihapus.
- Agregat kecil menyembunyikan seluruh partisi/total; kelompok aman memakai lima sel masing-masing >=6; filter individu ditolak; tidak ada identitas/isi jawaban dalam respons.
- Draf/arsip tidak publik; sumber berbahaya ditolak; metadata penerbitan wajib; versi dan batas sekolah kurasi.
- Backup AES-256-GCM tanpa dump plaintext, key salah ditolak, restore hanya database kosong terisolasi, sesi dibersihkan, tombstone diterapkan sebelum sukses. Database uji restore yang dibuat test dihapus setelah digunakan.
- Seed lengkap (33 siswa fiktif dengan status berbeda, dua staf, enam jalur, 18 profesi, cerita/lembar kerja, rencana, konsultasi tanpa lampiran), idempoten, dan ditolak di produksi. Uji seed tidak menimpa kredensial development.

## Alur browser → API → PostgreSQL → UI

Pendaftaran fiktif dibuat dari form React dan tampil pending. Superadmin masuk melalui form yang sama, melihat antrean, menyetujui, melihat riwayat serta wali masih pending, lalu memverifikasi wali lewat operasi berbeda. Siswa masuk kembali dan memperoleh beranda aktif. Rejection dan batas akses diverifikasi pada integrasi API/database.

Siswa mengisi refleksi, melewati dukungan, mengonfirmasi ringkasan tepat jawabannya. Reload mempertahankan jawaban/tahap. Katalog dicari, materi ditambahkan ke opsi dan ditandai sudah dipelajari; matriks ditinjau, tujuan dipilih siswa, tiga langkah dibuat dan satu ditandai selesai; reload mempertahankan semuanya. Jurnal disimpan dari panel privat. Konsultasi rencana saja dipratinjau dan dikirim; BK menerima tepat ringkasan tersebut dan mengonfirmasi jadwal. Siswa mencabut akses; BK memuat ulang dan hanya melihat status dicabut, tanpa isi.

Keyboard: panel tunggal, Shift+Tab dari tombol tutup kembali ke kontrol terakhir, Escape menutup, fokus kembali ke tombol Jurnal privat. Penamaan field dipisahkan dari helper text. Tidak ada modal bertumpuk.

## Desktop dan responsif

`design/verification/layout-checks.json` memuat **50 hasil**: sepuluh rute (sembilan template, T01 varian BK/superadmin), masing-masing pada **1280, 1440, 1920, 390, 360 CSS px**. Lebar aktual dicatat; seluruh hasil akhir `scrollWidth <= width`. Tabel antrean direflow menjadi baris bertumpuk di mobile. Screenshot `s01`–`s06`/`t01`–`t03` tersedia di folder yang sama dan ditinjau visual. Fokus utama desktop; adaptasi tetap memakai template yang sama.

## Luring dan cetak

Pada build produksi lokal, worker aktif. Jaringan dimatikan melalui alat developer browser lalu halaman dimuat ulang: satu materi publik yang sengaja diunduh tampil, sedangkan sesi/data privat tidak tersedia. Jaringan dipulihkan sesudah uji. `cache-audit.json` mencatat **privateCached=false**, localStorage kosong, hanya shell publik dan `/offline-content/kuliah-seleksi-nasional`. Kontrak otomatis juga memastikan auth, jurnal, ekspor, konsultasi, admin API, non-GET dan aset arbitrer tidak diintersep worker.

PDF lembar kerja kosong: **7 halaman A4**, seluruh halaman dirender Poppler dan diperiksa, tanpa halaman sisa atau tabel terpotong. File publik di `frontend/public/worksheets/lembar-kerja-langkahku.pdf`; salinan hasil di `output/pdf/lembar-kerja-langkahku.pdf`. Cetak rencana fiktif: satu halaman A4, tiga langkah semester terpilih, tanpa navigasi/hero dan tanpa isi jurnal; diperiksa visual dan ekstraksi teks. File rencana adalah bukti uji fiktif, bukan keluaran data pengguna nyata.

## Temuan dan perbaikan

1. Kesalahan kurung JSX pada form awal → diperbaiki; lint/build lulus.
2. Helper bercampur dengan nama aksesibel input → aria-labelledby/describedby terpisah; uji UI lulus.
3. Opsi katalog pertama belum dapat menjadi draf matriks karena judul opsi kedua kosong → schema draf diperbaiki, nama wajib ketika matriks dikonfirmasi; aksi katalog diuji browser.
4. Preview bisa berbeda versi ketika tab lain mengubah ringkasan → server memeriksa versi dan mengunci dokumen saat snapshot; konflik diuji.
5. Banner kosong akibat children array → filter node kosong; render ulang bersih.
6. Overflow tabel BK pada mobile → td berlabel dan baris bertumpuk; ukuran bermasalah diuji ulang dan lulus.
7. Dua halaman sisa pada PDF awal → jarak/tinggi cetak diperbaiki; hasil tujuh halaman dirender ulang seluruhnya.

## Batas dan pekerjaan terbuka

- **A07, bagian C09/I05/J09/M06:** prosedur sekolah, pemulihan bila kode hilang, izin wali nyata, retensi konsultasi/angkatan yang disahkan, penanggung jawab serta kontak aktual belum tersedia. Implementasi dan simulasi tidak menggantikan validasi kebijakan. Retensi berbasis usia/angkatan masih default nonaktif.
- **E05/E06, L02–L03/L05/L07:** cerita alumni nyata berizin, tinjauan ahli BK/media dan peserta sukarela belum tersedia. Konten demo diberi label dan disembunyikan dalam mode non-demo; tidak ada klaim hasil usability/efektivitas.
- **J08/J10:** belum ada audit pembaca layar lengkap, zoom 200% pada seluruh alur, instalasi pada perangkat Android/iOS nyata, profil jaringan/perangkat dan uji beban pilot 30 sesi. Pemeriksaan keyboard, label, ukuran browser, build, cache dan PDF sudah dilakukan; tidak dianggap sertifikasi WCAG atau benchmark lapangan.
- **M01/M02/M04/M05/M07:** belum ada hosting, staging, HTTPS/domain, secret manager, penyimpanan/replica backup+ledger eksternal, supervisor/scheduler produksi, monitoring/alert atau operator insiden. Script backup/restore dan worker telah diuji lokal; RPO/RTO produksi belum dibuktikan.

Server preview/API/worker lokal yang dipakai pengujian dihentikan setelah verifikasi; data development dan referensi tetap tersedia. Jalankan kembali melalui README. Tidak ada publikasi eksternal atau pesan kepada pihak lain.

# Audit kebutuhan dan sembilan template

Audit 22 November 2026. Tidak ada AGENTS.md pada workspace maupun direktori induk yang diperiksa. Workspace awal hanya berisi dokumen, proposal, dan ekspor desain; tidak ada aplikasi atau Git checkout. Dokumen merupakan bahan produk; kalimat lama yang membatasi pekerjaan menjadi penulisan PRD tidak mengubah permintaan implementasi terbaru.

| Template | Rute React | Penyesuaian dari ekspor |
|---|---|---|
| S01 Mulai & akses | `/`, `/masuk`, `/daftar`, `/status`, `/pemulihan` | Satu login role server. Tanpa NISN/email, klaim jangkauan nasional, foto/testimoni tanpa izin, atau janji bantuan 24 jam. Approval dan wali terpisah. |
| S02 Beranda | `/beranda` | Nama, empat status, aktivitas, serta langkah terdekat dari API; tidak ada cuplikan jurnal atau klaim data disimpan lokal. |
| S03 Kenali Diriku | `/kenali-diriku` | Wizard enam tahap; ringkasan hanya jawaban siswa. Label “tipe penyelaras/analis” dan grafik inferensi dihapus. Simpan daring dengan konflik versi. |
| S04 Peta Jalur | `/peta-jalur` | Katalog publik, panel detail, sumber/tinjau, opsi dan unduhan eksplisit. Angka biaya/jadwal/kuota contoh dihapus. |
| S05 Rencana | `/rencana`, `/timbang-pilihan` | Dua tab, tanpa total matriks/pemenang. Tujuan dipilih siswa. Langkah per semester, panel editor, cetak dan jurnal privat. |
| S06 Sapa BK | `/sapa-bk` | Checkbox semua kosong. Pratinjau sebelum pengiriman, boleh tanpa lampiran, izin 30 hari sejak pengiriman (kebijakan pengembangan), cabut/ganti izin. |
| T01 Antrean staf | `/bk/permintaan`, `/superadmin/pendaftaran` | Role dipisahkan; hilangkan tab untuk pindah menjadi admin di akun BK. Tidak ada ekspor massal atau data konseling pada superadmin. |
| T02 Agregat | `/bk/agregat` | Partisi tahap dan total seluruhnya disembunyikan jika satu sel <5 atau kelompok <10. Tanpa filter individu, simpulan kesiapan, dan drill-down. |
| T03 Konten & layanan | `/bk/kelola` | Editor inline, sumber HTTPS, versi, draft/review/published/archived, layanan dari konfigurasi. Hilangkan tombol sinkronisasi palsu dan kontak rekaan. |

Semua sembilan `screen.png` ditinjau dan `code.html` diperiksa. JavaScript ekspor, CDN Tailwind, inline handler, tautan `#`, toast contoh, dan data statis tidak dipakai sebagai aplikasi. React memakai komposisi editorial, panel kanan, hero maroon, kartu pastel, navigasi header siswa, dan sidebar staf dari referensi tersebut. Template sumber tetap utuh.

Token final: maroon #6E2035; hover #57172A; ivory #F7F3ED; teks #241A20/#6D6268; blush #F6E6EA; sage #E7EEE7; lavender #EEE9F6; peach #F9E7DB. Varian otomatis Stitch #510820/#FDF9F3 tidak menjadi token utama. Font Plus Jakarta Sans lokal, kartu 20px, tombol 48px, input 12px; CSS `readability.css` memastikan isi tugas terbaca. Desktop 1440 CSS px menjadi acuan, responsif memakai template sama.

## Keputusan teknis dan penghambat operasional

- Sekolah dipilih dari daftar yang dibuka server (`schoolCode` UUID publik), bukan menerima `school_id` administratif sembarang.
- Siswa di bawah 18 membutuhkan wali verified. Kategori dewasa not_required tidak melewati approval akun.
- SQL migration terlacak dan dikunci advisory dalam transaksi memakai `pg`; tidak mengandalkan auto-create tabel ketika request.
- Refleksi/matriks/rencana menggunakan dokumen JSONB dengan schema Zod terpisah dan versi; jurnal dan snapshot terpisah secara relasional.
- Kumpulan konten demo berisi 6 jalur, 18 profesi (3 per kelompok RIASEC), cerita fiktif, serta lembar diskusi. Referensi resmi ditautkan; tinjauan ahli Indonesia dan izin cerita nyata belum tersedia. Mode non-demo menyembunyikan konten demo.
- Penanggung jawab sekolah/data, jam/kontak aktual, izin wali nyata, tanggal retensi, pembagian petugas dan sekolah target belum diberikan. Tabel angkatan dan UI administrasi telah disediakan, tetapi kebijakan berbasis usia/kelulusan dinonaktifkan sampai `RETENTION_ENABLED=true` ditetapkan operator setelah validasi.
- Hosting, lokasi data, kunci/penyimpanan backup produksi, monitoring eksternal, serta peserta/ahli uji belum tersedia. Tidak ada deployment atau klaim siap data siswa nyata.

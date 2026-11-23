# LANGKAHKU - Task List Pembangunan Website

| Atribut | Keterangan |
|---|---|
| Tanggal | 22 November 2026 |
| Acuan | `PRD.md`, `design.md`, `structure.md`, dan arahan terbaru pengguna |
| Fokus UI | **Desktop terlebih dahulu**, acuan 1440 x 1024 px, tetap nyaman pada 1280-1920 px |
| Folder aplikasi | `backend/` dan `frontend/` |
| Stack | JavaScript, React + Vite + Tailwind CSS, Node.js + Express, PostgreSQL |
| Role | `superadmin`, `bk`, `siswa` |
| Prioritas alur | Siswa daftar -> menunggu -> superadmin menyetujui/menolak -> akses sesuai status dan persetujuan |
| Status awal | Dokumen dan ekspor desain tersedia; implementasi aplikasi belum diverifikasi/ditandai selesai |

## 1. Cara menggunakan checklist

- `[ ]` berarti belum selesai atau belum diverifikasi; `[x]` berarti hasil yang disebut sudah tersedia dan diperiksa keberadaannya.
- Centang pekerjaan implementasi setelah perilakunya berjalan dan pemeriksaan yang relevan lulus. Tampilan statis/toast contoh belum berarti fitur selesai.
- Untuk setiap pekerjaan, catat bukti singkat: berkas terkait, hasil pemeriksaan, atau temuan yang diselesaikan. Jangan memasukkan data siswa asli ke bukti.
- Urutan acuan bila berbeda: **arahan terbaru pengguna -> `structure.md` untuk akun/stack -> `design.md` untuk visual -> PRD untuk fitur dan kriteria penerimaan**.
- Pertahankan sembilan template visual. Template antrean staf dipakai ulang dengan isi dan hak akses berbeda untuk BK dan superadmin; detail/jurnal/pengaturan berupa panel atau state.
- Prioritas menunjukkan urutan pembangunan. Semua fitur V1 yang tercantum tetap menjadi target penyelesaian.

### Bahan yang sudah tersedia

- [x] **DOC-01** Proposal PDF tersedia di direktori proyek.
- [x] **DOC-02** Dokumen `PRD.md`, `design.md`, dan `structure.md` tersedia.
- [x] **DOC-03** Sembilan pasangan `code.html`/`screen.png` desain desktop tersedia dalam `stitch_langkahku_student_career_portal/`.
- [x] **DOC-04** Berkas panduan visual ekspor Stitch tersedia dalam `warm_editorial_career_navigator/DESIGN.md`.

Keberadaan ekspor tidak menyatakan seluruh visual, interaksi, atau aturan datanya sudah sesuai kebutuhan.

## 2. Tahapan dan ketergantungan

| Tahap | Hasil utama | Ketergantungan |
|---|---|---|
| A | Dokumen dan hasil Stitch selaras dengan kebutuhan terbaru | Bahan awal |
| B | Fondasi frontend/backend dan database dapat berjalan | A untuk keputusan struktur |
| C | Login tiga role dan sesi terbatas/aktif | B |
| D | Persetujuan siswa oleh superadmin berjalan end-to-end | C |
| E | Katalog publik dan fondasi konten | B; kurasi privat memerlukan C |
| F | Fitur siswa lengkap | C, D; eksplorasi memakai E |
| G | Konsultasi dan berbagi aman | C, D, F |
| H | Area BK, agregat, dan kurasi | E, F, G |
| I | Hak data, retensi, dan pemulihan | Modul data terkait |
| J | PWA, cetak, responsivitas, dan aksesibilitas | Halaman/modul terkait |
| K | Verifikasi integrasi dan perbaikan | C-J terintegrasi |
| L | Validasi ahli dan uji pengguna terbatas | Gerbang teknis K lulus |
| M | Rilis terkontrol dan serah terima | Temuan K/L diselesaikan; operasi siap |

Pemeriksaan akses, privasi, dan kualitas dilakukan pada setiap tahap. Tahap K memverifikasi keseluruhan integrasi, bukan awal penerapan keamanan.

## 3. Tahap A - Sinkronisasi kebutuhan dan audit desain

- [x] **A01** Selaraskan bagian autentikasi lama di PRD: pendaftaran siswa mandiri, tiga role, approval superadmin, dan persetujuan wali sebagai proses terpisah.
- [x] **A02** Selaraskan `design.md` dan prompt terkait agar **desktop menjadi prioritas pertama**, mengikuti arahan terbaru; adaptasi mobile tetap masuk pemeriksaan akhir.
- [x] **A03** Tetapkan peta sembilan template S01-S06/T01-T03 ke rute React; T01 mempunyai varian BK dan superadmin tanpa memperluas kewenangan keduanya.
- [x] **A04** Tinjau sembilan `screen.png` terhadap layout, alur, copy, dan kebutuhan panel/state yang belum tergambar. Catat perbedaan yang harus diperbaiki saat konversi.
- [x] **A05** Normalisasi token hasil Stitch ke `design.md`: maroon `#6E2035`, ivory `#F7F3ED`, pastel, font, radius, jarak, dan kontras. Periksa variasi warna otomatis hasil ekspor.
- [x] **A06** Audit HTML/JavaScript contoh: tandai tombol dummy, toast, link mati, data hardcoded, penggunaan email siswa, dan perilaku yang tidak didukung PRD.
- [ ] **A07** Tetapkan prosedur sekolah untuk izin wali, tanggal kelulusan/retensi, jam BK, kontak bantuan, serta pembagian petugas. Prototipe data fiktif dapat berjalan sebelum keputusan operasional lengkap.

**Selesai bila:** daftar perbedaan jelas, aturan akun tidak ambigu, dan acuan desktop disepakati dalam dokumen kerja. Tidak perlu menghasilkan ulang seluruh desain yang sudah layak.

## 4. Tahap B - Setup proyek, fondasi UI, dan database

### Backend dan frontend

- [x] **B01** Buat folder aplikasi `backend/` dan `frontend/` sesuai `structure.md`, dengan JavaScript ES Modules dan komponen `.jsx`.
- [x] **B02** Setup React + Vite, Tailwind melalui build lokal, React Router, ikon, serta script `dev`, `build`, `lint`, dan `test` yang diperlukan.
- [x] **B03** Setup Express dengan pemisahan `app.js`/`server.js`, konfigurasi environment tervalidasi, health check, respons error konsisten, dan log dengan redaksi data sensitif.
- [x] **B04** Siapkan `.env.example`, `.gitignore`, lockfile per aplikasi, format kode, serta petunjuk menjalankan dua aplikasi. Secret nyata tidak masuk repositori atau variabel frontend.
- [x] **B05** Setup proxy Vite `/api`, prefix backend `/api/v1`, wrapper Fetch, dan penanganan error/sesi berakhir yang konsisten.
- [x] **B06** Implementasikan token visual dan komponen bersama: tombol, input, chip, badge, kartu, tabel, panel, dialog, banner, serta status simpan.
- [x] **B07** Bangun layout publik, siswa, dan staf untuk desktop; navigasi serta menu mengikuti role. Satu overlay maksimum dan fokus keyboard kembali ke pemicunya.
- [x] **B08** Konversi bagian reusable dari HTML Stitch menjadi komponen React. Ganti handler inline, script/CDN Tailwind, dan ikon yang tidak sesuai dengan integrasi proyek; jangan menjalankan HTML ekspor sebagai aplikasi akhir.

### Database

- [x] **B09** Siapkan PostgreSQL pengembangan dan pengujian terpisah, connection pool `pg`, migrasi, serta query berparameter.
- [x] **B10** Buat migrasi identitas: sekolah/angkatan, users, student_profiles, registration_reviews, consents, sessions, dan audit_logs.
- [x] **B11** Buat migrasi modul produk: konten/sumber, refleksi, perbandingan/opsi, rencana/langkah, jurnal, konsultasi/snapshot, progress_states, settings, serta deletion_jobs.
- [x] **B12** Terapkan foreign key, username unik dengan aturan normalisasi, enum/check constraint role/status, kepemilikan, indeks pencarian yang dibutuhkan, dan versi record untuk konflik edit.
- [x] **B13** Buat data demo untuk tiga role, status pendaftaran, konten, rencana, konsultasi, dan agregat aman/kelompok kecil. Seed demo ditolak di produksi.

**Selesai bila:** frontend/backend berjalan lokal, migrasi dapat membentuk database bersih, layout dasar konsisten, dan lingkungan pengujian tidak memakai data nyata.

## 5. Tahap C - Registrasi, login, sesi, dan tiga role

- [x] **C01** Implementasikan register siswa dengan username, kata sandi, nama panggilan, kelas/semester, sekolah tersedia, kategori usia, dan persetujuan siswa. Validasi minimum tanpa menambah email/telepon/NISN.
- [x] **C02** Tetapkan `role=siswa` dan `status=pending_approval` di server; tolak input role/status/field administratif yang tidak boleh dikendalikan pendaftar.
- [x] **C03** Implementasikan hash password Argon2id, session store PostgreSQL, rotasi ID sesi saat login, cookie aman, CSRF, dan rate limit endpoint sensitif.
- [x] **C04** Implementasikan login satu form untuk `superadmin`, `bk`, `siswa`; tujuan dan scope sesi berasal dari data server.
- [x] **C05** Implementasikan sesi terbatas untuk status pendaftaran, logout, dan pembatalan sendiri. Pending/rejected tidak mendapat akses fitur siswa.
- [x] **C06** Implementasikan guard akun aktif pada semua API privat: status approved, persetujuan siswa valid, dan wali verified/not_required bila berlaku. Periksa status terbaru setiap request.
- [x] **C07** Bangun S01 dalam mode pembuka, daftar, login, status pending/rejected, serta menunggu wali. Pengguna tetap dapat membuka katalog publik.
- [x] **C08** Implementasikan `/auth/me`, AuthContext, route guard, logout, dan pencabutan sesi; tidak menyimpan kredensial, token sesi, atau isi pribadi di localStorage.
- [ ] **C09** Implementasikan kode pemulihan sekali pakai yang disimpan sebagai hash, reset kata sandi, serta pencabutan sesi lama. Jika kode hilang, proses verifikasi langsung oleh sekolah tidak membuka isi siswa.
- [x] **C10** Buat CLI bootstrap superadmin pertama dengan kredensial aman, tanpa password default atau endpoint registrasi publik BK/superadmin.

**Selesai bila:** tiga role masuk ke area yang tepat, sesi terbatas benar-benar dibatasi server, dan perubahan role/status di browser tidak membuka akses tambahan.

## 6. Tahap D - Fitur utama superadmin

- [x] **D01** Implementasikan API daftar/detail pendaftaran dengan filter status, pencarian, pagination, dan data administratif minimum.
- [x] **D02** Bangun varian superadmin T01: antrean siswa, detail, status, tanggal pengajuan, tombol Setujui/Tolak, dan riwayat keputusan.
- [x] **D03** Implementasikan persetujuan akun pending dengan transaksi perubahan status dan audit, hanya oleh superadmin.
- [x] **D04** Implementasikan penolakan dengan alasan operasional yang sopan; alasan tersedia pada status siswa, tanpa mengirim email yang tidak menjadi bagian stack/alur akun.
- [x] **D05** Tangani klik ganda, retry, dan keputusan approve/reject bersamaan. Keputusan tidak boleh tertimpa diam-diam atau menghasilkan audit bertentangan.
- [x] **D06** Implementasikan verifikasi izin wali sebagai operasi terpisah beserta petugas, waktu, dan referensi minimum. Approval akun tidak otomatis mengubah status wali menjadi verified.
- [x] **D07** Implementasikan pembuatan akun BK oleh superadmin, penetapan sekolah, dan pengelolaan status akun melalui tab/panel administratif.
- [x] **D08** Implementasikan approved <-> suspended hanya untuk akun yang sebelumnya disetujui; tidak melewati antrean approval. Cabut sesi dan lindungi superadmin aktif terakhir.
- [x] **D09** Integrasikan alur penuh: siswa daftar -> superadmin meninjau -> keputusan tersimpan -> status siswa diperbarui -> akses aktif hanya bila semua gerbang terpenuhi.

**Selesai bila:** keputusan tampil dari database pada kedua pihak, BK/siswa ditolak pada API approval, dan superadmin tidak memperoleh akses otomatis ke jurnal/refleksi pribadi.

## 7. Tahap E - Katalog publik dan konten awal

- [x] **E01** Implementasikan API konten terbit, detail, pencarian, kategori, dan metadata sumber/tinjau; draf/arsip tidak bocor melalui endpoint publik.
- [x] **E02** Konversi S04 menjadi katalog React dengan empat kategori, hasil kosong, detail jalur/profesi, cerita, dan unduhan melalui panel bersama.
- [x] **E03** Susun enam kartu induk jalur sesuai PRD, termasuk subjalur SNBP/SNBT/mandiri/PTKIN, kerja/pelatihan, kuliah sambil kerja, usaha, dan dukungan biaya lintas kartu.
- [x] **E04** Susun 18 kartu profesi, tiga per kelompok RIASEC, dengan keragaman jalur dan tanpa label kecocokan pasti.
- [ ] **E05** Siapkan minimal satu Cerita Langkah berizin dan lembar Ngobrol dengan Orang Tua; materi simulasi diberi label sebagai contoh.
- [ ] **E06** Lengkapi sumber resmi, periode berlaku, peninjau, tanggal tinjau, versi, serta status kedaluwarsa. Informasi yang belum diperiksa tetap draf.
- [x] **E07** Implementasikan Tambahkan ke pilihan dan Sudah kupelajari untuk siswa aktif; tamu tetap dapat membaca dan mendapat penjelasan bila meminta aksi personal.

**Selesai bila:** katalog dapat dipakai tanpa login, seluruh target konten tersedia untuk peninjauan, dan tidak ada syarat/jadwal/biaya contoh yang disajikan sebagai fakta terverifikasi.

## 8. Tahap F - Fitur siswa

### Refleksi dan beranda

- [x] **F01** Implementasikan API refleksi enam langkah, simpan draf, muat ulang, opsi lewati, serta pemeriksaan versi saat update.
- [x] **F02** Konversi S03 menjadi wizard dan ringkasan dalam satu template; gunakan copy refleksi nonformal tanpa skor/tipe psikologis pasti.
- [x] **F03** Bangun ringkasan dari jawaban nyata yang dapat diedit, tanpa menambahkan inferensi otomatis; konfirmasi ringkasan memperbarui progress_states.
- [x] **F04** Integrasikan S02 dengan nama panggilan, empat status langkah, aktivitas terakhir, rencana terdekat, dan akses BK/jurnal. Hilangkan statistik dan progress hardcoded dari ekspor.

### Timbang Pilihan

- [x] **F05** Implementasikan penyimpanan matriks 2-3 opsi dari katalog/isian sendiri, lima kriteria, alasan, serta nilai 1-5 atau belum diketahui.
- [x] **F06** Bangun tab Timbang Pilihan pada S05, lengkap dengan draf, edit, status simpan, dan petunjuk biaya. Tidak ada penjumlahan skor sebagai rekomendasi/pemenang.
- [x] **F07** Hubungkan pilihan yang secara eksplisit dipilih siswa ke draf rencana; perubahan matriks tidak mengganti tujuan secara otomatis.

### Rencana

- [x] **F08** Implementasikan tujuan utama/cadangan dan langkah per semester XI-1 hingga XII-2, dengan catatan/tenggat opsional, urutan, status, edit, dan hapus.
- [x] **F09** Konversi tab Rencana S05 beserta panel tambah/edit langkah, kemajuan berbasis checklist, semester aktif, dan state kosong. Draf kurang dari tiga langkah tetap bisa disimpan.
- [x] **F10** Pastikan data dan status checklist tetap benar setelah reload/login ulang; deteksi konflik saat dua tab mengedit versi yang sama.

### Jurnal dan pengaturan

- [x] **F11** Implementasikan API jurnal privat pemilik saja, daftar berdasarkan tanggal, draf, edit, dan hapus; tanpa endpoint baca untuk BK/superadmin.
- [x] **F12** Bangun panel jurnal dari Beranda/Rencana dengan 2-3 pertanyaan, label privat, status simpan, dan tanpa cuplikan isi pada beranda.
- [x] **F13** Bangun panel pengaturan siswa: profil minimum, sesi/keamanan, ringkasan yang dibagikan, retensi, serta pintu masuk ekspor/hapus. Operasi ekspor/hapus diselesaikan pada tahap I.

**Selesai bila:** siswa dapat merefleksi, mengeksplorasi, membandingkan, dan menyimpan rencana minimal tiga langkah; jurnal tetap hanya milik pemilik dan seluruh data dimuat dari API.

## 9. Tahap G - Konsultasi dan izin berbagi

- [x] **G01** Implementasikan pengajuan konsultasi: topik, ketersediaan, catatan opsional, penerima yang berwenang dalam sekolah, dan nomor permintaan.
- [x] **G02** Buat snapshot transaksional hanya untuk ringkasan refleksi/perbandingan/rencana yang dipilih. Server menolak jurnal dan field yang tidak diizinkan.
- [x] **G03** Bangun S06 dengan form, checkbox berbagi kosong secara bawaan, pratinjau tepat data/penerima/masa akses, dan jalur kirim tanpa lampiran.
- [x] **G04** Implementasikan kunci idempotensi dan state pengiriman agar retry/klik ganda tidak membuat konsultasi ganda. Saat luring tidak ada kirim otomatis tersembunyi.
- [x] **G05** Implementasikan status dan transisi yang sah: diajukan, dijadwalkan, perlu penjadwalan ulang, selesai, dibatalkan/ditutup sesuai pelaku dan kondisi.
- [x] **G06** Implementasikan pencabutan akses per bagian/seluruh ringkasan, pembaruan dengan persetujuan baru, dan kedaluwarsa. Perubahan data asli tidak diam-diam mengubah snapshot terbagikan.
- [x] **G07** Tampilkan jam layanan/estimasi respons dari konfigurasi; waktu usulan dibedakan dari jadwal terkonfirmasi. Tidak ada chat langsung atau klaim respons 24 jam.
- [x] **G08** Periksa akses snapshot pada setiap baca, termasuk ketika guru sudah membuka permintaan. Salinan lama yang dicabut/berakhir tidak kembali melalui cache atau URL lama.

**Selesai bila:** siswa dapat mengirim rencana saja atau tanpa lampiran, guru melihat tepat bagian berizin, dan pencabutan memblokir pembacaan berikutnya.

## 10. Tahap H - Fitur BK, agregat, dan kurasi

- [x] **H01** Implementasikan daftar/detail konsultasi untuk BK yang ditugaskan, dengan filter/pagination dan batas sekolah. BK lain tidak dapat mengambil data di luar kewenangannya.
- [x] **H02** Konversi varian BK T01, termasuk konfirmasi/usulan jadwal, tandai selesai, penutupan operasional, serta state tanpa lampiran/dicabut/berakhir.
- [x] **H03** Implementasikan pengaturan jam layanan, zona sekolah, estimasi respons, dan kontak bantuan dengan penanggung jawab serta tanggal verifikasi.
- [x] **H04** Implementasikan agregat dari metadata tahap dan topik, tanpa membaca isi jurnal/refleksi. Definisi tahap, periode, dan satuan hitung terlihat jelas.
- [x] **H05** Terapkan kelompok minimal 10, sel minimal 5, serta perlindungan sel/total pelengkap; tidak ada drill-down individu atau filter kombinasi bebas.
- [x] **H06** Konversi T02 dengan dataset demo aman dan state kelompok kecil. Nilai tersembunyi tidak keluar lewat respons API, tooltip, atau ekspor.
- [x] **H07** Implementasikan kurasi konten dengan status draf/siap ditinjau/terbit/arsip, metadata wajib, versi, sumber aman, sanitasi, dan riwayat perubahan.
- [x] **H08** Konversi T03 menjadi tab Konten/Layanan dengan editor inline serta preview tanpa modal bertumpuk. Pisahkan pengaturan layanan BK dari administrasi approval superadmin.
- [x] **H09** Hubungkan pembaruan konten dengan katalog; kartu yang diarsipkan tidak merusak label opsi dalam rencana lama. Tandai paket luring yang perlu diperbarui.

**Selesai bila:** guru dapat menindaklanjuti konsultasi, memperbarui konten/layanan, dan melihat gambaran kelompok dengan batas privasi yang benar.

## 11. Tahap I - Ekspor, penghapusan, retensi, dan backup

- [x] **I01** Implementasikan ekspor milik siswa dalam format terstruktur dengan autentikasi ulang. Pilihan jurnal terpisah dan tidak dicentang bawaan.
- [x] **I02** Sediakan unduhan terautentikasi atau berumur pendek terikat pemilik; file pribadi tidak masuk URL publik, cache, atau penyimpanan permanen tanpa kebutuhan.
- [x] **I03** Implementasikan hapus data per fitur beserta pencabutan/penghapusan snapshot terkait; tidak mempertahankan salinan isi yang sudah dihapus lewat konsultasi.
- [x] **I04** Implementasikan hapus akun: akses/sesi/snapshot diblokir segera, pekerjaan penghapusan seluruh data pribadi aktif selesai <= 24 jam, dan kegagalan diulang/dilaporkan.
- [ ] **I05** Implementasikan pembatalan pendaftaran pending/rejected dan retensinya, serta retensi angkatan/kelulusan, data konsultasi, dan masa akses ringkasan sesuai kebijakan tervalidasi.
- [x] **I06** Pastikan penghapusan mencakup profil, kredensial, persetujuan terhubung, refleksi, matriks, rencana, jurnal, konsultasi/snapshot, progress, dan data analitik terkait.
- [x] **I07** Bangun audit minimum tanpa isi sensitif, dashboard/log kegagalan job, dan scheduler yang aman saat dijalankan ulang.
- [x] **I08** Siapkan backup terenkripsi, batas retensi backup, serta prosedur restore yang menerapkan ulang penghapusan sebelum sistem melayani pengguna. Uji pemulihan pada lingkungan terpisah.

**Selesai bila:** hak data bukan hanya tombol UI, penghapusan dapat dibuktikan, dan backup tidak menghidupkan kembali akun/data yang sudah dihapus.

## 12. Tahap J - PWA, cetak, desktop, dan aksesibilitas

- [x] **J01** Buat manifest, ikon, dan service worker dengan allowlist shell/konten publik. Jangan cache autentikasi, respons privat, token, atau isi siswa.
- [x] **J02** Implementasikan unduhan publik atas tindakan pengguna, daftar versi, pembaruan, penghapusan unduhan, serta banner luring yang sesuai kemampuan sebenarnya.
- [x] **J03** Sediakan lembar kerja PDF/cetak kosong: refleksi enam langkah, panduan jalur, matriks, rencana semester, dan diskusi orang tua.
- [x] **J04** Implementasikan cetak ringkasan rencana terpilih dengan CSS A4, tanpa sidebar/hero dan tanpa jurnal otomatis. Periksa hasil cetak tidak terpotong.
- [x] **J05** Cocokkan sembilan template desktop terhadap hasil Stitch yang sudah dikoreksi: grid, tabel, panel, whitespace, font, token, dan keadaan interaksi.
- [x] **J06** Verifikasi desktop 1280, 1440, dan 1920 px, termasuk scroll vertikal dan panel detail; tidak ada isi/tindakan yang terpotong.
- [x] **J07** Adaptasikan template yang sama ke tablet dan mobile 390/360 px untuk memenuhi akses PWA; matriks/tabel direflow dan tombol tidak tertutup navigasi/keyboard.
- [ ] **J08** Verifikasi label field, error inline, kontras, keyboard, focus trap/return, target sentuh, pembaca layar, zoom teks 200%, dan reduced motion.
- [ ] **J09** Sediakan bantuan/privasi di semua templat, dengan kontak terverifikasi dan batas jam layanan; tidak ada nomor/layanan contoh yang dianggap nyata.
- [ ] **J10** Ukur kinerja pada perangkat/jaringan uji yang dicatat; optimalkan aset, font, dan pemuatan fitur untuk target PRD tanpa cache data privat.

**Selesai bila:** desktop menjadi hasil utama yang rapi, alternatif akses tetap berfungsi, dan instalasi/luring tidak menjanjikan kemampuan yang belum dibangun.

## 13. Tahap K - Pengujian integrasi dan perbaikan

### Skenario yang wajib dibuktikan

- [x] **K01** Register mencoba menyisipkan role/status admin -> ditolak; akun normal selalu siswa pending.
- [x] **K02** Login tiga role -> area benar; pending/rejected/suspended atau wali belum valid -> API fitur pribadi ditolak.
- [x] **K03** BK/siswa memanggil approval -> ditolak; dua keputusan bersamaan/retry -> status dan audit konsisten.
- [x] **K04** Setujui, tolak, suspend, pulihkan, logout -> status/sesi berubah sesuai aturan tanpa melewati persetujuan atau membuka data lain.
- [x] **K05** Siswa A mencoba ID objek siswa B, guru lintas sekolah, dan superadmin membaca jurnal/refleksi -> ditolak tanpa kebocoran.
- [x] **K06** Refleksi enam langkah, matriks dua/tiga opsi, dan rencana minimal tiga langkah -> tersimpan dan sama setelah reload/login ulang.
- [x] **K07** Dua tab mengedit versi yang sama atau jaringan putus saat simpan -> konflik/gagal terlihat; UI tidak mengklaim tersimpan sebelum konfirmasi.
- [x] **K08** Konsultasi tanpa lampiran/rencana saja, klik ganda, usulan/konfirmasi jadwal, pembatalan -> tepat satu permintaan dan data sesuai izin.
- [x] **K09** Cabut/ganti/kedaluwarsakan snapshot -> akses lama ditolak, termasuk sesi guru yang sudah terbuka dan salinan cache.
- [x] **K10** Agregat aman dan kelompok kecil -> perhitungan benar, tidak ada pengungkapan lewat sel pelengkap, tooltip, parameter, atau drill-down.
- [x] **K11** Draf/arsip konten, input tidak aman, sumber kedaluwarsa -> tidak bocor/tereksekusi dan penanda sesuai.
- [x] **K12** Ekspor pilihan, hapus per fitur/akun, retensi kelulusan/pendaftaran, job gagal/retry, dan restore backup -> hasil sesuai kebijakan serta akses diblokir.
- [x] **K13** Unduh publik lalu mode pesawat, logout perangkat bersama, dan inspeksi cache -> konten publik tersedia; isi/token privat tidak tersimpan.
- [x] **K14** Periksa CSRF, rate limit, validasi server, redaksi log, file environment, dan kredensial; tidak ada rahasia di bundle/URL/log.
- [x] **K15** Jalankan lint, pengujian otomatis relevan, build produksi frontend, smoke test API, serta pemeriksaan visual/aksesibilitas pada ukuran sasaran.
- [x] **K16** Catat temuan dengan tingkat dampak dan bukti perbaikan; uji ulang bagian terdampak. Semua kebocoran dan kegagalan tugas utama harus diselesaikan sebelum penggunaan lanjut.

**Gerbang:** 100% fungsi minimum PRD lulus. UI, API, dan database sudah diuji sebagai satu alur, bukan hanya dinilai dari tampilan.

## 14. Tahap L - Validasi ahli dan uji pengguna

- [x] **L01** Siapkan checklist, skenario T1-T7, angket SUS, keterpahaman, lembar ahli, serta pencatatan waktu/bantuan tanpa menyalin isi pribadi.
- [ ] **L02** Lakukan validasi oleh satu ahli materi BK dan satu ahli media; laporkan hasil terpisah dengan target >= 75% dan revisi butir di bawah ambang.
- [ ] **L03** Lakukan uji sukarela 5-8 siswa dan satu guru BK dengan izin yang sesuai. Jika memakai mahasiswa pemeran, nyatakan sebagai simulasi.
- [x] **L04** Tambahkan pemeriksaan operasional superadmin: daftar pending, approve/reject, alasan, wali terpisah, dan akses siswa sesudah keputusan.
- [ ] **L05** Ukur target proposal: >= 80% tugas tanpa bantuan, refleksi <= 10 menit, informasi <= 2 menit per jalur, rata-rata SUS >= 68, keterpahaman >= 75% per butir.
- [x] **L06** Untuk pilot kelompok kecil, tampilkan state agregat disembunyikan; gunakan data fiktif terpisah yang memenuhi ambang untuk demonstrasi agregat lengkap.
- [ ] **L07** Prioritaskan tugas yang gagal pada dua peserta atau lebih dan seluruh temuan privasi; perbaiki, uji ulang bagian berubah, dan simpan log revisi.

**Selesai bila:** hasil, jumlah peserta, batas simulasi/nyata, temuan, dan perbaikannya terdokumentasi. Skor usability tidak dinyatakan sebagai bukti efektivitas bimbingan yang belum diuji.

## 15. Tahap M - Rilis dan serah terima

- [ ] **M01** Pilih hosting frontend/backend dan PostgreSQL sesuai kebutuhan biaya, lokasi data, koneksi, backup, scheduler, dan target kapasitas PRD.
- [ ] **M02** Pisahkan development, staging, dan produksi; atur HTTPS, secret server, origin/cookie, trusted proxy yang tepat, serta akses database minimum.
- [x] **M03** Susun langkah rilis: backup, migrasi terkontrol, build, smoke test, pembaruan cache publik, dan rollback yang tidak membatalkan penghapusan/pencabutan.
- [ ] **M04** Pasang pemantauan error simpan/konsultasi, job retensi/penghapusan, kapasitas, dan backup tanpa log jawaban/jurnal.
- [ ] **M05** Uji staging dari register -> approve -> refleksi/rencana -> konsultasi -> BK -> cabut akses -> ekspor/hapus menggunakan data fiktif.
- [ ] **M06** Lengkapi penanggung jawab sekolah/data/insiden, izin yang berlaku, tanggal retensi, kontak bantuan aktual, dan kesiapan operasi sebelum data siswa nyata diterima.
- [ ] **M07** Jalankan rilis terkontrol, bootstrap akun staf aman, dan smoke test tiga role; tidak membawa seed demo atau password default ke produksi.
- [x] **M08** Siapkan panduan siswa, BK, superadmin, dan operator: akun, approval, pemulihan, kurasi, bantuan, backup/restore, retensi, insiden, serta penghapusan.
- [x] **M09** Serahkan sumber kode, migrasi, contoh konfigurasi tanpa secret, inventaris sumber/izin konten, hasil uji, log revisi, dan catatan keterbatasan.
- [x] **M10** Periksa ulang dokumentasi terhadap implementasi akhir dan pastikan pekerjaan yang belum selesai tetap tercatat; jangan menandai proyek selesai hanya karena sudah ter-deploy.

## 16. Pemetaan kebutuhan ke tugas

| Kebutuhan | Task utama |
|---|---|
| JavaScript, backend/frontend, stack | B01-B05, B09-B13 |
| Desktop dan sembilan template ringkas | A02-A05, B06-B08, J05-J08 |
| Login tiga role dan register siswa | C01-C10 |
| Approval superadmin | D01-D09, K01-K04 |
| FR-01 Beranda | F04 |
| FR-02 Kenali Diriku | F01-F03 |
| FR-03 Peta Jalur | E01-E07 |
| FR-04 Timbang Pilihan | F05-F07 |
| FR-05 Rencana Langkahku | F08-F10, J04 |
| FR-06 Jurnal privat | F11-F12, K05 |
| FR-07 Konsultasi | G01-G05, H01-H02 |
| FR-08 Berbagi/pencabutan | G02-G03, G06-G08, K08-K09 |
| FR-09 Agregat | H04-H06, K10 |
| FR-10 Kurasi | E03-E06, H07-H09 |
| FR-11 Hak data/retensi | F13, I01-I08, K12 |
| FR-12 PWA/cetak | J01-J04, K13 |
| FR-13 Bantuan | A07, H03, J09 |
| Validasi, pengguna, dan rilis | K01-K16, L01-L07, M01-M10 |

## 17. Definisi proyek selesai

- [ ] Seluruh fitur V1 dan tiga role bekerja melalui UI, API, dan database; tombol dummy/data hardcoded tidak menggantikan fungsi sebenarnya.
- [x] Alur pendaftaran dan approval superadmin lulus, termasuk status ditolak, wali belum valid, dan suspensi.
- [x] Sembilan template desktop konsisten; panel/state tidak berkembang menjadi halaman yang tidak diperlukan.
- [ ] Konten enam jalur/18 profesi serta materi pendukung ditinjau dan bersumber.
- [ ] Refleksi, perbandingan, rencana, jurnal privat, konsultasi, kurasi, dan agregat memenuhi kriteria PRD.
- [ ] Jurnal, akses lintas akun/sekolah, berbagi, pencabutan, luring, ekspor, penghapusan, serta restore backup terbukti sesuai batas privasi.
- [ ] Pemeriksaan otomatis relevan, pengujian desktop/responsif, validasi ahli, dan uji pengguna selesai dengan temuan ditangani.
- [ ] Operasional, panduan, konfigurasi, pemantauan, dan serah terima siap; pekerjaan tersisa dicatat secara jujur.

**Mulai pengerjaan implementasi dari A01-A07, lalu B dan C. Milestone pertama yang harus dapat didemonstrasikan adalah siswa mendaftar, superadmin memberi keputusan, dan server membatasi akses sesuai statusnya.**


## 18. Bukti implementasi lokal - 22 November 2026

Checklist diperbarui setelah hasil berjalan dan verifikasi, bukan berdasarkan keberadaan UI statis. Bukti lengkap: `docs/verification.md`; audit referensi: `docs/design-audit.md`; menjalankan/operasi: `README.md`, `docs/operations.md`. Kriteria kelulusan menyeluruh V1 belum dicentang karena validasi eksternal dan operasi produksi masih terbuka.

| Tugas yang diperiksa | Bukti |
|---|---|
| A01-A06 | PRD/design diselaraskan; seluruh sembilan PNG/HTML ditinjau; peta rute dan koreksi ada di docs/design-audit.md. |
| B01-B13 | Dua aplikasi ESM; lockfile; lint/build; migrasi 001/002 pada PostgreSQL dev/test; pengujian seed lengkap dan idempoten. |
| C01-C08, C10; D01-D09 | backend/src/modules/auth, approvals; tests/integration.test.js: role injection, cookie/session rotation, CSRF/origin/rate limit, gate wali, concurrency, status/sesi dan batas sekolah. Browser membuktikan register-pending-approval-wali-login aktif. CLI bootstrap lewat stdin tanpa password default diuji pada database kosong terisolasi; bootstrap kedua ditolak. |
| E01-E04, E07 | API katalog/kurasi nyata; seed enam jalur/18 profesi, pencarian/filter, panel/sumber, tambah opsi dan sudah dipelajari diuji dari UI. Semua materi demonstrasi tetap berlabel. |
| F01-F13 | API dokumen berversi/jurnal/profil, wizard enam tahap, matriks, rencana tiga langkah, checklist, pengaturan. Persistensi dan privasi diuji API/PostgreSQL dan UI. |
| G01-G08, H01-H09 | Preview versi, snapshot allowlist, idempotensi, guru ditugaskan, lifecycle, revoke/renew/expire dan kurasi diuji integrasi; pengiriman rencana saja, penjadwalan dan pencabutan dibuktikan dari kedua role di browser. Agregat aman dan suppressed diuji dataset fiktif. |
| I01-I04, I06-I08 | Ekspor reauth, penghapusan fitur/account/cascade, job gagal dan retry; backup AES-GCM/restore database terisolasi serta replay tombstone. Worker lokal nyata dijalankan, status job administratif tanpa isi siswa. Produksi belum dipasang. |
| J01-J07 | Build worker, audit cache privateCached=false, luring sesudah reload, PDF kosong 7 halaman A4 dan cetak rencana tanpa jurnal, screenshot sembilan template, 50 hasil layout pada lima lebar CSS. |
| K01-K16 | 15 pengujian backend (banyak assertion) + 5 pengujian frontend; lint kedua aplikasi/build lulus; health/PDF/worker HTTP 200; UI-API-database, layout, cache dan render PDF. K16 memiliki log temuan/perbaikan di docs/verification.md. |
| L01, L04, L06 | Protokol, skenario admin dan instrumen SUS/keterpahaman/ahli siap di docs/validation-protocol.md; perilaku kelompok kecil dan demo aman telah diuji. Tidak ada hasil peserta/ahli rekaan. |
| M03, M08-M10 | Runbook rilis/rollback aman, panduan tiap role/operator, contoh environment tanpa secret, sumber/migrasi/hasil uji dan daftar batas operasional tersedia. Tidak ada deployment eksternal. |

### Pekerjaan yang tetap terbuka

- **A07:** perlu keputusan sekolah tentang petugas, izin wali, kebijakan pemulihan, retensi, kontak dan jadwal aktual. Form/penyimpanan konfigurasi sudah ada; demo tidak mengesahkan kebijakan nyata.
- **C09 (sebagian):** kode pemulihan hash, satu kali, reset password dan revoke sesi sudah lulus. Penanganan bila kode hilang memerlukan prosedur/verifikasi sekolah yang belum tersedia.
- **E05/E06:** cerita simulasi dan lembar diskusi sudah ada; cerita alumni nyata berizin, tinjauan konten Indonesia oleh ahli, serta validasi sumber/periode operasional belum tersedia.
- **I05:** engine retensi pending/rejected, cohort dan snapshot sudah diuji; kebijakan retensi konsultasi/kelulusan/pendaftaran belum disahkan sekolah. RETENTION_ENABLED default false; hapus mandiri tetap diproses worker.
- **J08/J09/J10:** keyboard/fokus/label dan responsivitas telah diperiksa. Audit pembaca layar lengkap, zoom 200% di seluruh alur, kontak terverifikasi, instalasi perangkat nyata dan benchmark perangkat/jaringan/beban pilot belum dibuktikan.
- **L02/L03/L05/L07:** membutuhkan ahli BK/media, peserta 5-8 siswa + guru, izin dan pengamatan nyata. Tidak ada skor usability/efektivitas yang dikarang.
- **M01/M02/M04/M05/M06/M07:** pilihan hosting/lokasi data, staging/HTTPS, secret manager, supervisor worker, backup/ledger eksternal, pemantauan, petugas dan rilis sekolah belum tersedia. Backup/restore lokal sudah diuji, namun bukan deployment atau kesiapan produksi.

Jangan menjalankan pengumpulan data siswa nyata sebelum gerbang sekolah dan operasi yang terbuka di atas diselesaikan. Referensi sumber dan seluruh ekspor Stitch awal tetap dipertahankan.

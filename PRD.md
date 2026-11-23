# PRD LANGKAHKU

**Product Requirements Document - Website Pendamping Perencanaan Karier Siswa SMA**

| Atribut         | Keterangan                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Versi           | 1.0                                                                                                                      |
| Tanggal         | 22 November 2026                                                                                                         |
| Status          | Rancangan untuk pengembangan; asumsi operasional perlu divalidasi sebelum penggunaan data siswa nyata                    |
| Produk          | LANGKAHKU                                                                                                                |
| Bentuk          | Website responsif berupa Progressive Web App (PWA), dengan alternatif lembar kerja PDF/cetak                             |
| Sasaran         | Siswa SMA kelas XI dan XII; guru BK sebagai pendamping                                                                   |
| Dokumen sumber  | `PROPOSAL ERVANIA ARSA .pdf`, Ervania Arsa, 2026, 34 halaman PDF                                                         |
| Lingkup dokumen | Analisis proposal, kebutuhan produk, rancangan pengalaman pengguna, data, arsitektur, pengujian, dan rencana pembangunan |

## 1. Ringkasan produk

LANGKAHKU membantu siswa yang masih bingung menentukan arah setelah SMA untuk mengenali diri, memahami jalur kuliah dan kerja, menimbang pilihan, lalu menyusun langkah yang dapat dilakukan. Website menghubungkan proses mandiri tersebut dengan layanan guru BK di sekolah melalui permintaan konsultasi dan ringkasan yang dipilih sendiri oleh siswa.

Alur layanan utamanya adalah **Kenali Diriku -> Peta Jalur -> Timbang Pilihan -> Rencana Langkahku**, dilengkapi **Jurnal Langkah**, **Sapa Guru BK**, dan **Dasbor Guru BK**. Urutan ini menjadi panduan, tetapi siswa tetap boleh membuka menu lain tanpa menyelesaikan seluruh aktivitas sebelumnya.

Website harus ringan, ramah remaja, dapat digunakan di ponsel, menyediakan informasi jalur untuk dibaca luring, dan tetap dapat didampingi melalui lembar kerja cetak. Keputusan tentang masa depan tetap berada pada siswa dengan dukungan orang tua dan guru BK.

Hasil utama yang dituju adalah **draf rencana yang dapat direvisi**, bukan rekomendasi jurusan otomatis atau hasil tes psikologis. Proposal belum menyediakan bukti efektivitas lapangan; PRD ini menetapkan rancangan dan cara mengujinya.

## 2. Dasar penyusunan dan cara membaca

### 2.1 Penanda kebutuhan

- **[P] Ketentuan proposal:** dinyatakan dalam dokumen sumber.
- **[D] Keputusan desain PRD:** penjabaran yang diperlukan agar kebutuhan dapat dibangun dan diuji, tetapi belum ditetapkan secara rinci dalam proposal.
- **[V] Perlu validasi:** memerlukan informasi sekolah, guru BK, pengguna, atau penanggung jawab data sebelum penerapan nyata.

Bagian dengan gabungan penanda memuat kebutuhan dari proposal beserta keputusan implementasi tambahannya. Semua angka kapasitas, batas input, kebijakan teknis, dan tenggat operasional yang tidak dirujuk langsung ke proposal adalah usulan PRD, bukan hasil penelitian.

Dokumen sumber diperlakukan sebagai bahan analisis produk. Petunjuk angket, tugas perkuliahan, slide UTS, dan pertanyaan penguji tidak menjadi perintah untuk membangun modul website. Permintaan terbaru adalah implementasi aplikasi di workspace. PRD menjadi acuan fitur/privasi; stack, tiga role, registrasi mandiri dan approval mengikuti structure.md. Riwayat desain lama tidak menjadi instruksi untuk menghentikan implementasi.

### 2.2 Peta rujukan proposal

Nomor halaman berikut menggunakan **urutan halaman PDF, mulai dari sampul**, bukan nomor halaman cetak.

| Rujukan | Halaman PDF | Pokok yang digunakan                                                                  |
| ------- | ----------- | ------------------------------------------------------------------------------------- |
| S1      | 3-9         | Masalah, tujuan, manfaat, bentuk PWA, fitur minimum, minimisasi data, batas produk    |
| S2      | 10-16       | Super, Holland, CIP/CASVE, SCCT, unsur intervensi, etika dan perlindungan data        |
| S3      | 17-18       | ADDIE, sasaran, persona rekaan, keterbatasan perangkat dan internet                   |
| S4      | 19-23       | Spesifikasi fitur, enam langkah refleksi, konten, flowchart, wireframe, aksesibilitas |
| S5      | 23-26       | Uji fungsional, validasi ahli, uji pengguna, indikator, jadwal P8-P15                 |
| S6      | 30-34       | Instrumen kebutuhan, contoh kartu, angket SUS, validasi, pemeriksaan rancangan        |

Rujukan tersebut adalah sumber kebutuhan. Literatur dan regulasi yang disebut proposal tidak diverifikasi ulang melalui PRD ini; pembahasan persetujuan dan tata kelola di bawah merupakan persyaratan desain dari proposal, bukan pernyataan bahwa website sudah memenuhi seluruh kewajiban hukum.

## 3. Analisis proposal

### 3.1 Masalah dan respons produk

| Masalah dalam proposal                             | Kebutuhan pengguna                                    | Respons website                         | Bukti keberhasilan                                               |
| -------------------------------------------------- | ----------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------- |
| Siswa belum mengenali minat, kekuatan, dan nilai   | Ruang refleksi yang sederhana dan tidak menghakimi    | Kenali Diriku dengan enam langkah       | Siswa menyelesaikan alur dan dapat menyebutkan 2-3 minatnya      |
| Informasi kuliah dan kerja tersebar                | Informasi ringkas dengan rujukan yang dapat diperiksa | Peta Jalur, kartu profesi, tautan resmi | Informasi jalur ditemukan dalam <= 2 menit per jalur             |
| Siswa sulit membandingkan pilihan                  | Cara menimbang berdasarkan keadaan pribadi            | Matriks 2-3 opsi di Timbang Pilihan     | Matriks tersimpan dan siswa dapat menjelaskan alasannya          |
| Gambaran masa depan belum menjadi tindakan         | Tujuan, rencana cadangan, dan langkah kecil           | Rencana Langkahku per semester          | Minimal tiga langkah tersimpan dan dapat dibuka kembali          |
| Siswa sungkan meminta bantuan; waktu guru terbatas | Pintu masuk konsultasi yang mudah dan antrean tertata | Sapa Guru BK dan pengelolaan permintaan | Permintaan diterima guru; hanya ringkasan terpilih yang terlihat |
| Guru memerlukan gambaran kebutuhan layanan         | Informasi kelompok tanpa membuka refleksi pribadi     | Dasbor agregat                          | Angka sesuai data sumber dan tidak mengungkap siswa              |
| Akses perangkat dan internet tidak merata          | Alternatif penggunaan dengan kuota terbatas           | PWA, konten publik luring, PDF/cetak    | Kartu yang diunduh tetap terbaca saat luring                     |

### 3.2 Kekuatan dan batas bukti

**Kekuatan proposal:** tujuan layanan jelas; hubungan teori dan fitur cukup terstruktur; posisi guru BK dipertahankan; tersedia batas otomatisasi; etika, aksesibilitas, dan pengujian sudah dipertimbangkan sejak awal. Rujukan: S1-S6.

**Batas bukti:** persona dan skenario kebutuhan masih rekaan/simulasi. Angket kebutuhan dan wawancara masih berupa rencana. Belum ada hasil validasi ahli, skor SUS, atau bukti peningkatan kemampuan keputusan karier. Karena itu, prioritas dapat disesuaikan setelah studi pendahuluan dan hasil uji tidak boleh dipasarkan sebagai efektivitas yang sudah terbukti.

### 3.3 Kekosongan dan ketidaksesuaian yang diselesaikan

| Temuan                                                                                               | Risiko bila dibiarkan                                     | Keputusan dalam PRD                                                                                                                        |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Mekanisme akun siswa belum ditentukan                                                                | Penyimpanan dan pemulihan data tidak jelas                | [D] Registrasi mandiri siswa pending_approval, approval superadmin dan izin wali terpisah; tanpa email/telepon siswa                                                                     |
| Persetujuan wali disebut, alur verifikasinya belum dirinci                                           | Centang mandiri dianggap cukup                            | [D/V] Verifikasi proses wali dilakukan sekolah; akun data nyata menunggu status persetujuan yang sah                                       |
| Wireframe Sapa Guru BK menawarkan berbagi jurnal, tetapi tabel etika menyatakan jurnal selalu privat | Jurnal dapat terekspos                                    | [D] Ikuti ketentuan privasi: jurnal tidak dapat dibagikan melalui website, termasuk dalam snapshot konsultasi                              |
| Hubungan anonim/pseudonim dan identitas saat konsultasi belum dijelaskan                             | Guru menerima permintaan yang tidak dapat ditindaklanjuti | [D/V] Nama panggilan, kelas, dan nomor permintaan cukup untuk pengaturan pertemuan sesuai prosedur sekolah; verifikasi langsung di sekolah |
| Empat fitur minimum P9 beririsan dengan fitur data P11                                               | Prototipe awal disangka siap memproses data siswa         | [D] P9 adalah prototipe data fiktif; semua kontrol data wajib selesai sebelum uji dengan data nyata                                        |
| Target enam kartu jalur, tetapi ragam subjalur lebih banyak                                          | Ada jalur yang terlewat atau jumlah kartu membengkak      | [D] Enam kartu induk dengan bagian subjalur; beasiswa dibahas lintas kartu                                                                 |
| Masa simpan disebut sampai lulus, tanggal dan backup belum ditentukan                                | Data tertinggal di sistem/cadangan                        | [D/V] Tanggal retensi per angkatan, penghapusan terjadwal, serta batas pemulihan backup yang eksplisit                                     |
| Agregat tanpa nama masih dapat mengungkap kelompok kecil                                             | Identifikasi tidak langsung                               | [D] Ambang kelompok dan penyembunyian sel kecil; tidak ada penelusuran ke daftar siswa                                                     |
| Ketersediaan guru dan waktu respons belum ditetapkan                                                 | Siswa mengira layanan dipantau terus                      | [D/V] Jam layanan dan estimasi respons diatur sekolah dan ditampilkan sebelum mengirim                                                     |

## 4. Tujuan, hasil, dan batas produk

### 4.1 Tujuan pengguna [P]

1. Siswa dapat menyebutkan minat, kekuatan, dan nilai kerja yang penting baginya.
2. Siswa dapat menjelaskan minimal dua jalur setelah lulus beserta persyaratan umumnya.
3. Siswa dapat menimbang pilihan dengan alasan pribadi, termasuk faktor biaya dan dukungan.
4. Siswa memiliki draf rencana per semester yang dapat diperbarui.
5. Siswa mengetahui kapan dan bagaimana meminta bantuan guru BK.
6. Guru BK dapat mengurasi informasi, mengelola permintaan, dan merencanakan layanan berdasarkan kebutuhan kelompok.

### 4.2 Prinsip produk [P/D]

- Mendampingi proses, menjaga otonomi siswa, dan menyediakan jalan kembali untuk merevisi pilihan.
- Menyajikan satu tugas utama per layar dengan bahasa Indonesia yang pendek dan ramah.
- Mengutamakan fungsi inti, akses setara, dan keamanan data daripada banyaknya fitur.
- Tidak menganggap kuliah lebih tinggi nilainya daripada kerja, usaha, atau kuliah sambil kerja.
- Tidak menampilkan label gagal, tidak cocok, tipe pasti, atau peringkat siswa.
- Memakai pesan pendamping yang ditulis dan ditinjau manusia; tidak menganalisis siswa dengan AI generatif.

### 4.3 Di luar cakupan

Tidak termasuk dalam V1: tes psikologi baku, diagnosis, penjurusan otomatis, pencocokan lowongan, pengajuan kuliah/beasiswa, pembayaran, unggah rapor, penilaian rapor, portal seleksi sekolah, chatbot AI, analisis isi jurnal, chat/video konseling langsung, jejaring sosial, akun orang tua, serta aplikasi native di toko aplikasi.

Website juga bukan sistem catatan klinis atau layanan darurat. Form konsultasi berfungsi untuk mengawali pertemuan/tindak lanjut guru BK. Kontak bantuan cepat tetap tersedia secara jelas pada setiap halaman.

## 5. Pengguna dan hak akses

### 5.1 Persona berdasarkan proposal [P]

| Persona rekaan   | Situasi                                                                        | Implikasi produk                                                                   |
| ---------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Rani, kelas XI   | Belum tahu minat; cenderung mengikuti teman; ponsel pribadi dan kuota terbatas | Refleksi singkat, contoh aktivitas konkret, kartu ringan, tanpa benar-salah        |
| Bagas, kelas XII | Ingin kuliah tetapi khawatir biaya; memakai ponsel bersama                     | Pilihan kuliah/kerja setara, kriteria biaya, logout yang jelas, alternatif cetak   |
| Bu Sari, guru BK | Waktu pendampingan terbatas; membutuhkan informasi terkurasi                   | Antrean konsultasi, ringkasan atas izin, kurasi sederhana, agregat yang aman       |
| Orang tua/wali   | Mendampingi diskusi masa depan                                                 | Lembar diskusi dan ringkasan yang dibagikan siswa sendiri; tidak memiliki login V1 |

### 5.2 Matriks akses [P/D]

| Data/aksi | Tamu | Siswa aktif pemilik | BK yang ditugaskan | Superadmin sekolah | Operator infrastruktur |
|---|---|---|---|---|---|
| Konten terbit | Baca | Baca | Kelola konten sekolah sesuai kewenangan | Baca publik | Operasi infrastruktur |
| Pendaftaran/approval | Daftar siswa pending | Status sendiri, batal | Tidak | Antrean, keputusan beralasan dan riwayat | Provisioning awal terkontrol |
| Persetujuan wali | Tidak | Lihat status sendiri | Tidak secara bawaan | Verifikasi terpisah dengan referensi minimum | Dukungan teknis tanpa isi pribadi |
| Akun BK | Tidak | Tidak | Akun sendiri | Buat dan kelola sekolahnya | Bootstrap superadmin melalui CLI |
| Refleksi, matriks, rencana | Tidak | Baca/tulis/hapus sendiri | Hanya snapshot terpilih | Tidak | Tidak tersedia di antarmuka operasional |
| Jurnal | Tidak | Pemilik saja | Tidak | Tidak | Tidak tersedia di antarmuka operasional |
| Konsultasi | Tidak | Milik sendiri | Permintaan yang ditugaskan dalam sekolah | Tidak | Diagnostik tanpa isi |
| Agregat | Tidak | Tidak | Kelompok aman sekolahnya | Tidak | Diagnostik tanpa isi pribadi |
| Ekspor/hapus pribadi | Tidak | Reautentikasi, pilih bagian | Tidak | Status job administratif tanpa isi | Jalankan job/restore sesuai runbook dan audit |

Superadmin adalah role aplikasi untuk administrasi akun: antrean siswa, approve/reject, riwayat, verifikasi wali terpisah, dan pembuatan/status akun BK. Tidak ada akses otomatis ke jurnal, refleksi, atau konsultasi. Operator teknis merupakan peran infrastruktur tambahan, bukan pendamping BK. Batas di atas adalah batas akses aplikasi; penyimpanan server masih melibatkan kemampuan administratif penyedia infrastruktur. Akses luar biasa untuk pemulihan/insiden harus dibatasi, beralasan, dan diaudit. Jangan menjanjikan enkripsi ujung ke ujung jika tidak diimplementasikan.

Wali kelas, siswa lain, guru sekolah lain, dan pihak komersial tidak mendapat akses ke data pribadi. Otorisasi diperiksa di server pada setiap operasi, bukan hanya dengan menyembunyikan tombol.

## 6. Cakupan dan urutan rilis

| Tahap              | Cakupan                                                                                             | Batas penggunaan                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Tahap I / P9       | Kenali Diriku, Peta Jalur, Rencana Langkahku, Sapa Guru BK; beranda dan navigasi                    | Prototipe klik/fungsional dengan data fiktif                                |
| Tahap konten / P10 | Enam kartu jalur, 18 kartu profesi, Jurnal Langkah, lembar kerja PDF, materi pendukung              | Tetap demonstrasi bila kontrol data belum lengkap                           |
| Tahap II / P11     | Penyimpanan, akun dan persetujuan, otorisasi, Timbang Pilihan, dasbor agregat, kurasi, ekspor/hapus | Calon versi uji; belum dibuka luas                                          |
| Kandidat V1 / P12  | Seluruh fungsi dan kontrol minimum teruji; validasi ahli                                            | Boleh masuk uji terbatas setelah gerbang kelayakan terpenuhi                |
| V1 akhir / P13-P15 | Uji pengguna, revisi, panduan siswa/guru, laporan dan serah terima                                  | Penerapan di sekolah mengikuti kesiapan operasional dan persetujuan sekolah |

**Prioritas P0:** empat fitur minimum dan seluruh fondasi privasi/akses yang dibutuhkan untuk menjalankannya pada data nyata. **Prioritas P1:** Timbang Pilihan, Jurnal Langkah, agregat, konten lengkap, Cerita Langkah, dan lembar diskusi orang tua. P1 adalah bagian sasaran V1 akhir, bukan otomatis fitur yang boleh dihilangkan. Prototipe awal dapat menguranginya sesuai jadwal proposal.

Penyimpanan aman, persetujuan, hak akses, serta ekspor dan penghapusan tidak boleh ditunda melewati pembukaan penggunaan data siswa nyata.

## 7. Struktur halaman dan navigasi [D]

| Area/rute konseptual                  | Isi dan tindakan utama                                                                            |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/`                                   | Penjelasan singkat produk, pilihan jelajah tamu, mulai sebagai siswa, masuk guru, bantuan         |
| `/privasi`, `/persetujuan`            | Tujuan data, siapa yang melihat, retensi, pilihan setuju/tidak, status wali                       |
| `/masuk`, `/daftar`, `/status`, `/pemulihan`   | Login tiga role, pendaftaran siswa pending, keputusan, dan pemulihan akun                                               |
| `/beranda`                            | Posisi empat langkah, lanjutkan aktivitas terakhir, langkah rencana terdekat, akses jurnal dan BK |
| `/kenali-diriku`                      | Wizard enam langkah dan ringkasan yang dapat diedit                                               |
| `/peta-jalur`                         | Pencarian, filter Kuliah/Kerja/Kuliah + Kerja/Usaha, daftar kartu                                 |
| `/peta-jalur/:slug`, `/profesi/:slug` | Detail, sumber, tanggal tinjau, unduh luring, tambah sebagai opsi                                 |
| `/cerita-langkah/:slug`               | Kisah alumni yang telah mendapat izin dan dianonimkan                                             |
| `/timbang-pilihan`                    | Daftar matriks dan editor perbandingan 2-3 opsi                                                   |
| `/rencana`                            | Tujuan utama/cadangan, daftar langkah XI-1, XI-2, XII-1, XII-2                                    |
| `/jurnal`                             | Daftar entri privat dan editor refleksi mingguan                                                  |
| `/sapa-bk`, `/sapa-bk/:id`            | Form permintaan, pratinjau berbagi, status dan usulan waktu                                       |
| `/pengaturan`                         | Profil minimum, sesi, ekspor, izin berbagi, hapus data/akun, logout                               |
| `/unduhan`                            | Paket publik luring dan PDF kosong yang tersedia                                                  |
| `/bantuan`                            | Cara memakai website, jam BK, kontak dan bantuan cepat yang diverifikasi                          |
| `/bk/permintaan`                      | Antrean dan detail permintaan yang berwenang                                                      |
| `/bk/agregat`                         | Ringkasan kelompok yang aman                                                                      |
| `/bk/konten`                          | Draf, tinjauan, terbit, arsip, dan riwayat konten                                                 |
| `/bk/pengaturan`                      | Jam layanan, akun sekolah, layanan BK; approval/wali dan akun BK di area superadmin terpisah                         |

Pada ponsel, navigasi bawah berisi **Beranda, Diriku, Jalur, Rencana, BK** seperti arah wireframe proposal. Timbang Pilihan tersedia dari kartu langkah di beranda dan tombol di Peta Jalur/Rencana; Jurnal tersedia dari Beranda/Rencana. Empat langkah inti tetap terlihat sebagai urutan di beranda. Pada desktop, gunakan navigasi yang konsisten dan panel guru yang lebih lebar.

## 8. Alur pengguna

### 8.1 Tamu [P/D]

1. Buka website dan pilih **Jelajah tanpa akun**.
2. Baca Peta Jalur, kartu profesi, dan materi publik tanpa membuat profil.
3. Bila memilih fitur pribadi, tampilkan alasan akun/persetujuan dibutuhkan dan pilihan kembali menjelajah.
4. Tidak ada jawaban, profil, atau riwayat baca tamu yang disimpan sebagai data pengguna.
5. Penyimpanan paket konten publik luring hanya dilakukan atas tindakan unduh pengguna; tidak memuat informasi pribadi.

### 8.2 Registrasi siswa, approval, dan persetujuan [D/V]

1. Siswa memilih sekolah yang membuka pendaftaran, username, kata sandi, nama panggilan, kelas/semester, kategori usia, dan persetujuan aktif. Tidak ada email, telepon, NISN, atau tanggal lahir lengkap.
2. Server menolak field administratif, menetapkan role `siswa` dan status `pending_approval`, menyimpan hash Argon2id serta persetujuan versi/waktu. Siswa mendapat kode pemulihan sekali pakai.
3. Sesi pending/rejected hanya untuk status sendiri, logout, atau pembatalan. Konten publik tetap terbuka; fitur pribadi ditolak backend.
4. Superadmin sekolah meninjau data minimum, menyetujui atau menolak dengan alasan operasional. Keputusan dan audit satu transaksi; keputusan bersamaan tidak saling menimpa.
5. Untuk kategori di bawah 18, petugas superadmin mencatat verifikasi izin wali dan referensi minimum melalui operasi terpisah. Dokumen wali disimpan sekolah; tidak diunggah ke aplikasi. Kategori dewasa menggunakan `not_required` sesuai kebijakan yang divalidasi sekolah.
6. Akses pribadi mensyaratkan akun approved, persetujuan siswa valid dan wali verified/not_required sesuai usia. Semua API memeriksa status terbaru. Approval akun tidak mengubah status wali.
7. Superadmin membuat/mengelola akun BK dan dapat suspend/aktifkan kembali hanya akun yang sebelumnya disetujui; sesi dicabut. Superadmin tidak memperoleh akses data konseling.

Role aplikasi hanya `superadmin`, `bk`, `siswa`. Operator teknis adalah tanggung jawab infrastruktur, bukan role aplikasi tambahan. Satu form login menentukan tujuan berdasarkan server. Prosedur wali, pembagian petugas, retensi dan kontak aktual harus divalidasi sekolah; pengembangan menggunakan data fiktif.

### 8.3 Siklus perencanaan siswa [P/D]

1. Beranda menawarkan Kenali Diriku atau melanjutkan aktivitas yang belum selesai.
2. Siswa mengisi refleksi, melihat ringkasan, dan membuka contoh jalur/profesi terkait aktivitas yang dipilih.
3. Siswa mengeksplorasi pilihan dan memilih 2-3 opsi untuk dibandingkan.
4. Siswa memberi penilaian pribadi dan alasan; hasil berlabel **bahan diskusi**.
5. Siswa memilih tujuan sendiri, menulis rencana cadangan, dan menyusun minimal tiga langkah untuk semester aktif.
6. Siswa dapat mengisi jurnal mingguan dan meninjau kemajuannya.
7. Bila memerlukan bantuan, siswa memilih ringkasan yang akan dibagikan dan mengajukan konsultasi.
8. Setelah diskusi, siswa merevisi rencananya. Tidak ada pilihan yang dikunci permanen oleh website.

### 8.4 Guru BK [P/D]

1. Masuk dengan akun BK yang dibuat superadmin sekolah; tidak ada pendaftaran guru bebas.
2. Lihat permintaan baru, topik, kelas, nama panggilan, ketersediaan waktu, dan snapshot yang diizinkan.
3. Setujui atau usulkan waktu lain, kemudian lakukan tindak lanjut di luar website/tatap muka.
4. Tandai selesai tanpa menyimpan catatan konseling sensitif di modul ini.
5. Tinjau agregat bila kelompok memenuhi batas privasi.
6. Perbarui konten dan sumber yang perlu ditinjau.

## 9. Kebutuhan fungsional terperinci

### FR-01 - Beranda dan kemajuan [P/D, P0]

**Cerita pengguna:** sebagai siswa, saya ingin mengetahui langkah saya saat ini agar dapat melanjutkan tanpa bingung.

- Tampilkan sapaan nama panggilan, empat menu inti, aktivitas terakhir, dan akses Sapa Guru BK.
- Status aktivitas adalah belum mulai, draf, atau ditinjau/diselesaikan oleh siswa. Kemajuan adalah kelengkapan aktivitas, bukan nilai kemampuan atau kesiapan karier.
- Beranda tidak memuat cuplikan jurnal agar aman saat layar dilihat orang lain; cukup tampilkan tombol menulis jurnal.
- Menu tidak terkunci oleh urutan. Notifikasi berupa pengingat netral dalam aplikasi, tanpa email atau push pada V1.

**Kriteria penerimaan:** siswa dapat membuka setiap fitur inti dari beranda, kembali tanpa kehilangan data tersimpan, dan melanjutkan langkah refleksi terakhir setelah login ulang. Status kosong, sedang memuat, gagal, dan luring tersedia.

### FR-02 - Kenali Diriku [P/D, P0]

Enam langkah wajib tersedia sebagai alur:

| Langkah | Isi                           | Bentuk input/output                                                                            |
| ------- | ----------------------------- | ---------------------------------------------------------------------------------------------- |
| 1       | Kegiatan yang disukai         | Pilihan aktivitas beragam, boleh pilih beberapa dan menambah isian                             |
| 2       | Mata pelajaran yang dinikmati | Pilihan/isian tanpa meminta nilai rapor                                                        |
| 3       | Kekuatan diri                 | Pilihan kekuatan dan contoh pengalaman opsional                                                |
| 4       | Nilai kerja                   | Misalnya membantu orang, kreativitas, penghasilan stabil; urutan pilihan pribadi opsional      |
| 5       | Kondisi dan dukungan          | Dukungan, hambatan umum, dan bantuan yang diperlukan; tidak meminta penghasilan keluarga rinci |
| 6       | Ringkasan diri                | Gabungan jawaban yang dapat diperbaiki dan dikonfirmasi siswa                                  |

- Label **"Ini refleksi, bukan tes. Tidak ada jawaban benar atau salah."** muncul sebelum aktivitas dan pada ringkasan.
- Jawaban sensitif atau narasi dapat dilewati dengan pilihan **Lewati dulu**. Selesai alur berarti enam langkah sudah ditinjau dan ringkasan dikonfirmasi, bukan semua isian harus dijawab.
- Kategori aktivitas dapat menggunakan RIASEC sebagai dasar editorial untuk contoh profesi. Jangan mengeluarkan tipe pasti, persentase kecocokan, skor psikologis, atau prediksi kemampuan.
- Ringkasan dibentuk secara deterministik dari jawaban siswa dan tidak menambahkan tafsir yang tidak ditulis/dipilih siswa.
- Simpan draf daring dengan indikator **Menyimpan/Tersimpan/Gagal disimpan**. Tampilkan kegagalan dengan tombol coba lagi; jangan mengklaim tersimpan sebelum server mengonfirmasi.
- Semua jawaban dapat diedit. Perubahan tidak mengubah snapshot yang sudah pernah dibagikan secara diam-diam.

**Kriteria penerimaan:** enam langkah dapat dilewati/diisi dan ditinjau tanpa kehilangan jawaban; ringkasan sesuai input; tidak ada skor kecocokan; akun lain/guru tidak dapat membaca jawaban asli. Target uji pengguna: selesai tanpa bantuan dalam <= 10 menit.

### FR-03 - Peta Jalur dan profesi [P/D, P0; konten lengkap P1]

- Sediakan empat kategori utama: Kuliah, Kerja, Kuliah sambil Kerja, Usaha.
- Cari melalui judul, kata kunci, subjalur, dan nama profesi. Refleksi tidak menjadi syarat untuk memakai pencarian.
- Sediakan filter kelompok minat untuk eksplorasi; hasil bukan rekomendasi terbaik bagi siswa.
- Detail kartu memiliki struktur baku, tautan resmi, tanggal ditinjau, serta status informasi.
- Tindakan **Tambahkan ke pilihan** hanya untuk siswa aktif dan tidak otomatis menentukan tujuan.
- Siswa aktif dapat menandai **Sudah kupelajari** pada kartu; konfirmasi eksplorasi ini dipakai untuk kemajuan, bukan riwayat klik/baca yang dilacak diam-diam.
- Tindakan unduh luring menyimpan konten publik terpilih beserta metadata versi. Tautan eksternal tetap memerlukan internet.
- Hasil kosong menawarkan penghapusan filter atau pencarian lain. Tautan yang tidak tersedia tidak menyebabkan hilangnya kartu.
- Tanggal pendaftaran, biaya, syarat, dan beasiswa tidak ditulis sebagai fakta pasti tanpa sumber dan periode berlaku. Konten yang kedaluwarsa ditandai dengan arahan memeriksa sumber resmi.

**Kriteria penerimaan:** pengguna dapat menemukan syarat SNBT dan satu jalur kerja dalam <= 2 menit per jalur; setiap kartu terbit memiliki sumber/tanggal tinjau; paket unduhan dapat dibaca saat luring; informasi sumber eksternal tidak diklaim tersedia luring.

### FR-04 - Timbang Pilihan [P/D, P1]

- Bandingkan dua atau tiga opsi dari Peta Jalur atau isian sendiri.
- Kriteria awal: minat, kemampuan, biaya, dukungan keluarga, peluang. Siswa boleh menandai kriteria belum diketahui dan menulis alasan.
- Penilaian 1-5 adalah pertimbangan subjektif siswa. Petunjuk konsisten: 1 berarti kurang mendukung, 5 berarti sangat mendukung; untuk biaya, 5 berarti lebih terjangkau menurut keadaan siswa.
- Isian kosong tidak diubah menjadi nol. Draf boleh disimpan; status lengkap memerlukan nilai atau penanda belum diketahui pada setiap sel dan peninjauan siswa.
- Tidak ada pembobotan tersembunyi, peringkat otomatis, pilihan pemenang, atau skor cocok/tidak cocok. V1 menampilkan matriks dan alasan tanpa menjumlahkannya menjadi rekomendasi.
- Siswa memilih sendiri opsi yang hendak dibawa ke Rencana Langkahku dan tetap boleh memilih opsi lain.
- Tampilkan **"Hasil ini bahan diskusi, bukan keputusan otomatis."**
- Tampilan seluler menggunakan bagian per opsi atau tabel yang aksesibel; setiap input tetap menyebut opsi dan kriterianya.

**Kriteria penerimaan:** dua/tiga opsi tersimpan dan dapat dimuat ulang; nilai di luar 1-5 ditolak; sel kosong dibedakan dari nilai; pilihan tujuan tidak berubah tanpa tindakan siswa.

### FR-05 - Rencana Langkahku [P/D, P0]

- Simpan tujuan utama dan rencana cadangan, keduanya dapat berupa draf.
- Sediakan semester XI-1, XI-2, XII-1, XII-2. Semester aktif berasal dari profil; semester lampau tetap dapat ditinjau.
- Setiap langkah memuat judul tindakan, semester, catatan opsional, tenggat opsional, dan status belum selesai/selesai.
- Tambah, ubah, urutkan, tandai selesai, batalkan tanda selesai, dan hapus langkah dengan konfirmasi singkat.
- Anjurkan minimal tiga langkah untuk semester aktif; jangan menolak penyimpanan draf yang baru berisi satu langkah.
- Contoh tindakan berupa mencari informasi, menyiapkan dokumen, berdiskusi, atau mencoba pengalaman; contoh harus dipilih siswa sebelum masuk daftar pribadinya.
- Kemajuan dihitung dari jumlah langkah selesai dibanding langkah yang tersedia, bukan dari kualitas cita-cita.
- Cetak/unduh ringkasan rencana melalui tindakan eksplisit. Jurnal tidak disertakan.

**Kriteria penerimaan:** rencana dengan minimal tiga langkah tetap tampil setelah aplikasi dibuka ulang; perubahan status tersimpan; tujuan cadangan terpisah; semester kosong memiliki ajakan yang jelas; hasil cetak tidak memuat bagian yang tidak dipilih.

### FR-06 - Jurnal Langkah [P/D, P1]

- Refleksi mingguan dengan dua atau tiga pertanyaan singkat, misalnya langkah yang dicoba, hal yang dipelajari, dan bantuan yang dibutuhkan.
- Mendukung draf, edit, dan hapus. Tidak wajib diisi dan tidak memengaruhi akses fitur lain.
- Isi jurnal hanya dapat dibaca siswa pemilik. Tidak tersedia opsi berbagi jurnal, cuplikan jurnal pada dasbor, atau endpoint jurnal untuk guru.
- Tidak ada pemindaian sentimen, penilaian kondisi mental, atau peringatan otomatis berdasarkan isi jurnal.
- Jurnal disimpan daring dengan akses pemilik; tidak masuk cache service worker atau penyimpanan luring V1.
- Ekspor jurnal hanya melalui ekspor data pribadi pemilik yang dipilih secara sadar, dengan penjelasan bahwa file unduhan dapat dibaca siapa pun yang mendapatkannya.

**Kriteria penerimaan:** guru maupun akun lain ditolak server saat mencoba membuka ID jurnal; payload Sapa Guru BK menolak field jurnal; entri terhapus tidak dapat dimuat ulang; tautan bantuan tetap terlihat tanpa membaca isi entri.

### FR-07 - Sapa Guru BK [P/D, P0]

Formulir memuat topik, waktu yang memungkinkan, catatan pendek opsional, serta pilihan berbagi ringkasan. Topik awal: pilih jurusan, kuliah atau kerja, biaya, dukungan orang tua, lainnya. Catatan diberi petunjuk agar siswa tidak menulis rincian masalah sensitif yang sebaiknya dibicarakan langsung.

- Pilihan berbagi: ringkasan Kenali Diriku, matriks Timbang Pilihan, dan ringkasan Rencana Langkahku. Semua **tidak dipilih secara bawaan**.
- Siswa boleh mengirim permintaan tanpa melampirkan ringkasan. Data operasional yang tetap dikirim adalah nama panggilan, kelas, topik, ketersediaan waktu, catatan yang ditulis, dan nomor permintaan; semuanya ditampilkan dalam pratinjau.
- Sebelum kirim, tampilkan guru/sekolah penerima, pratinjau tepat data yang dibagikan, masa berlaku akses, serta informasi jam layanan.
- Pengiriman membutuhkan sambungan dan sesi aktif. Gunakan kunci idempotensi agar klik ulang atau retry tidak membuat permintaan ganda.
- Tampilkan nomor permintaan setelah server mengonfirmasi. Saat luring, tombol kirim dinonaktifkan dengan alasan; tidak ada antrean kirim otomatis tersembunyi.
- Status: **diajukan -> dijadwalkan / perlu penjadwalan ulang -> selesai**. Siswa dapat membatalkan permintaan yang belum selesai. Guru dapat menutup permintaan yang tidak dapat ditindaklanjuti dengan alasan operasional singkat.
- Usulan waktu bukan janji pertemuan sampai guru mengonfirmasi. Perubahan dapat dilihat siswa di dalam aplikasi.
- Tidak ada fitur pesan bebas berkelanjutan atau catatan konseling lengkap dalam V1.

**Kriteria penerimaan:** guru menerima tepat satu permintaan; hanya snapshot terpilih tersedia; siswa dapat melihat status miliknya; guru di sekolah lain tidak dapat melihat permintaan; tidak ada jurnal dalam tampilan, API, atau ekspor guru.

### FR-08 - Berbagi dan pencabutan akses [D, P0]

- Berbagi menggunakan **snapshot** dari bagian yang dipilih pada waktu pengiriman, bukan akses langsung ke seluruh profil.
- Snapshot mencatat versi, jenis bagian, waktu persetujuan, guru/sekolah penerima, dan waktu berakhir.
- Siswa dapat melihat kembali siapa yang mendapat akses dan mencabut satu/seluruh bagian. Pencabutan memblokir pembacaan berikutnya segera dan menghapus isi snapshot melalui proses penghapusan.
- Setelah data asli diedit, snapshot lama tetap sama sampai siswa secara eksplisit mengganti dan mengonfirmasi ulang. Versi lama kemudian kehilangan akses.
- Usulan batas akses: sampai 30 hari setelah permintaan ditutup, atau sampai akun dihapus/tanggal retensi kelulusan, mana yang lebih awal. Sekolah memvalidasi kebijakan ini.
- Guru tidak mendapat tautan publik atau unduhan massal snapshot. Jelaskan bahwa pencabutan tidak dapat menarik kembali informasi yang sudah dilihat atau dicatat di luar aplikasi.
- Jurnal dan data yang tidak dipilih ditolak oleh daftar field yang diizinkan di server, bukan sekadar disembunyikan di UI.

**Kriteria penerimaan:** pencabutan berlaku pada sesi guru yang sudah terbuka saat data diminta ulang; membuka URL snapshot lama ditolak; perubahan ringkasan tidak terbagikan tanpa persetujuan baru; cache privat tidak menyajikan salinan lama.

### FR-09 - Dasbor Guru BK dan agregat [P/D, P1]

- Daftar konsultasi dapat difilter menurut status dan topik. Tampilkan rincian identitas minimum hanya pada permintaan yang berwenang.
- Agregat terpisah dari antrean: jumlah pengguna per tahap dan topik konsultasi yang sering diminta, tanpa nama atau tautan ke siswa.
- Gunakan definisi tahap yang terdokumentasi: belum mulai, refleksi dikonfirmasi, eksplorasi ditandai siswa, matriks ditinjau, rencana ditinjau. Tahap bukan penilaian kesiapan dan tidak menunjukkan isi jawaban.
- [D] Untuk topik, hitung siswa unik per topik dalam periode yang ditampilkan agar retry/permintaan berulang tidak menggembungkan gambaran kebutuhan. Label periode dan satuan hitung harus terlihat.
- [D] Awalnya agregat hanya pada tingkat sekolah/angkatan tetap, tanpa filter kombinasi bebas. Publikasikan hanya bila kelompok minimal 10 siswa dan sel yang ditampilkan minimal 5 siswa; sembunyikan pula sel/total pelengkap yang memungkinkan penghitungan balik kelompok kurang dari 5.
- Jika syarat tidak terpenuhi, tampilkan **"Data kelompok belum cukup untuk ditampilkan dengan aman."** Jangan mengganti dengan daftar siswa.
- Tidak ada isi jurnal, teks refleksi, ranking, ekspor per siswa, atau drill-down dari grafik.
- Uji pengguna 5-8 siswa dapat melihat keadaan agregat disembunyikan; demonstrasi agregat lengkap menggunakan kumpulan data fiktif terpisah yang memenuhi ambang.

**Kriteria penerimaan:** hasil sesuai perhitungan dataset acuan; kelompok kecil terlindungi termasuk lewat sel pelengkap; guru hanya melihat sekolahnya; tidak ada identitas dalam respons agregat.

### FR-10 - Kurasi konten [P/D, P1; jalur penerbitan aman P0]

- Guru berwenang dapat membuat, mengedit, meninjau, menerbitkan, mengarsipkan, dan memperbarui kartu jalur/profesi/cerita.
- Status konten: draf, siap ditinjau, terbit, arsip. Publik hanya menerima versi terbit.
- Field wajib sebelum terbit: judul, jenis/kategori, isi pokok, sumber, tanggal tinjau, periode berlaku bila relevan, dan penanggung jawab peninjauan.
- Teks kaya dibatasi dan disanitasi; tautan hanya skema aman. Hindari unggah berkas bebas pada V1.
- Simpan versi konten dan riwayat perubahan. Pengarsipan tidak menghapus salinan judul opsi pada rencana pribadi; tampilkan bahwa rujukan telah diarsipkan.
- Konten sensitif waktu memiliki tanggal kedaluwarsa/tinjau ulang. Versi luring menampilkan versi dan tanggal terakhir diunduh.
- Pada prototipe P9, penerbitan dapat melalui konten awal yang ditinjau manual; panel kurasi lengkap selesai di tahap II.

**Kriteria penerimaan:** konten belum lengkap tidak bisa terbit; draf tidak muncul publik; pembaruan menaikkan versi paket; pengguna diberi tahu bila paket luring perlu diperbarui.

### FR-11 - Ekspor dan penghapusan data [P/D, P0]

- Ekspor data milik siswa dalam format terstruktur yang terdokumentasi, disertai ringkasan rencana yang siap dicetak. Siswa memilih bagian yang disertakan; jurnal memiliki pilihan terpisah yang tidak aktif secara bawaan.
- File ekspor tidak disimpan pada URL publik. Gunakan respons unduhan terautentikasi atau tautan singkat berumur terbatas yang terikat pemilik.
- Hapus data per fitur atau hapus seluruh akun/data dengan konfirmasi dan autentikasi ulang. Sebelum menghapus seluruh akun, tawarkan ekspor tanpa memaksakannya.
- Penghapusan data suatu fitur juga mencabut dan menghapus salinannya dalam snapshot terkait; jangan mempertahankan isi terhapus melalui lampiran konsultasi. Permintaan dapat tetap mempunyai status operasional tanpa lampiran tersebut sampai batas retensinya.
- Begitu penghapusan seluruh akun dikonfirmasi, blokir login dan akses snapshot, cabut sesi, lalu hapus data aktif melalui pekerjaan terjadwal. Target penyelesaian data aktif <= 24 jam.
- Hapus refleksi, matriks, rencana, jurnal, snapshot, dan data pribadi permintaan konsultasi. Jangan mempertahankan salinan pribadi di log aplikasi.
- Untuk penghapusan seluruh akun, cakup pula profil, kredensial/pemulihan, status kemajuan, serta metadata persetujuan yang terhubung ke akun. Jika sekolah memerlukan bukti persetujuan terpisah, kebijakan dan tanggung jawab arsip sekolah harus dijelaskan sebelum pengumpulan; aplikasi tidak membuat pengecualian retensi sendiri.
- Catatan teknis penghapusan minimum dapat berupa ID pekerjaan, waktu, dan hasil tanpa isi atau identitas langsung. Kebijakan retensinya harus ditentukan sebelum penerapan.
- [D/V] Cadangan memiliki masa pemulihan maksimum 30 hari; penghapusan harus diterapkan kembali sebelum backup yang dipulihkan dapat melayani pengguna.

**Kriteria penerimaan:** ekspor memuat tepat bagian terpilih; pengguna lain ditolak; akun/snapshot yang dihapus segera kehilangan akses; pekerjaan penghapusan dan kegagalannya dapat dipantau; prosedur backup tidak menghidupkan kembali data yang sudah dihapus.

### FR-12 - PWA, akses luring, dan versi cetak [P/D, P0]

- Website dapat digunakan dari browser tanpa pemasangan. Manifest dan service worker disediakan untuk pemasangan pada browser yang mendukung; instruksi pemasangan menyesuaikan kemampuan perangkat.
- Luring V1 mencakup shell publik, kartu jalur/profesi yang dipilih, materi bantuan umum, dan PDF kosong yang telah diunduh.
- Tidak menjanjikan login, sinkronisasi, formulir pribadi, jurnal, atau pengiriman konsultasi saat luring. Perubahan pribadi tidak masuk antrean penyimpanan latar belakang.
- Semua respons autentikasi/data pribadi menggunakan kebijakan tanpa cache dan dikecualikan dari service worker. Jangan menyimpan token akses atau isi refleksi di penyimpanan web yang persisten tanpa kebutuhan.
- Logout membersihkan state akun di memori dan cache privat bila pernah terbentuk; paket publik dapat tetap disimpan karena tidak mengandung data siswa.
- Sediakan indikator daring/luring dan daftar konten yang benar-benar tersedia, bukan hanya tombol unduh yang belum selesai.
- Paket PDF kosong memuat refleksi enam langkah, panduan informasi jalur, matriks, rencana semester, dan lembar diskusi. Pengisian kertas tidak otomatis dikirim ke website.

**Kriteria penerimaan:** setelah unduhan selesai, kartu dapat dibaca dalam mode pesawat; data pribadi tidak ditemukan di cache service worker; membuka situs pertama kali tanpa internet menjelaskan keterbatasan bila shell belum tersedia; PDF dapat dibaca dan dicetak A4 tanpa terpotong.

### FR-13 - Bantuan dan batas layanan [P/D, P0]

- Tautan **"Butuh bicara sekarang?"** tersedia pada semua layar, termasuk jurnal, login, dan halaman kesalahan.
- Halaman tujuan berisi cara menghubungi guru BK, jam layanan, serta sumber bantuan resmi yang diverifikasi untuk konteks sekolah.
- Jangan menampilkan kontak, nomor bantuan, atau jam layanan rekaan. Konfigurasi kontak aktual harus diperiksa sebelum penggunaan nyata.
- Tampilkan bahwa permintaan konsultasi tidak dipantau 24 jam dan bukan saluran untuk kondisi yang memerlukan respons segera.
- Pesan ini tidak bergantung pada pemindaian isi jurnal maupun input siswa.

**Kriteria penerimaan:** bantuan dapat dijangkau dari setiap templat halaman; kontak mempunyai penanggung jawab dan tanggal verifikasi; tautan eksternal memerlukan internet dan tidak diberi label tersedia luring.

## 10. Rancangan konten

### 10.1 Inventaris awal [P/D]

Target proposal adalah **enam kartu jalur dan 18 kartu profesi**. Pengelompokan enam kartu berikut adalah usulan editorial agar seluruh subjalur tetap terwakili.

| Kartu induk                         | Isi minimum                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| 1. Kuliah melalui seleksi nasional  | Penjelasan SNBP dan SNBT secara terpisah; persiapan; sumber resmi tiap jalur              |
| 2. Kuliah melalui seleksi mandiri   | Variasi seleksi kampus PTN/PTS, kebutuhan memeriksa ketentuan masing-masing               |
| 3. Kuliah di PTKIN                  | Gambaran pilihan masuk dan rujukan resmi yang diperiksa untuk tahun berjalan              |
| 4. Kerja dan penguatan keterampilan | Magang, kursus, sertifikasi, BLK/pelatihan, persiapan dokumen dan pemeriksaan sumber      |
| 5. Kuliah sambil kerja              | Model belajar fleksibel, pembagian waktu, biaya, dukungan, dan risiko beban berlebih      |
| 6. Usaha                            | Eksplorasi masalah/pelanggan, keterampilan, uji kecil, biaya, dan dukungan yang realistis |

Beasiswa/dukungan biaya merupakan bagian lintas kartu kuliah, bukan jalur ketujuh. Detail seleksi, penyedia pelatihan, persyaratan usia, tanggal, dan biaya harus dikurasi dari sumber resmi sebelum diterbitkan; PRD ini tidak menetapkan ketentuan tahun berjalan.

Kartu profesi berjumlah tiga untuk setiap kelompok RIASEC: Realistic, Investigative, Artistic, Social, Enterprising, Conventional. Contoh profesi final dipilih bersama ahli BK dan dibuat beragam dalam jalur pendidikan, kondisi kerja, dan latar tokoh; kategori minat adalah alat eksplorasi, bukan pembatas profesi siswa.

Materi tambahan V1: minimal satu Cerita Langkah alumni yang berizin, satu lembar **Ngobrol dengan Orang Tua**, pesan pendamping singkat yang ditinjau guru, dan panduan penggunaan untuk siswa/guru. Jumlah minimum materi tambahan tersebut adalah keputusan PRD.

### 10.2 Struktur kartu

**Kartu jalur:** judul, kategori, penjelasan singkat, situasi yang dapat mempertimbangkan jalur, persyaratan umum, perkiraan durasi, gambaran biaya/dukungan, persiapan kelas XI, persiapan kelas XII, hal yang perlu diperiksa, sumber resmi, periode berlaku, tanggal tinjau, peninjau, versi.

**Kartu profesi:** judul, gambaran tugas, kegiatan/minat terkait, bekal yang dibutuhkan, jalur pendidikan/pelatihan, contoh lingkungan/tempat kerja, keragaman kemungkinan jalur, sumber dan metadata tinjau.

**Cerita Langkah:** nama samaran/identitas publik yang diizinkan, latar singkat, pilihan dan hambatan, langkah yang dilakukan, pelajaran, bukti izin publikasi yang dikelola sekolah, dan tanggal tinjau. Hilangkan rincian yang dapat mengungkap siswa lain.

### 10.3 Gaya dan tata kelola [P/D]

- Bahasa Indonesia yang ramah remaja, tidak menghakimi, netral gender, serta tidak menjanjikan pendapatan/keberhasilan.
- Nilai ikhtiar dan tawakal dapat hadir sebagai pesan pendamping sesuai proposal. [D] Penempatan bersifat tidak memaksa dan tidak memengaruhi akses fitur; kenyamanan siswa beragam latar perlu diuji.
- Sumber utama diarahkan ke lembaga/kampus/penyelenggara resmi. Website merangkum dan menautkan, bukan menggantikan portal sumber.
- [D] Guru meninjau informasi sensitif waktu sebelum periode seleksi dan saat sumber mengumumkan perubahan; konten umum ditinjau sekurang-kurangnya tiap semester.
- Konten yang belum diverifikasi diberi status draf; jangan mengisi dengan tanggal atau persyaratan contoh seolah fakta.
- Foto/ilustrasi opsional, ringan, memiliki hak penggunaan yang jelas. Video tidak wajib dan harus memiliki ringkasan teks bila disediakan.

## 11. Rancangan UX/UI dan aksesibilitas [P/D]

### 11.1 Arah tampilan

Gunakan identitas visual yang hangat dan tenang, ruang kosong yang memadai, kartu ringkas, ikon dengan teks, dan ilustrasi secukupnya. Warna utama/aksen belum ditetapkan proposal; tentukan melalui token desain dan verifikasi kontras. Hindari visual yang terasa seperti ujian atau sistem pemeringkatan.

| Layar        | Susunan utama                                                  | Tindakan utama            |
| ------------ | -------------------------------------------------------------- | ------------------------- |
| Beranda      | Sapaan, empat kartu langkah, rencana terdekat, akses jurnal/BK | Lanjutkan langkah         |
| Refleksi     | Judul, posisi 1/6, satu pertanyaan, pilihan, bantuan           | Simpan dan lanjut         |
| Peta Jalur   | Pencarian, kategori, kartu ringkas, unduhan                    | Lihat jalur               |
| Detail jalur | Ringkasan, persiapan, biaya, sumber, status tinjau             | Tambah ke pilihan / unduh |
| Timbang      | Opsi, petunjuk skor, kriteria, alasan, peringatan batas        | Simpan dan susun rencana  |
| Rencana      | Tujuan, cadangan, semester, checklist                          | Tambah langkah            |
| Sapa BK      | Topik, ketersediaan, pilihan berbagi, pratinjau                | Kirim permintaan          |
| Panel guru   | Ringkasan antrean, filter, permintaan; agregat terpisah        | Tinjau dan jadwalkan      |

### 11.2 Persyaratan terukur

- [P] Ukuran teks isi minimal setara 16 px; kontras teks biasa minimal 4,5:1.
- [D] Target sentuh utama minimal 44 x 44 CSS px; jarak antartombol mencegah salah tekan.
- Pembesaran teks sampai 200% tetap dapat digunakan tanpa kehilangan tindakan utama.
- Seluruh fungsi inti dapat dipakai dengan keyboard; fokus terlihat, urutan fokus logis, dan modal mengembalikan fokus saat ditutup.
- Setiap input mempunyai label, pesan kesalahan dekat field, dan penjelasan cara memperbaiki. Warna bukan satu-satunya tanda status.
- Heading semantik, teks alternatif gambar bermakna, nama aksesibel tombol, dan pengumuman status simpan yang tidak mengganggu pembaca layar.
- Matriks perbandingan memiliki konteks baris/kolom yang jelas; pada ponsel tersedia bentuk bertumpuk yang tetap dapat diakses.
- Animasi ringan dan menghormati preferensi pengurangan gerak; tidak ada autoplay video.
- Verifikasi minimal pada lebar 360 px dan 390 px serta desktop 1280 px. Horizontal scroll hanya bila benar-benar diperlukan untuk tabel, tidak untuk keseluruhan halaman.
- Tampilan kosong, memuat, gagal, izin ditolak, sesi berakhir, konten diarsipkan, dan luring memiliki pesan/tindakan pemulihan.

Proposal mengacu pada WCAG 2.1. Pemeriksaan di atas adalah target penerimaan proyek, bukan klaim sertifikasi kepatuhan menyeluruh.

## 12. Aturan bisnis dan validasi [D]

| Objek         | Aturan                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Profil        | Nama panggilan 2-40 karakter, kelas XI/XII, semester 1/2, sekolah dari daftar pendaftaran yang dibuka server; angkatan ditetapkan petugas; tidak ada NISN, alamat, telepon, atau email siswa                           |
| Pendaftaran | Server hanya membuat siswa pending; approve/reject transaksional oleh superadmin; penolakan beralasan; wali terpisah |
| Akun siswa    | ID internal acak; nama panggilan bukan kredensial unik; kode pemulihan tidak disimpan dalam bentuk asli                                                            |
| Refleksi      | Narasi opsional maksimal 1.000 karakter per isian; teks biasa; tidak memaksa pengungkapan kondisi sensitif                                                         |
| Matriks       | Minimal 2 dan maksimal 3 opsi; judul opsi maksimal 120 karakter; nilai bilangan bulat 1-5 atau belum diketahui; alasan maksimal 1.000 karakter                     |
| Rencana       | Judul tujuan maksimal 300 karakter; judul langkah maksimal 200 karakter; catatan langkah maksimal 1.000 karakter; semester harus salah satu dari empat nilai resmi |
| Jurnal        | Maksimal tiga jawaban per entri, 2.000 karakter per jawaban; waktu disimpan bersama zona waktu tampilan                                                            |
| Konsultasi    | Topik wajib, satu atau beberapa rentang ketersediaan wajib, catatan maksimal 500 karakter; guru penerima dari sekolah siswa                                        |
| Penjadwalan   | Simpan waktu secara konsisten di server dan tampilkan menurut zona sekolah; konfigurasi awal Asia/Jakarta untuk konteks sekolah Lampung, perlu konfirmasi          |
| Konten        | Slug unik, sumber aman, tanggal tinjau wajib; konten terbit tidak boleh menggunakan placeholder sebagai fakta                                                      |
| Teks pengguna | Escape/sanitasi pada output; validasi server selalu dijalankan meskipun validasi browser sudah ada                                                                 |
| Konkurensi    | Versi record diperiksa saat update; bila dua tab mengubah data, minta pengguna memuat perubahan sebelum menimpa                                                    |

Batas panjang adalah usulan untuk menjaga fokus, kinerja, dan keamanan; revisi berdasarkan uji pengguna tanpa mengubah prinsip minimisasi. Alur undangan lama digantikan registrasi mandiri pending dan approval superadmin pada pembaruan 22 November 2026.

## 13. Model data konseptual [D]

Model berikut adalah rancangan logis, belum skema migrasi final. Semua objek privat memiliki pemilik, waktu buat/ubah, dan relasi sekolah bila diperlukan. Hindari menyalin isi pribadi ke banyak tabel.

| Entitas               | Atribut utama                                                                                                | Relasi dan batas akses                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `School`              | id, nama, zona_waktu, jam_layanan, kontak_bantuan_terverifikasi                                              | Konfigurasi publik terbatas; administrasi berwenang                                |
| `Cohort`              | id, school_id, label, graduation_at, deletion_at                                                             | Acuan retensi angkatan; tidak memuat daftar identitas publik                       |
| `Account`             | id, role, school_id, status, credential_hash, recovery_hash                                                  | Kredensial hanya server; siswa/guru dipisahkan peran                               |
| `StudentProfile`      | account_id, nickname, grade, semester, cohort_id, age_band                                                   | Pemilik; sebagian field operasional dapat muncul di permintaan yang dikirim        |
| `RegistrationReview` | student_id, reviewer_id, decision, reason, created_at | Satu keputusan akhir per pendaftaran, audit transaksional, akses administratif minimum |
| `ConsentRecord`       | account_id, notice_version, student_agreed_at, guardian_status, verified_at, verifier_id, external_reference | Bukti proses minimum; dokumen lengkap di sekolah, akses administratif terbatas     |
| `SelfReflection`      | student_id, answers, reviewed_at, last_step, version                                                         | Hanya pemilik; ringkasan terpilih dapat disalin ke snapshot                        |
| `ContentItem`         | id, kind, slug, category, body, status, version, reviewer, reviewed_at, valid_period                         | Publik hanya versi terbit; jenis jalur/profesi/cerita/lembar kerja                 |
| `ContentSource`       | content_id, title, url, checked_at                                                                           | Metadata sumber publik                                                             |
| `Comparison`          | id, student_id, title, status, reviewed_at, version                                                          | Hanya pemilik                                                                      |
| `ComparisonOption`    | comparison_id, label, optional_content_id, criteria_values, reasons                                          | Dua/tiga opsi; tidak berelasi ke skor psikologis                                   |
| `CareerPlan`          | id, student_id, primary_goal, backup_goal, reviewed_at, version                                              | Hanya pemilik                                                                      |
| `PlanStep`            | plan_id, semester, title, note, due_date, status, sort_order                                                 | Ikut kepemilikan plan                                                              |
| `JournalEntry`        | id, student_id, week/date, answers, status, version                                                          | Hanya pemilik; tidak ada relasi ke snapshot berbagi                                |
| `ConsultationRequest` | id, student_id, teacher_id/school_id, topic, availability, note, status, confirmed_time, idempotency_key     | Pemilik dan guru yang ditugaskan; tidak seluruh guru lintas sekolah                |
| `SharedSnapshot`      | request_id, section_type, content_copy, source_version, consent_at, expires_at, revoked_at                   | Jenis section terbatas pada reflection/comparison/plan; cek akses pada setiap baca |
| `ProgressState`       | student_id, reviewed_stage_flags, updated_at                                                                 | Metadata untuk beranda/agregasi, tanpa teks jawaban                                |
| `AuditEvent`          | event_type, actor_reference, object_reference, timestamp, result                                             | Tanpa isi refleksi/jurnal; retensi dan akses dibatasi                              |
| `DeletionJob`         | id, target_reference, requested_at, status, retry_count, completed_at                                        | Untuk menjamin penghapusan, bukan arsip isi siswa                                  |

Relasi utama: sekolah mempunyai angkatan dan akun; siswa mempunyai refleksi, matriks, rencana, jurnal, dan permintaan; permintaan dapat mempunyai snapshot yang dipilih. Penghapusan siswa menghapus seluruh objek privat terkait melalui cascade atau pekerjaan terkontrol. Konten publik tidak ikut terhapus.

Agregat dibentuk dari status aktivitas dan topik, bukan isi narasi. Bila agregat disimpan sebagai materialisasi, terapkan aturan kelompok kecil dan pembaruan setelah penghapusan; jangan mempertahankan deret hitungan yang dapat dipakai membandingkan keluarnya satu siswa.

## 14. Arsitektur teknis dan kontrak layanan [D]

### 14.1 Bentuk sistem

Gunakan aplikasi web modular dalam satu proyek agar realistis dikerjakan individu. Pisahkan modul konten publik, identitas/persetujuan, aktivitas pribadi, konsultasi/berbagi, kurasi/agregat, serta pekerjaan retensi. Backend menjadi sumber kebenaran untuk data pribadi.

| Komponen                  | Tanggung jawab                                                                    |
| ------------------------- | --------------------------------------------------------------------------------- |
| Antarmuka web responsif   | Halaman siswa/guru, validasi input, status simpan, navigasi dan aksesibilitas     |
| Lapisan PWA               | Manifest, cache konten publik berversi, daftar unduhan, pemberitahuan pembaruan   |
| Backend/API               | Autentikasi, otorisasi, validasi, snapshot, ekspor/hapus, agregasi                |
| Basis data relasional     | Relasi pemilik/sekolah, transaksi, integritas data, versi record                  |
| Penyimpanan berkas publik | PDF kosong dan media konten yang telah ditinjau; tanpa ekspor pribadi permanen    |
| Pekerjaan terjadwal       | Retensi kelulusan, snapshot kedaluwarsa, penghapusan, penanda konten perlu tinjau |
| Pemantauan                | Kegagalan simpan, error API, penghapusan gagal, ketersediaan; tanpa isi pribadi   |

PRD tidak mengunci vendor atau versi framework karena proposal mengizinkan no-code/kode sederhana. Pemilihan implementasi wajib memenuhi otorisasi server, transaksi, penghapusan, dan pengecualian cache privat. Jika platform tidak mampu menjamin hal itu, batasi penggunaannya pada demonstrasi data fiktif.

Referensi pendekatan implementasi adalah satu basis kode frontend/backend dengan dukungan tipe, penyimpanan relasional, sesi berbasis cookie aman, serta service worker khusus konten publik. Rincian framework, penyedia hosting, biaya, lokasi data, dan kapasitas paket diputuskan setelah evaluasi teknis; tidak ada asumsi bahwa paket gratis selalu tersedia atau memadai.

### 14.2 Kontrak API konseptual

| Kelompok               | Operasi utama                                                               | Batas                                                          |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Publik                 | Baca katalog/detail/kumpulan konten berversi dan konfigurasi bantuan publik | Tidak mengeluarkan data akun                                   |
| Identitas              | Registrasi siswa pending, login tiga role, logout, pemulihan dan status keputusan/persetujuan              | Rate limit dan kredensial aman; identitas dari sesi            |
| Refleksi               | Baca/update draf sendiri, konfirmasi ringkasan                              | Tidak menerima student_id pihak lain sebagai sumber kewenangan |
| Matriks/rencana/jurnal | CRUD milik sendiri dan pemeriksaan versi                                    | Jurnal tidak mempunyai operasi baca untuk guru                 |
| Konsultasi             | Buat idempoten, baca status, batalkan, pilih/ganti/cabut snapshot           | Validasi penerima satu sekolah dan daftar field berbagi        |
| Guru                   | Antrean berwenang, baca snapshot yang masih berlaku, jadwalkan/tutup        | Tidak mengakses objek pribadi asal                             |
| Konten                 | Draf, tinjau, terbit, arsip, riwayat                                        | Peran kurator; sanitasi dan validasi metadata                  |
| Agregat                | Ringkasan periode tetap                                                     | Respons sudah disaring batas privasi di server                 |
| Hak data               | Ekspor terautentikasi, hapus objek/akun, status pekerjaan                   | Autentikasi ulang untuk tindakan sensitif                      |

Gunakan kontrak error konsisten: validasi gagal, belum masuk, tidak berwenang/tidak tersedia, konflik versi, terlalu banyak permintaan, gangguan sementara. Pesan tidak boleh membocorkan keberadaan objek pribadi milik orang lain. Semua daftar mempunyai pagination/batas hasil.

### 14.3 Konsistensi dan pemulihan

- Penyimpanan refleksi/rencana memakai transaksi sesuai kebutuhan; UI menunggu konfirmasi server sebelum mengubah status menjadi tersimpan.
- Snapshot dan permintaan dibuat dalam satu transaksi agar permintaan tidak terkirim dengan lampiran setengah jadi.
- Versi record mencegah perubahan dari tab lama menimpa data baru tanpa pemberitahuan.
- Kegagalan penghapusan diulang dengan batas dan alarm operasional; akses tetap diblokir selama proses.
- Saat pembaruan PWA tersedia, tawarkan muat ulang setelah formulir sudah tersimpan; jangan mengganti versi halaman di tengah input secara paksa.

## 15. Privasi, keamanan, dan siklus hidup data [P/D/V]

### 15.1 Minimisasi dan persetujuan

Data siswa dibatasi pada nama panggilan, kelas/semester, afiliasi sekolah/angkatan, kategori usia untuk proses izin, jawaban yang diberikan, rencana, dan informasi konsultasi minimum. Metadata operasional seperti ID internal, versi persetujuan, dan waktu diperlukan untuk keamanan serta akuntabilitas, bukan untuk profil komersial.

Tidak meminta NISN, alamat rumah, nomor telepon, email siswa, tanggal lahir lengkap, nilai rapor, identitas wali, atau kondisi ekonomi rinci. Hindari pelacak iklan, perekaman sesi, dan layanan analitik yang menerima isi formulir.

Pemberitahuan data harus menjelaskan tujuan, penerima, retensi, cara mencabut berbagi, cara ekspor/hapus, batas kerahasiaan teknis, dan kontak penanggung jawab. Persetujuan penggunaan akun dipisahkan dari izin berbagi ringkasan konsultasi. Penolakan persetujuan tetap memberi akses mode tamu.

### 15.2 Siklus hidup

| Tahap                    | Perlakuan                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| Sebelum aktif            | Tidak mengumpulkan refleksi; konten publik tetap terbuka                                                  |
| Selama digunakan         | Data milik siswa disimpan daring, akses minimum, audit tindakan sensitif                                  |
| Saat berbagi             | Hanya snapshot terpilih, penerima dan masa berlaku jelas                                                  |
| Saat dicabut             | Akses snapshot langsung ditolak; salinan aktif dihapus terkontrol                                         |
| Setelah konsultasi       | Snapshot berakhir sesuai batas; permintaan operasional dihapus menurut retensi yang ditetapkan sekolah    |
| Setelah lulus            | Proses otomatis pada deletion_at angkatan, akses diblokir dan data aktif dihapus <= 24 jam                |
| Hapus sukarela           | Blokir akses segera, hapus aktif <= 24 jam, cadangan menua keluar <= 30 hari sesuai kebijakan tervalidasi |
| Setelah pemulihan backup | Terapkan daftar penghapusan kembali sebelum sistem melayani pengguna                                      |

Tanggal kelulusan harus diisi dan ditampilkan kepada siswa; jangan mengasumsikan semua siswa lulus pada tanggal yang sama. Usulan penyimpanan data pribadi permintaan berakhir 30 hari setelah penutupan, dengan kelulusan/hapus akun sebagai batas lebih awal. Pengecualian retensi hanya dapat ditetapkan sekolah dengan dasar dan pemberitahuan yang jelas, bukan diam-diam oleh implementasi.

### 15.3 Kontrol minimum

- HTTPS untuk seluruh akses, enkripsi penyimpanan/cadangan dari infrastruktur yang dipilih, dan secret hanya di server.
- Hash kredensial dengan algoritme khusus kata sandi yang terawat; kode pemulihan sekali pakai disimpan sebagai hash.
- Cookie sesi `HttpOnly`, `Secure`, dan kebijakan `SameSite` yang sesuai; proteksi CSRF untuk mutasi berbasis cookie; rotasi/cabut sesi saat pemulihan akun.
- Siswa menggunakan username yang dipilih dan kata sandi; guru menggunakan akun sekolah yang dibuat superadmin dengan autentikasi tambahan bila infrastrukturnya mendukung. Jangan memakai kode pemulihan sebagai kata sandi permanen.
- Pemulihan tanpa email melalui kode pemulihan siswa; jika hilang, verifikasi langsung oleh petugas sekolah sebelum reset. Reset tidak membuka isi refleksi kepada petugas dan harus membatalkan sesi lama.
- Batas percobaan login, aktivasi, pemulihan, dan kirim konsultasi; respons tidak mengungkap ada/tidaknya akun.
- Otorisasi tingkat objek dan sekolah untuk semua query; pengujian akses lintas akun dan lintas sekolah wajib.
- Sanitasi konten, query berparameter, kebijakan keamanan konten, dan pembatasan tautan untuk mencegah injeksi.
- Respons privat `no-store`; tidak memasukkan rahasia pada URL, analitik, log, atau cache publik.
- Halaman privat tidak masuk sitemap dan menggunakan arahan tidak diindeks. Arahan mesin pencari bukan pengganti autentikasi; hanya konten terbit yang boleh muncul dalam metadata publik, pratinjau tautan, atau indeks pencarian.
- Idle timeout, logout, serta autentikasi ulang pada ekspor/hapus disesuaikan perangkat bersama. Usulan awal idle timeout 30 menit; uji agar tidak menghilangkan input tanpa peringatan.
- Audit login, verifikasi izin, perubahan peran, akses snapshot, pencabutan, ekspor, dan penghapusan. Jangan merekam password, token asli, jawaban, atau isi jurnal.
- Backup terenkripsi, prosedur restore terdokumentasi, serta penanggung jawab insiden dan penghapusan ditetapkan sebelum penerapan.

### 15.4 Keterbatasan yang harus dijelaskan

Nama panggilan/kelas dapat tetap mengidentifikasi siswa dalam konteks sekolah. Agregat tanpa nama belum tentu anonim tanpa pengamanan kelompok kecil. File yang diunduh dan informasi yang sudah dilihat di luar website tidak dapat dihapus dari perangkat/pikiran penerima oleh sistem. Pernyataan privasi harus mencerminkan kemampuan yang benar-benar dibangun.

## 16. Kebutuhan nonfungsional [D, kecuali ditandai P]

Target berikut adalah anggaran teknis awal untuk uji, bukan hasil benchmark saat ini.

| Area              | Target penerimaan                                                                                                                               |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Kinerja tampilan  | Konten utama halaman publik terlihat <= 3 detik pada profil uji ponsel dengan jaringan seluler yang ditetapkan dan dicatat tim                  |
| Anggaran transfer | Shell publik awal <= 1 MB transfer terkompresi di luar unduhan PDF opsional; hindari video/font besar sebagai ketergantungan wajib              |
| Simpan data       | p95 konfirmasi simpan <= 2 detik pada jaringan uji stabil, di luar gangguan jaringan; indikator simpan muncul segera                            |
| Kapasitas pilot   | Satu sekolah, sekitar 150 akun siswa dan 1-3 akun guru; uji teknis awal 30 sesi aktif bersamaan                                                 |
| Ketersediaan      | Target 99% per bulan saat periode pilot terjadwal, di luar pemeliharaan yang diumumkan; evaluasi kemampuan hosting sebelum menyepakati SLA      |
| Luring            | [P] Konten Peta Jalur yang selesai diunduh terbaca tanpa jaringan; data privat dan konsultasi memerlukan daring                                 |
| Kompatibilitas    | Penggunaan browser seluler Android/iOS dan desktop; matriks versi browser ditetapkan pada awal implementasi, pemasangan PWA diuji bila didukung |
| Aksesibilitas     | [P/D] Teks minimal 16 px, kontras 4,5:1, pembesaran, label, keyboard dan pembaca layar sesuai bagian 11                                         |
| Integritas        | Tidak ada penyimpanan semu, konsultasi ganda akibat retry, atau update diam-diam yang menimpa versi lain                                        |
| Keamanan          | Tidak ada akses data lintas pemilik/peran/sekolah; seluruh temuan kebocoran memblokir rilis                                                     |
| Pemulihan         | Usulan backup harian dengan RPO <= 24 jam dan RTO <= 1 hari kerja; verifikasi restore sebelum data nyata, termasuk penerapan ulang penghapusan  |
| Pemeliharaan      | Modul terpisah, konfigurasi lingkungan, migrasi data terlacak, dokumentasi dan uji untuk aturan kritis                                          |

Jangan mengorbankan privasi untuk mengejar target kecepatan. Bila target belum tercapai, dokumentasikan hasil dan mitigasi sebelum penerapan, terutama pada perangkat siswa yang sebenarnya.

## 17. Pengukuran keberhasilan dan analitik

### 17.1 Indikator proposal [P]

| Indikator              | Ambang/target                                          | Cara mengukur                                                     |
| ---------------------- | ------------------------------------------------------ | ----------------------------------------------------------------- |
| Uji fungsional minimum | 100% fungsi minimum lulus sebelum uji pengguna         | Checklist penulis dan satu teman sejawat, data fiktif             |
| Ketuntasan tugas       | >= 80% tugas selesai tanpa bantuan                     | Observasi tugas; laporkan juga hasil per tugas dan jumlah peserta |
| Refleksi               | <= 10 menit tanpa bantuan                              | Durasi T2                                                         |
| Penemuan informasi     | <= 2 menit per jalur                                   | Durasi T3 untuk SNBT dan satu jalur kerja                         |
| Rencana                | Minimal tiga langkah dan bertahan setelah dibuka ulang | T5 dan pemeriksaan simpan/muat                                    |
| Kegunaan               | Rata-rata SUS >= 68                                    | Angket adaptasi pada Lampiran 4 proposal                          |
| Keterpahaman           | >= 75% setiap butir                                    | Enam butir skala 1-4, bukan hanya rata-rata keseluruhan           |
| Validasi ahli          | >= 75%                                                 | Penilaian ahli materi dan ahli media, dilaporkan terpisah         |
| Keamanan/privasi       | Semua temuan diperbaiki sebelum penggunaan lanjut      | Uji akses dan peninjauan temuan, berapa pun jumlah pelapor        |

SUS per peserta: jumlahkan `(jawaban - 1)` pada butir ganjil dan `(5 - jawaban)` pada butir genap, lalu kalikan 2,5. Rata-rata dihitung dari skor peserta lengkap. Skor SUS bukan persentase efektivitas bimbingan.

Persentase validasi/keterpahaman dihitung sebagai skor diperoleh dibagi skor maksimum, dikali 100%. Laporkan jumlah responden, data yang tidak lengkap, dan cara penanganannya; jangan mengisi jawaban kosong secara otomatis.

### 17.2 Pengukuran produk tambahan [D]

Pengukuran selama pilot mengutamakan observasi langsung dan event teknis minimum. Jika diperlukan, gunakan event seperti `reflection_reviewed`, `comparison_reviewed`, `plan_reviewed`, `consultation_submitted`, `public_pack_downloaded`, dan `deletion_completed` tanpa membawa teks jawaban/jurnal.

Event privat hanya diproses untuk tujuan yang dijelaskan dan mengikuti retensi akun. Hasil laporan hanya berupa agregat yang lolos batas privasi. Jangan mengukur keberhasilan berdasarkan banyaknya jurnal atau mendorong siswa mengungkap data lebih banyak.

## 18. Rencana pengujian

### 18.1 Uji fungsional dan keamanan

| ID uji | Skenario                                                  | Hasil yang wajib                                                                  |
| ------ | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| QA-01  | Jelajah tamu, menolak persetujuan                         | Peta Jalur tetap terbuka; tidak ada profil/jawaban pribadi tersimpan              |
| QA-02  | Siswa di bawah 18 dengan izin wali belum diverifikasi     | Akun belum dapat menyimpan data pribadi                                           |
| QA-03  | Isi enam langkah, muat ulang, lanjutkan                   | Data sama dengan input; status simpan benar                                       |
| QA-04  | Simpan matriks dua/tiga opsi, termasuk belum diketahui    | Nilai utuh, tidak ada rekomendasi otomatis                                        |
| QA-05  | Buat tiga langkah, tandai selesai, login ulang            | Rencana dan status konsisten                                                      |
| QA-06  | Kirim konsultasi dengan ringkasan rencana saja            | Guru hanya membaca rencana terpilih dan metadata operasional yang dipratinjau     |
| QA-07  | Klik kirim dua kali, retry setelah respons terlambat      | Hanya satu permintaan tercatat                                                    |
| QA-08  | Coba akses jurnal/refleksi akun lain sebagai siswa/guru   | Ditolak server tanpa membocorkan isi/keberadaan                                   |
| QA-09  | Guru sekolah A mencoba permintaan sekolah B               | Ditolak                                                                           |
| QA-10  | Cabut/ganti snapshot saat guru sudah login                | Akses berikutnya ke versi lama ditolak; jurnal tidak pernah masuk snapshot        |
| QA-11  | Agregat kelompok 5-8 siswa dan sel kecil/pelengkap        | Tidak dapat mengidentifikasi atau menghitung balik kelompok kecil                 |
| QA-12  | Unduh konten publik, gunakan mode pesawat                 | Konten tersedia; formulir kirim menjelaskan kebutuhan daring                      |
| QA-13  | Periksa service worker/cache dan logout perangkat bersama | Tidak ada token, jurnal, atau payload privat persisten di cache                   |
| QA-14  | Ekspor pilihan tanpa jurnal; hapus akun                   | Ekspor sesuai pilihan, akses langsung diblokir, data aktif terhapus sesuai target |
| QA-15  | Simulasikan graduation_at/deletion_at dan pekerjaan gagal | Retensi berjalan; kegagalan diulang/dilaporkan tanpa membuka kembali akses        |
| QA-16  | Pulihkan backup yang mengandung akun terhapus             | Penghapusan diterapkan kembali sebelum akses pengguna dibuka                      |
| QA-17  | Draf/arsip konten, tautan tidak aman, periode kedaluwarsa | Draf tidak publik, input berbahaya ditolak, penanda kedaluwarsa benar             |
| QA-18  | Dua tab mengedit record yang sama                         | Konflik diberitahukan, tidak menimpa tanpa persetujuan                            |
| QA-19  | Layar kecil, keyboard, pembaca layar, teks 200%, PDF A4   | Tugas inti dan hasil cetak dapat digunakan                                        |
| QA-20  | Sesi habis atau jaringan putus saat menyimpan             | Tidak mengklaim tersimpan; tersedia petunjuk pemulihan tanpa mengirim diam-diam   |

### 18.2 Validasi ahli [P]

Satu ahli materi BK dan satu ahli media menilai skala 1-4 sesuai lampiran proposal. Materi mencakup tujuan layanan, refleksi, akurasi sumber, bahasa, etika, dan batas otomatisasi. Media mencakup konsistensi, navigasi, keterbacaan, akses luring, dan privasi. Catat komentar serta revisi, bukan hanya angka kelayakan.

### 18.3 Uji pengguna terbatas [P/D]

Peserta: **5-8 siswa XI/XII dan satu guru BK**, sukarela, dengan izin yang sesuai. Jika izin sekolah belum ada, gunakan mahasiswa yang berperan sebagai siswa dan nyatakan sebagai simulasi; hasilnya tidak mewakili pengujian siswa nyata.

| Tugas proposal | Tindakan                                 | Bukti                                                                                           |
| -------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| T1             | Mulai, baca pemberitahuan, masuk         | Siswa dapat menjelaskan siapa yang melihat datanya                                              |
| T2             | Selesaikan Kenali Diriku                 | Tanpa bantuan, <= 10 menit                                                                      |
| T3             | Temukan syarat SNBT dan satu jalur kerja | <= 2 menit per jalur                                                                            |
| T4             | Bandingkan dua opsi dan simpan           | Matriks tersimpan, siswa menjelaskan alasannya                                                  |
| T5             | Buat minimal tiga langkah semester ini   | Data muncul kembali setelah dibuka ulang                                                        |
| T6             | Kirim konsultasi dengan rencana saja     | Guru tidak melihat bagian lain                                                                  |
| T7 guru        | Tinjau antrean dan agregat               | Antrean akurat; kelompok kecil disembunyikan; agregat lengkap dicoba lewat data fiktif terpisah |

Catat ketuntasan, bantuan, waktu, masalah pemahaman, dan umpan balik tanpa menyalin isi jurnal/refleksi ke laporan. Semua temuan privasi diperbaiki; tugas yang gagal pada dua atau lebih peserta diprioritaskan; butir validasi/keterpahaman di bawah 75% direvisi. Uji ulang bagian yang berubah secara material.

## 19. Rencana pembangunan dan backlog

### 19.1 Tahapan sesuai jadwal proposal [P/D]

P8-P15 berarti pertemuan perkuliahan, bukan tanggal kalender yang sudah disepakati. Estimasi kapasitas harus ditinjau setelah teknologi dan jam kerja tersedia diketahui.

| Tahap      | Pekerjaan                                                                                                               | Luaran dan gerbang                                                            |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Sebelum/P8 | Angket kebutuhan, wawancara guru, konfirmasi lingkup, inventaris sumber, alur izin                                      | Catatan kebutuhan nyata/simulasi dipisahkan; keputusan lingkup terdokumentasi |
| P9         | Fondasi proyek, navigasi, empat fitur minimum, data contoh, desain mobile                                               | Prototipe I dapat ditinjau; label demonstrasi                                 |
| P10        | Konten enam jalur/18 profesi, jurnal, cerita, lembar diskusi, versi cetak                                               | Konten siap validasi; PDF dapat dicetak                                       |
| P11        | Backend, akun/persetujuan, penyimpanan, otorisasi, snapshot, matriks, panel guru/kurasi, agregat, ekspor/hapus, retensi | Prototipe II; seluruh kontrol data tersedia                                   |
| P12        | Uji fungsional, akses, cache, retensi, backup, kinerja, aksesibilitas; validasi ahli                                    | 100% fungsi minimum lulus; temuan kritis selesai                              |
| P13        | Uji 5-8 siswa dan satu guru; SUS dan keterpahaman                                                                       | Catatan tugas, hasil uji, keterbatasan                                        |
| P14        | Revisi berdasar temuan, uji ulang yang relevan                                                                          | Log masalah -> perbaikan -> bukti                                             |
| P15        | Finalisasi V1, panduan siswa/guru/operator, laporan, serah terima                                                       | Rilis terkontrol setelah checklist terpenuhi                                  |

Fondasi data di P11 relatif padat untuk pengerjaan individu. Jika kapasitas tidak cukup, kurangi fidelitas visual dan cakupan prototipe demonstrasi lebih dahulu; jangan membuka data nyata dengan kontrol privasi yang belum selesai. Penerapan sekolah dapat dijadwalkan setelah P15 bila izin/operasi belum siap.

### 19.2 Urutan backlog implementasi [D]

| Epic                       | Pekerjaan utama                                      | Ketergantungan        | Selesai bila                                             |
| -------------------------- | ---------------------------------------------------- | --------------------- | -------------------------------------------------------- |
| E01 Fondasi dan desain     | Struktur modul, token UI, navigasi, templat status   | Kebutuhan awal        | Rute utama dan layout mobile dapat ditinjau              |
| E02 Konten publik          | Skema kartu, pencarian, detail, sumber, unduhan      | E01, kurasi awal      | Konten dapat dijelajah tamu dan dibaca luring            |
| E03 Identitas dan izin     | Registrasi pending, approval superadmin, login tiga role, wali, sesi, pemulihan        | Kebijakan sekolah     | Akun hanya aktif dengan izin; akses lintas peran ditolak |
| E04 Aktivitas siswa        | Refleksi, ringkasan, rencana, matriks, jurnal        | E01, E03              | Simpan/muat dan aturan pemilik lulus                     |
| E05 Konsultasi dan berbagi | Pratinjau, snapshot, idempotensi, status, pencabutan | E03, E04              | Guru hanya mendapat data terpilih yang masih berlaku     |
| E06 Panel guru             | Antrean, kurasi, agregat terlindungi                 | E02, E03, E05         | Tindak lanjut dan pembaruan konten berjalan              |
| E07 Siklus data            | Ekspor, hapus, retensi, backup/restore, audit        | E03-E06               | Penghapusan menyeluruh dan pemulihan terbukti            |
| E08 Kualitas dan uji       | Aksesibilitas, keamanan, kinerja, ahli, pengguna     | Kandidat terintegrasi | Gerbang rilis terpenuhi dan panduan tersedia             |

Keamanan dan aksesibilitas dikerjakan bersama setiap epic; E08 adalah verifikasi integrasi, bukan awal penerapan keduanya.

## 20. Operasional, lingkungan, dan serah terima [D/V]

- Pisahkan lingkungan pengembangan/demonstrasi, pengujian, dan penggunaan nyata. Jangan menyalin data siswa produksi ke lingkungan pengembangan.
- Gunakan data fiktif untuk demo, uji otomatis, tangkapan layar, dan presentasi. Tandai data simulasi secara jelas.
- Tentukan penanggung jawab produk, kurasi BK, verifikasi persetujuan, administrasi akun, infrastruktur, insiden, dan penghapusan; satu orang boleh memegang beberapa tanggung jawab selama jelas.
- Konfigurasi per lingkungan mencakup URL, secret, sekolah, zona waktu, kontak bantuan, jadwal retensi, dan mode demonstrasi. Secret tidak masuk repositori/frontend.
- Proses rilis mencakup pemeriksaan migrasi, backup, smoke test siswa/guru, cache publik, dan rollback. Rollback aplikasi tidak boleh membatalkan pencabutan akses/penghapusan.
- Pantau error simpan, konsultasi gagal, pekerjaan retensi, kapasitas penyimpanan, dan sumber konten perlu tinjau. Log tidak berisi data refleksi/jurnal.
- Susun panduan insiden: batasi akses yang terdampak, simpan bukti teknis minimum, hubungi penanggung jawab sekolah, perbaiki, dan tentukan pemberitahuan yang sesuai melalui prosedur sekolah.
- Biaya diupayakan rendah sesuai proposal, tetapi domain, hosting, database, cadangan, dan pemantauan perlu dihitung setelah layanan dipilih. Batas paket gratis bukan jaminan operasional jangka panjang.

**Paket serah terima:** kode sumber/konfigurasi tanpa secret, skema dan migrasi, inventaris konten beserta sumber/izin, hasil uji dan log revisi, panduan siswa, panduan guru/kurator, panduan operator/backup/hapus, daftar ketergantungan, serta daftar keputusan yang masih terbuka.

## 21. Risiko dan mitigasi

| Risiko                                      | Dampak                                 | Mitigasi dan pemilik                                                                         |
| ------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| Kebutuhan simulasi berbeda dari lapangan    | Fitur tidak dipakai                    | Penulis/pemilik produk melaksanakan angket dan wawancara sebelum lingkup dikunci             |
| Scope terlalu besar untuk P9-P15            | Fitur tidak selesai/privasi ditunda    | Gunakan tahapan prototipe; pemilik produk menunda penggunaan nyata sampai gerbang data lulus |
| Informasi seleksi/biaya berubah             | Siswa memakai informasi keliru         | Kurator meninjau sumber, versi, periode berlaku, dan penanda kedaluwarsa                     |
| Guru mengakses data yang tidak diizinkan    | Kerahasiaan dilanggar                  | Pengembang menerapkan otorisasi objek, snapshot, audit, dan pengujian negatif                |
| Kelompok kecil diidentifikasi lewat agregat | Identitas tersirat terbuka             | Aturan ambang dan penyembunyian sel pelengkap di server                                      |
| Ponsel dipakai bersama                      | Data akun berikutnya terekspos         | Logout/sesi jelas, tanpa cache privat, autentikasi ulang pada tindakan sensitif              |
| Jaringan putus                              | Kehilangan input atau pengiriman ganda | Status simpan jujur, retry eksplisit, idempotensi, konten publik luring, lembar cetak        |
| Guru belum merespons                        | Siswa merasa diabaikan                 | Sekolah menetapkan jam/estimasi respons, status permintaan, dan jalur bantuan langsung       |
| Persetujuan belum terverifikasi             | Pengumpulan tidak sesuai prosedur      | Akun menunggu dibatasi publik; verifikasi oleh petugas sekolah                               |
| Retensi kelulusan gagal                     | Data tersimpan terlalu lama            | Jadwal deletion_at, pemantauan pekerjaan, retry dan pelaporan                                |
| Jurnal dianggap diawasi untuk keselamatan   | Harapan layanan keliru                 | Penjelasan batas layanan dan bantuan tetap; tidak ada klaim pemantauan otomatis              |
| Layanan gratis habis/berubah                | Gangguan atau biaya tak terduga        | Operator memeriksa batas, backup, kemampuan migrasi, dan rencana biaya                       |

## 22. Kriteria selesai dan gerbang rilis

V1 dianggap selesai sebagai hasil pengembangan bila:

- [ ] Seluruh tujuh fitur sasaran V1 berjalan sesuai matriks akses dan batas layanan.
- [ ] Empat fitur minimum lulus 100% checklist fungsional.
- [ ] Enam kartu jalur dan 18 kartu profesi terisi, ditinjau, bersumber, dan berversi.
- [ ] Cerita berizin, lembar diskusi, lembar kerja PDF, dan panduan penggunaan tersedia.
- [ ] Mode tamu tidak menyimpan data pribadi; penolakan izin tidak menutup informasi publik.
- [ ] Akun, persetujuan, pemulihan, sesi, serta akses lintas akun/sekolah teruji.
- [ ] Jurnal tidak dapat diakses guru atau masuk snapshot dalam keadaan apa pun.
- [ ] Berbagi eksplisit, pratinjau, pencabutan, dan masa berlaku snapshot terbukti bekerja.
- [ ] Data pribadi tidak masuk cache luring, URL publik, log, atau laporan pengujian.
- [ ] Ekspor, hapus sukarela, retensi lulus, serta restore backup yang menghormati penghapusan diuji.
- [ ] Agregat benar dan kelompok kecil terlindungi.
- [ ] Konten luring dan hasil cetak berfungsi; layar ponsel dan aksesibilitas diperiksa.
- [ ] Validasi ahli >= 75%; temuan di bawah ambang direvisi.
- [ ] Uji pengguna dilakukan dengan status nyata/simulasi yang dinyatakan; target SUS, ketuntasan, dan keterpahaman dievaluasi.
- [ ] Tidak ada temuan privasi/keamanan yang belum diselesaikan atau kegagalan yang menghalangi tugas utama.
- [ ] Log revisi, keterbatasan hasil, dan dokumentasi serah terima selesai.

**Gerbang tambahan sebelum data siswa nyata:** sekolah dan guru mitra ditetapkan; penanggung jawab data/insiden jelas; prosedur wali sah dan dapat dijalankan; tanggal retensi diisi; kontak bantuan nyata diverifikasi; infrastruktur, backup, dan biaya operasional disetujui melalui proses sekolah. Rilis demonstrasi boleh menggunakan data fiktif selama diberi label jelas dan tidak membuka pengumpulan data siswa.

## 23. Keputusan yang masih perlu divalidasi

Pertanyaan berikut tidak menghalangi pembuatan prototipe dengan data fiktif, tetapi harus dijawab sebelum bagian terkait dipakai secara nyata.

| Keputusan                               | Asumsi awal PRD                                                          | Pihak yang perlu memvalidasi         |
| --------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| Sekolah/kelas pilot                     | Satu sekolah, kelas XI dan XII                                           | Sekolah dan guru BK                  |
| Mekanisme persetujuan wali              | Verifikasi formulir di sekolah; website hanya menyimpan status/referensi | Penanggung jawab sekolah/data        |
| Akses siswa                             | Registrasi mandiri, username, password, kode pemulihan, approval superadmin dan izin wali terpisah; tanpa email/telepon         | Pengembang dan sekolah               |
| Pengaturan pertemuan                    | Nama panggilan + kelas + nomor permintaan; verifikasi langsung           | Guru BK                              |
| Jam layanan/respons                     | Diisi sekolah dan tampil sebelum pengiriman; belum ada janji waktu       | Guru BK                              |
| Kelulusan/retensi                       | deletion_at per angkatan; aktif <= 24 jam, backup <= 30 hari             | Sekolah dan operator                 |
| Lokasi penyimpanan dan penyedia layanan | Belum dipilih                                                            | Penanggung jawab data dan pengembang |
| Teknologi/anggaran                      | Aplikasi modular sederhana; biaya rendah tanpa menjanjikan gratis        | Pemilik produk dan pengembang        |
| Sumber dan periode konten               | Sumber resmi yang diperiksa saat penulisan konten                        | Kurator dan ahli BK                  |
| Tampilan/nilai pendamping               | Ramah remaja, pesan Islami inklusif sesuai proposal                      | Guru dan pengguna uji                |
| Ambang agregat                          | Kelompok >= 10, sel >= 5 serta proteksi sel pelengkap                    | Penanggung jawab data dan guru       |
| Cakupan PDF                             | Lembar kosong lengkap dan ringkasan rencana terpilih                     | Guru dan pengguna uji                |
| Kontak bantuan cepat                    | Belum diisi; wajib diverifikasi sebelum penggunaan nyata                 | Sekolah/guru BK                      |

## 24. Matriks keterlacakan akhir

| Kebutuhan                               | Rujukan proposal | Bagian PRD      | Bukti uji utama                                    |
| --------------------------------------- | ---------------- | --------------- | -------------------------------------------------- |
| PWA, ringan, alternatif cetak           | S1, S3, S4       | FR-12, 11, 16   | QA-12, QA-13, QA-19                                |
| Enam langkah refleksi nonformal         | S2, S4           | FR-02           | T2, QA-03, QA-08                                   |
| Jalur kuliah/kerja/usaha dan profesi    | S1, S4           | FR-03, 10       | T3, QA-12, QA-17                                   |
| Matriks 2-3 pilihan, skor 1-5           | S2, S4           | FR-04           | T4, QA-04                                          |
| Rencana per semester dan cadangan       | S1, S4           | FR-05           | T5, QA-05                                          |
| Jurnal selalu privat                    | S2, S4, S6       | FR-06, FR-08    | QA-08, QA-10, QA-13                                |
| Sapa Guru BK dan berbagi atas izin      | S1, S2, S4       | FR-07, FR-08    | T6, QA-06, QA-07, QA-09                            |
| Dasbor agregat dan kurasi               | S1, S4           | FR-09, FR-10    | T7, QA-11, QA-17                                   |
| Minimisasi, persetujuan, hak akses      | S1, S2           | 5, 8.2, 15      | T1, QA-01, QA-02, QA-08                            |
| Ekspor/hapus dan retensi setelah lulus  | S2, S5           | FR-11, 15       | QA-14, QA-15, QA-16                                |
| Tanpa AI penilai dan keputusan otomatis | S1, S2, S4       | 4, FR-02, FR-04 | Review isi/output, QA-04                           |
| ADDIE, validasi dan uji terbatas        | S3, S5, S6       | 17-19, 22       | Checklist, lembar ahli, observasi, SUS, log revisi |

PRD ini menjadi dasar desain rinci dan backlog pembangunan. Perubahan kebutuhan harus dicatat bersama alasan, sumber validasi, dampak akses/data, dan kriteria penerimaan yang diperbarui.


## 25. Catatan implementasi lokal 22 November 2026

Implementasi JavaScript ES Modules berada pada backend/frontend. Pemetaan sembilan template dan koreksi ekspor ada di docs/design-audit.md; bukti pengujian dan keterbatasan ada di docs/verification.md. Desktop 1440 px menjadi prioritas; mobile merupakan adaptasi template yang sama. Endpoint final memakai prefix /api/v1 dengan modul /auth, /admin, /student, /bk, /public; tabel API konseptual di atas tidak menyatakan kontrak URL final.

Masa snapshot pengembangan adalah 30 hari sejak pengiriman/izin baru, dapat dicabut segera; kebijakan operasional perlu validasi sekolah. Ekspor JSON terautentikasi, cetak A4 dari browser, worker penghapusan, serta backup AES-GCM tersedia. Materi demo tidak disajikan dalam mode non-demo. Konten faktual tahun berjalan, cerita alumni berizin, penilaian ahli, peserta, hosting dan operasi produksi belum dinyatakan selesai.

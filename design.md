# LANGKAHKU - Design Guide

Panduan desain ringkas dan prompt UI untuk Stitch.

| Atribut          | Nilai                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Versi            | 1.2 - tiga role dan pendaftaran dengan persetujuan superadmin                             |
| Tanggal          | 22 November 2026                                                                          |
| Dasar            | `PRD.md` dan pembaruan akun/stack pada `structure.md`                                     |
| Referensi        | `design/references/reference-01.png`                                                      |
| Palet            | Maroon + pastel                                                                           |
| Cakupan generasi | **9 template utama: 6 publik/siswa + 3 staf; template antrean dipakai ulang sesuai role** |
| Bahasa UI        | Bahasa Indonesia                                                                          |

## 1. Arah desain

**Langkah kecil, arah yang lebih jelas.**

Gunakan tampilan hangat, modern, dan tertata: judul geometris tegas, kartu modular, label berbentuk pil, bidang putih hangat, serta pastel lembut. Maroon menjadi identitas dan warna tindakan utama.

Dari referensi, ambil komposisi asimetris, tipografi besar, dan ilustrasi bola/jalur abstrak secukupnya. Gunakan warna baru sesuai permintaan pengguna; teks HR, angka statistik, foto kreator, dan warna lime pada referensi tidak menjadi konten produk.

Tampilan lebih sederhana: **satu area utama, satu tugas yang jelas, dan sedikit dekorasi**. Hero ilustratif hanya perlu di halaman pembuka atau beranda. Halaman formulir didominasi putih dengan aksen pastel.

## 2. Penyederhanaan struktur

Desain diringkas dari 28 layar menjadi **9 template utama**, dengan template antrean staf dipakai ulang oleh BK dan superadmin. Fitur PRD tetap terwakili, tetapi detail dan variasi keadaan menggunakan komponen di template yang sama.

| ID  | Layar utama             | Fitur yang digabung di dalamnya                                                 |
| --- | ----------------------- | ------------------------------------------------------------------------------- |
| S01 | Mulai & akses akun      | Pembuka, login tiga role, daftar siswa, status approval/izin wali, pemulihan    |
| S02 | Beranda siswa           | Kemajuan empat langkah, akses fitur, rencana terdekat, pintu masuk jurnal       |
| S03 | Kenali Diriku           | Enam langkah refleksi dan ringkasan akhir dalam satu alur                       |
| S04 | Peta Jalur              | Katalog, pencarian, detail jalur/profesi, Cerita Langkah, unduhan publik        |
| S05 | Rencana Langkahku       | Tujuan, cadangan, checklist semester, serta tab Timbang Pilihan                 |
| S06 | Sapa Guru BK            | Form permintaan, pratinjau berbagi, daftar/status permintaan, cabut akses       |
| T01 | Antrean staf            | BK: permintaan konsultasi; superadmin: pendaftaran siswa dan keputusan approval |
| T02 | Agregat kebutuhan       | Grafik kelompok, topik, dan state data kelompok kecil                           |
| T03 | Kelola konten & layanan | Daftar/editor konten serta tab pengaturan layanan dan administrasi berwenang    |

**Komponen pendukung, bukan layar utama tambahan:** jurnal privat, pengaturan siswa, ekspor/hapus data, bantuan, dan detail kartu. Gunakan panel atau dialog yang dibuka dari konteks terkait.

Aturan untuk menjaga kesederhanaan:

- Maksimal satu panel atau dialog terbuka. Jangan menumpuk modal di atas modal.
- Detail menggunakan panel kanan desktop; mobile dapat menggunakan panel setinggi layar dengan tombol kembali yang jelas.
- Form yang cukup panjang mendapat ruang penuh di area panel, bukan modal sempit.
- Wizard enam langkah memakai satu template; enam langkah tidak memerlukan enam desain terpisah.
- Status kosong, loading, gagal, dan selesai adalah variasi komponen, bukan halaman baru.
- Desktop dan mobile adalah dua tampilan responsif dari template yang sama.
- Rute yang tercantum dalam PRD dapat memakai template bersama dan membuka panel terkait. Penyederhanaan ini tidak menghapus aturan akses atau kemampuan produk.

## 3. Sistem visual

### 3.1 Warna

| Peran           | HEX       | Penggunaan                         |
| --------------- | --------- | ---------------------------------- |
| Maroon utama    | `#6E2035` | Tombol utama, link, navigasi aktif |
| Maroon hover    | `#57172A` | Hover/pressed                      |
| Maroon gelap    | `#4F1225` | Hero seperlunya                    |
| Ivory           | `#F7F3ED` | Kanvas halaman                     |
| Putih           | `#FFFFFF` | Kartu dan form                     |
| Teks utama      | `#241A20` | Judul dan isi                      |
| Teks sekunder   | `#6D6268` | Deskripsi dan metadata             |
| Garis dekoratif | `#E7DEE2` | Pemisah kartu                      |
| Batas kontrol   | `#8C7D85` | Input, checkbox, radio             |
| Blush           | `#F6E6EA` | Kenali Diriku                      |
| Sage            | `#E7EEE7` | Peta Jalur                         |
| Lavender        | `#EEE9F6` | Timbang Pilihan                    |
| Peach           | `#F9E7DB` | Rencana Langkahku                  |
| Butter          | `#FFF0D5` | Perlu perhatian                    |

Patokan luas bidang: sekitar **70% netral, 20% pastel, 10% maroon**. Pastel untuk latar, teks gelap untuk keterbacaan. Jangan menggunakan semua warna dalam satu kartu.

Status menggunakan teks dan ikon selain warna:

- Berhasil: `#315D46` pada `#E7EEE7`.
- Perlu perhatian: `#7A4C15` pada `#FFF0D5`.
- Error/destruktif: `#9F243C` pada `#FBE7ED`.
- Fokus keyboard: outline maroon 3 px dengan offset 3 px.

Pasangan yang telah dihitung pada warna padat: putih/maroon sekitar **10,93:1**, teks sekunder/putih **5,84:1**, teks sekunder/ivory **5,28:1**, maroon/blush **9,07:1**. Periksa ulang bila warna diberi opacity atau ditaruh di atas gambar. Garis dekoratif pucat tidak cukup sebagai satu-satunya batas input.

### 3.2 Tipografi, ukuran, dan ruang

Gunakan **Plus Jakarta Sans**, fallback system sans-serif. Satu keluarga font cukup.

| Elemen                 | Desktop                | Mobile                 |
| ---------------------- | ---------------------- | ---------------------- |
| Judul pembuka          | 56-64 px, bold         | 36 px, bold            |
| Judul halaman          | 36-40 px, bold         | 28 px, bold            |
| Judul kartu            | 20 px, semibold        | 20 px, semibold        |
| Isi/instruksi          | 16 px, line-height 1,6 | 16 px, line-height 1,6 |
| Label/metadata singkat | 14 px                  | 14 px                  |

- Desktop acuan 1440 px; konten maksimum 1200 px, grid 12 kolom, gap 24 px.
- Mobile acuan 390 px, tetap terbaca pada 360 px; margin 16-20 px, gap 16 px.
- Padding kartu 20-24 px; jarak bagian 32-48 px.
- Radius kartu 20 px, hero 28 px, kontrol 12 px, chip 999 px.
- Tombol utama tinggi 48 px; target sentuh minimal 44 x 44 px.
- Bayangan ringan hanya bila dibutuhkan; kartu biasa cukup bidang dan garis tipis.
- Maksimal satu ilustrasi abstrak statis per area hero; tidak perlu animasi 3D.
- Ikon outline konsisten 20/24 px dengan label teks. Hindari emoji sebagai navigasi.

### 3.3 Motion dan transisi

- **Token terpusat** (`frontend/src/styles/tokens.css`): `--motion-duration-fast: 160ms` (perubahan warna/latar menu aktif, tab, chip, tombol), `--motion-duration-view: 190ms` (perpindahan konten rute/tab), `--motion-ease: cubic-bezier(0.22, 1, 0.36, 1)`, dan `--motion-distance: 6px`.
- **Pola perpindahan konten (`ViewTransition` / `.view-stage.view-enter`)**: kombinasi `opacity` (0 -> 1) dan `transform: translateY(6px -> 0)` hanya pada area konten yang berubah. Header, sidebar, navigasi, dan footer tetap stabil.
- **Keamanan state & aksesibilitas**: transisi memicu ulang kelas CSS tanpa me-remount subtree secara paksa dan membersihkan kelas setelah `animationend` agar tidak meninggalkan konten transparan atau memblokir klik/sticky. Menghormati `prefers-reduced-motion: reduce` dengan menonaktifkan pergerakan.
- **Reveal & halaman publik diperkaya**: bagian halaman utama dan halaman publik muncul halus saat memasuki viewport menggunakan `IntersectionObserver` (`Reveal.jsx`), hero memakai stagger ringan serta gerakan mengambang lambat pada elemen ilustrasi abstrak (`.float-slow`, `.float-gentle`), dan menu drawer publik mobile membuka/menutup dengan transisi `grid-template-rows`.
- **Halaman publik tambahan**: selain sembilan template fondasi portal, area publik dilengkapi halaman informasi terhubung (`/`, `/tentang`, `/cara-menggunakan`, `/peta-jalur`, `/cerita-langkah`, `/panduan-orang-tua`, `/faq`, `/privasi`, `/unduhan`).

## 4. Navigasi dan komponen bersama

### Siswa

Navigasi utama: **Beranda, Diriku, Jalur, Rencana, BK**. Desktop memakai header; mobile memakai bottom navigation. Tab **Timbang Pilihan** berada di Rencana dan tetap mempunyai pintasan pada kartu empat langkah di beranda.

Jurnal dibuka dari Beranda/Rencana melalui panel privat. Pengaturan dibuka dari menu akun. Bantuan selalu dapat dijangkau lewat tautan **Butuh bicara sekarang?**; isinya menggunakan kontak sekolah yang sudah diverifikasi.

### Guru dan superadmin

Sidebar desktop/drawer mobile BK cukup tiga menu: **Permintaan, Agregat, Kelola**. Superadmin memakai menu **Pendaftaran siswa** dengan pengelolaan akun BK/administrasi melalui tab atau panel. Data, aksi, dan menu tetap dipisahkan sesuai role; superadmin tidak mendapat akses jurnal atau konsultasi pribadi.

### Komponen minimum

Cukup gunakan tombol primary/secondary, kartu, chip, field, checkbox/radio, stepper, checklist, badge status, tabel/daftar, panel, dialog konfirmasi, dan banner. Jangan menambah komponen dekoratif yang tidak membantu tugas.

Setiap form mempunyai label tetap, helper, error inline, fokus keyboard, dan status simpan. Pada mobile, tombol utama, bottom navigation, safe area, dan keyboard tidak boleh saling menutup. Warna bukan satu-satunya pembeda pilihan/status.

## 5. Rancangan sembilan layar

### S01 - Mulai & akses akun

**Headline:** “Masa depanmu, dimulai dari satu langkah.”

Susunan pembuka: wordmark, headline, deskripsi singkat, CTA **Masuk akun**, link **Jelajahi tanpa akun**, tautan **Daftar akun siswa**, dan ilustrasi jalur maroon-pastel di dalam kartu putih pada rute `/`. Sesuai arahan terbaru pengguna, halaman login/akses dipisahkan ke rute `/masuk`, `/daftar`, `/pemulihan`, dan `/status` dalam kartu akses terpusat dengan tautan kembali ke halaman awal.

Di template yang sama, area akses berganti sesuai pilihan:

- **Masuk:** satu form ID akun/username dan kata sandi untuk tiga role; server menentukan tujuan berdasarkan role, tanpa pilihan role yang memberi kewenangan dari browser.
- **Daftar siswa:** username, kata sandi, nama panggilan, kelas/semester, sekolah yang tersedia, kategori usia, dan persetujuan eksplisit. Backend menetapkan role siswa dan status menunggu persetujuan superadmin. Tidak ada pendaftaran publik untuk BK/superadmin.
- **Status pendaftaran:** menunggu persetujuan superadmin, ditolak dengan alasan, atau disetujui. Jika izin wali masih diperlukan, tampilkan menunggu izin wali secara terpisah. Sebelum seluruh gerbang terpenuhi, hanya akses status sendiri dan konten publik.
- **Pemulihan:** ID akun dan kode pemulihan, atau petunjuk verifikasi langsung di sekolah bila kode hilang.

Penjelasan privasi dibuka dalam bagian yang dapat diperluas/panel baca. Tidak meminta email, telepon, NISN, alamat, tanggal lahir lengkap, atau unggahan identitas wali. Tidak ada pendaftaran guru bebas.

### S02 - Beranda siswa

Judul: **“Halo, Rani. Mau melangkah ke mana hari ini?”** Gunakan nama rekaan sebagai data demo.

Susunan cukup empat kelompok:

1. Hero ringkas: **“Pelan-pelan, yang penting mulai”**, status **“2 dari 4 langkah ditinjau”**, tombol melanjutkan.
2. Empat kartu langkah: Kenali Diriku/blush, Peta Jalur/sage, Timbang Pilihan/lavender, Rencana Langkahku/peach.
3. Satu rencana terdekat dengan tombol membuka Rencana.
4. Akses kecil **Tulis jurnal privat** dan **Sapa Guru BK**.

Tidak perlu banyak kartu statistik. Kartu jurnal tidak menampilkan judul/isi entri. Panel jurnal memuat daftar berdasarkan tanggal dan editor dua/tiga pertanyaan; daftar dan editor berganti dalam panel yang sama.

### S03 - Kenali Diriku

Satu template form untuk enam tahap: kegiatan disukai, pelajaran dinikmati, kekuatan, nilai kerja, kondisi/dukungan, ringkasan.

Header: judul, **Langkah 1 dari 6**, progress, status simpan. Isi berupa pilihan aktivitas dan narasi opsional. Footer: **Kembali**, **Lewati dulu**, **Simpan dan lanjut**.

Copy tetap: **“Ini refleksi, bukan tes. Tidak ada jawaban benar atau salah.”**

Tahap terakhir mengganti isi form menjadi ringkasan yang dapat diedit dan tombol **Jelajahi jalur**. Tidak ada halaman hasil terpisah, nilai psikologis, persentase kecocokan, tipe pasti, atau penguncian menu.

### S04 - Peta Jalur

Satu katalog dengan pencarian, kategori **Kuliah / Kerja / Kuliah + Kerja / Usaha**, kartu jalur, dan bagian profesi. Target konten tetap enam kartu induk jalur dan 18 profesi sesuai PRD; tidak semuanya harus memenuhi viewport pertama.

Klik kartu membuka detail pada panel yang sama. Panel menampilkan gambaran, persyaratan, waktu, biaya/dukungan, persiapan XI/XII, sumber, serta tanggal tinjau. Konten profesi dan Cerita Langkah memakai struktur panel yang sama dengan isi berbeda.

Aksi kontekstual: **Tambahkan ke pilihan**, **Sudah kupelajari**, **Unduh luring**, **Buka sumber resmi**. Unduhan publik dikelola lewat panel dari tombol Unduhan pada katalog. Tampilkan versi, status unduh, dan informasi kedaluwarsa bila ada.

Tamu dapat membaca tanpa akun. Simpan pribadi membutuhkan akun aktif. Tautan sumber eksternal tetap memerlukan internet. Jangan mengarang syarat, biaya, tanggal seleksi, atau testimoni nyata.

### S05 - Rencana Langkahku

Dua tab saja: **Rencana** dan **Timbang Pilihan**. Keduanya tetap dapat dijangkau langsung dari beranda.

**Tab Rencana:** tujuan utama, cadangan, semester XI-1/XI-2/XII-1/XII-2, checklist, **Tambah langkah**, **Cetak ringkasan**. Contoh kemajuan: **“1 dari 3 langkah selesai”**. Tambah/edit dilakukan melalui panel; draf dengan kurang dari tiga langkah tetap dapat disimpan.

**Tab Timbang Pilihan:** dua/tiga opsi, lima kriteria (minat, kemampuan, biaya, dukungan keluarga, peluang), nilai 1-5 atau **Belum tahu**, dan alasan opsional. Nilai 5 untuk biaya berarti lebih terjangkau menurut keadaan siswa.

Desktop dapat menggunakan matriks; mobile menggunakan bagian per opsi yang terbaca. Tidak ada penjumlahan menjadi skor kecocokan, peringkat, atau opsi pemenang otomatis. Copy: **“Hasil ini bahan diskusi, bukan keputusan otomatis.”**

Jurnal privat tersedia sebagai tombol sekunder yang membuka panel yang sama seperti di Beranda. Jurnal tidak ikut ringkasan cetak secara otomatis.

### S06 - Sapa Guru BK

Satu layar dengan daftar permintaan singkat dan tombol **Ajukan konsultasi**. Area utama berganti antara form, pratinjau, dan detail status; jangan membuka halaman baru untuk setiap tahap.

Form: topik, waktu yang memungkinkan, catatan singkat opsional, serta checkbox ringkasan **Kenali Diriku / Timbang Pilihan / Rencana Langkahku**. Semua checkbox kosong secara bawaan. Jurnal tidak menjadi pilihan. Pengiriman tanpa lampiran tetap valid.

Pratinjau menampilkan tepat nama panggilan/kelas, penerima, topik, waktu, catatan dan ringkasan terpilih. Tombol **Kirim permintaan** hanya aktif saat daring dan tidak sedang mengirim.

Detail status menampilkan nomor permintaan, Diajukan/Dijadwalkan/Perlu penjadwalan ulang/Selesai, waktu, dan akses ringkasan. **Cabut akses** memakai konfirmasi singkat; setelah dicabut, isi lama tidak ditampilkan kembali. Pembaruan ringkasan meminta izin baru.

Tampilkan jam layanan dari konfigurasi sekolah dan jelaskan bahwa waktu perlu dikonfirmasi guru. Ini permintaan konsultasi, bukan chat langsung atau layanan 24 jam.

### T01 - Antrean staf berdasarkan role

**Varian BK:** antrean konsultasi dengan filter status/topik dan kolom nama panggilan, kelas, topik, waktu, status. Mobile menggunakan daftar kartu.

Klik permintaan membuka detail pada panel/area kerja yang sama: isi permintaan, ringkasan yang dipilih siswa, serta aksi jadwalkan/usulkan waktu/tandai selesai/tutup dengan alasan operasional.

Tidak ada tab jurnal, akses jawaban asli, catatan diagnosis, atau ekspor massal data siswa. Sediakan state tanpa lampiran, hanya rencana, akses dicabut, dan akses berakhir. Bagian yang tidak dibagikan tidak mempunyai preview tersembunyi.

**Varian superadmin:** gunakan komponen antrean/detail yang sama untuk **Pendaftaran siswa**, dengan status Menunggu/Disetujui/Ditolak, detail administratif minimum, tombol **Setujui**, serta **Tolak** dengan alasan. Riwayat keputusan dan status wali dipisahkan. Pengelolaan akun BK dapat memakai tab/panel. Varian ini tidak menampilkan data konsultasi atau jurnal dan tidak memerlukan desain template baru.

### T02 - Agregat kebutuhan

Satu layar sederhana: kelompok/periode tetap, grafik tahap aktivitas, dan topik konsultasi. Grafik memakai label nilai dan teks; tidak ada nama atau penelusuran individu.

Dua state dalam template yang sama:

- **Data aman:** contoh 30 siswa demo dengan lima tahap eksklusif masing-masing 6 siswa.
- **Kelompok kecil:** “Data kelompok belum cukup untuk ditampilkan dengan aman.”

Ikuti PRD: kelompok minimal 10, sel minimal 5, dan lindungi sel pelengkap. Angka tersembunyi tidak muncul di tooltip/total yang memungkinkan penghitungan balik. Tidak ada skor kesiapan individu atau filter kombinasi bebas.

### T03 - Kelola konten & layanan

Dua tab: **Konten** dan **Layanan**.

Konten berisi daftar/filter jenis Jalur, Profesi, Cerita, Lembar kerja; status Draf/Siap ditinjau/Terbit/Arsip. Editor menggantikan daftar di area kerja yang sama, dengan sumber, periode berlaku, tanggal tinjau, peninjau, dan preview. Jangan menumpuk modal editor dengan modal preview.

Layanan memuat jam layanan, estimasi respons, kontak bantuan terverifikasi, zona sekolah, serta administrasi akun/status persetujuan hanya untuk petugas berwenang. Tidak ada unggah identitas wali atau akses data refleksi pribadi. Jangan menampilkan menu administrasi yang tidak dimiliki peran pengguna.

## 6. Panel pendukung dan state

| Komponen         | Dibuka dari       | Isi minimum                                                                            |
| ---------------- | ----------------- | -------------------------------------------------------------------------------------- |
| Jurnal privat    | Beranda/Rencana   | Daftar tanggal, editor 2-3 pertanyaan, simpan/edit/hapus, label privat; tanpa berbagi  |
| Pengaturan siswa | Menu akun         | Profil minimum, keamanan/sesi, akses yang dibagikan, ekspor, retensi/hapus, keluar     |
| Ekspor           | Pengaturan        | Pilihan bagian; jurnal terpisah dan tidak dicentang bawaan; penjelasan keamanan berkas |
| Hapus akun/data  | Pengaturan        | Dampak, ekspor opsional, autentikasi ulang, konfirmasi; status penghapusan sesuai PRD  |
| Bantuan/privasi  | Utility link/menu | Informasi ringkas dan kontak valid; tidak membuat nomor atau janji respons             |
| Detail konten    | Peta Jalur        | Isi kartu/cerita, sumber, versi, aksi terkait                                          |

Bila panel membutuhkan konfirmasi, ganti isi panel atau tutup panel dahulu; jangan menumpuk dialog. Setiap panel mempunyai judul, tombol tutup/kembali, fokus keyboard, dan mengembalikan fokus ke pemicunya.

State minimum: kosong, memuat, menyimpan, tersimpan, gagal, luring, sesi berakhir, konflik perubahan, izin ditolak, dan akses dicabut/berakhir. Cukup gambar state yang berbeda secara penting; tidak perlu membuat setiap kombinasi menjadi artboard baru.

Copy singkat:

- Menyimpan: **“Menyimpan...”**
- Berhasil: **“Tersimpan”**, setelah server mengonfirmasi.
- Gagal: **“Perubahan belum tersimpan. Coba lagi saat terhubung.”**
- Luring: **“Konten yang sudah diunduh tetap bisa dibaca. Data pribadi dan pengiriman konsultasi memerlukan internet.”**
- Jurnal: **“Jurnal tidak dibagikan ke guru BK.”**

Tidak ada autosave luring pribadi, pemindaian jurnal, atau klaim backup langsung hilang setelah hapus. Jaga input/fokus, pembesaran teks 200%, dan pengurangan gerak; transisi ringan sekitar 120-180 ms sudah cukup.

Lembar cetak adalah keluaran fitur, bukan layar tambahan untuk generasi awal: A4, putih, teks gelap, margin 16-20 mm, tanpa navigasi/hero, dan jurnal tidak otomatis disertakan.

## 7. Prompt Stitch ringkas

Gunakan master brief berikut, lalu tambahkan **satu brief layar** dari tabel di bawah. Tidak perlu meminta semua variasi sekaligus. Mulai dengan sembilan template; mobile dan state penting diturunkan setelah bahasa visual konsisten.

### Master brief

```text
Design LANGKAHKU, a warm modern responsive career-planning PWA for Indonesian high-school students and their school counselors. All UI text must be natural Bahasa Indonesia. Create only the requested main screen; do not split details, states, or forms into additional standalone pages.

Style: bold geometric typography, restrained asymmetric modular cards, pill labels, generous whitespace, and minimal abstract ceramic spheres/tubular paths in the hero only. Adapt the supplied reference's composition, not its lime palette, HR content, portrait, or metrics. Keep the interface calm and simple: one clear primary task, no excessive stacked cards, no nested overlays.

Colors: maroon #6E2035, hover #57172A, deep maroon #4F1225, ivory canvas #F7F3ED, white #FFFFFF, main text #241A20, secondary text #6D6268. Pastels: blush #F6E6EA for self-reflection, sage #E7EEE7 for pathways, lavender #EEE9F6 for comparison, peach #F9E7DB for planning. Approximately 70% neutral, 20% pastel, 10% maroon. Dark text on pastel; white text on maroon buttons. No neon colors or full dark-maroon application.

Use Plus Jakarta Sans, 16px body text, 28px mobile page headings, 36-40px desktop page headings, 20px card radius, 12px control radius, 48px buttons, and consistent labeled outline icons. DESKTOP FIRST: 1440px with 1200px maximum content width, comfortable at 1280–1920px. Adapt the same templates to mobile 390px and 360px after desktop consistency. Reflow tables rather than shrinking them. Ensure keyboard focus and readable contrast.

Exactly nine main templates: S01 Start/access, S02 Student home, S03 Self-reflection, S04 Pathways, S05 Plan with Comparison tab, S06 Counselor requests, T01 Staff queue/detail reused for BK consultation requests and superadmin student approvals, T02 Aggregates, T03 Content/services management. Details use one reusable side panel, full-height mobile panel, or inline view. Never stack modals. A six-step wizard is one template, not six pages.

Student navigation: Beranda, Diriku, Jalur, Rencana, BK. BK navigation: Permintaan, Agregat, Kelola. Superadmin navigation: Pendaftaran siswa, with account administration in contextual tabs/panels. Keep role-specific data and actions separate. Journal and student settings are contextual panels, not new navigation pages. Include “Butuh bicara sekarang?” help access. Keep actions clear of mobile navigation, safe areas and keyboard.

Product rules: no diagnosis, career-match score, ranking, automatic career choice, AI assistant, or live chat. Journals are private and never shared or shown to teachers. Sharing checkboxes start unchecked; consultation without attachments is allowed. Login supports three server-defined roles: superadmin, bk, siswa. Students self-register with username/password and wait for superadmin approval. Pending/rejected students cannot use private features; guardian consent is a separate gate where required. No public BK/superadmin signup. Do not ask students for email/phone/NISN. Guests can read pathways. Offline support covers downloaded public content only. Do not invent official dates, fees, contact numbers, verified testimonials, or 24/7 support claims. Label fictional examples “Data demo”.
```

### Brief per layar

| Layar | Tambahkan setelah master brief                                                                                                                                                                                                                                                                                                                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S01   | Design the start/access template. Headline: “Masa depanmu, dimulai dari satu langkah.” Include “Mulai langkahku” and “Jelajahi tanpa akun”. Use a compact access area that switches between three-role login, student self-registration, superadmin-approval waiting/rejection state, separate guardian-consent waiting state, and recovery. Keep these as states of one template.                |
| S02   | Design student home for fictional Rani. Use one compact maroon hero, “2 dari 4 langkah ditinjau”, four pastel core-step cards, one next plan action, and small journal/BK entry points. No journal previews or extra statistic cards.                                                                                                                                                             |
| S03   | Design one six-step self-reflection template with optional answers and “Ini refleksi, bukan tes”. The final step becomes the editable summary in the same layout. Actions: Kembali, Lewati dulu, Simpan dan lanjut. No scores or result page.                                                                                                                                                     |
| S04   | Design a public pathway catalog with search and four category chips. Pathway, profession, story details and public downloads use one reusable panel. Include source/review metadata and offline download states. Guests may read without login.                                                                                                                                                   |
| S05   | Design a planning workspace with two tabs: Rencana and Timbang Pilihan. Planning has primary/backup goals, four semesters and a checklist. Comparison has 2-3 options, five criteria, 1-5 or Belum tahu, and no totals/winner. Journal uses a private panel.                                                                                                                                      |
| S06   | Design a consultation workspace switching inline between request list, form, sharing preview and status detail. Sharing has three unchecked summary options and no journal. Allow no attachments. Include revoke-access and offline-disabled-send states. No separate confirmation page.                                                                                                          |
| T01   | Design one reusable staff queue/detail template with role-specific variants. BK sees consultation requests, shared summaries and scheduling. Superadmin sees student registrations, status, minimum administrative details, Approve/Reject with reason and decision history. Keep guardian consent separate. No journal access, private student answers, or counselor notes in the admin variant. |
| T02   | Design a simple aggregate view with fixed cohort/period, labeled bars, and no individual drill-down. Include a valid demo group of 30 with five exclusive stages of 6 each, plus a suppressed-small-group state. Protect small cells and complementary totals.                                                                                                                                    |
| T03   | Design a management workspace with Konten and Layanan tabs. Content list switches to an inline editor with sources/review/publishing. Service settings contain school-configured hours, verified help contacts and role-restricted account/consent administration. No extra standalone editor/settings screens.                                                                                   |

**Prompt koreksi:** “Simplify the existing screen. Keep the same maroon/pastel tokens and product rules. Remove redundant cards and secondary metrics. Merge details into one contextual panel or inline state, with no nested modals. Preserve the main task, readable 16px text, essential navigation, and privacy controls. Do not create additional pages.”

## 8. Urutan kerja dan checklist

Urutan generasi: **S02 -> S04 -> S03 -> S05 -> S06 -> T01 -> T02 -> T03 -> S01**. Beranda menetapkan visual; layar berikutnya memakai komponen yang sama.

Untuk tahap awal, prioritaskan sembilan template DESKTOP pada 1440 px, tetap nyaman pada 1280–1920 px. Adaptasikan ke mobile 390/360 px setelah komponen desktop konsisten; adaptasi responsif tersebut bukan fitur atau layar baru. State penting dapat ditinjau pada komponen terpilih, terutama berbagi, luring, dan pencabutan akses.

- [ ] Hanya sembilan template utama; tidak kembali menjadi puluhan halaman detail.
- [ ] Satu overlay maksimum, dengan tombol kembali/tutup yang jelas.
- [ ] Maroon + pastel konsisten dan isi tetap terbaca pada mobile.
- [ ] Empat langkah inti, jurnal privat, konsultasi, dan pekerjaan guru tetap terwakili.
- [ ] Tidak ada skor kecocokan, penentuan otomatis, atau klaim hasil rekaan.
- [ ] Berbagi eksplisit, tanpa jurnal, dengan opsi tanpa lampiran dan cabut akses.
- [ ] Agregat kecil terlindungi; data privat tidak dijanjikan tersedia luring.
- [ ] Login tiga role, daftar siswa, persetujuan superadmin, persetujuan wali terpisah, ekspor/hapus, sumber konten, dan bantuan tetap tercakup.
- [ ] Loading, gagal, tersimpan, dan akses dicabut tidak memerlukan halaman baru.

Dokumen ini menyederhanakan rancangan visual dan bahan generasi Stitch. Aturan fungsional, data, keamanan, dan penerimaan tetap mengacu pada `PRD.md`.


Audit konversi dan peta rute final: `docs/design-audit.md`. Komponen aktual menggunakan token normalisasi, tanpa klaim/handler contoh dari ekspor.

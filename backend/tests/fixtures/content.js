// Fixture pengujian saja; tidak disertakan dalam image production.
const pathways = [
  [
    "kuliah-seleksi-nasional",
    "Kuliah melalui SNBP & SNBT",
    "Kuliah",
    "Kenali dua jalur seleksi nasional dan cari informasi langsung pada portal resminya.",
    "SNBP dan SNBT memiliki ketentuan yang berbeda. Baca persyaratan siswa, ketentuan program studi, dan jadwal tahun berjalan pada portal SNPMB. Jangan menganggap aturan tahun sebelumnya masih berlaku.\n\nPersiapan XI: kenali mata pelajaran yang dinikmati dan pelajari program studi. Persiapan XII: diskusikan persyaratan terkini dengan sekolah dan susun pilihan sendiri.\n\nBiaya dan dukungan: periksa informasi kampus serta sumber beasiswa resmi. Tidak ada angka biaya atau jaminan diterima dalam materi ini.",
    "Portal SNPMB",
    "https://snpmb.id/",
  ],
  [
    "mandiri-dan-swasta",
    "Seleksi mandiri & perguruan tinggi swasta",
    "Kuliah",
    "Pilihan penerimaan lain yang perlu dipelajari langsung pada situs perguruan tinggi.",
    "Setiap perguruan tinggi dapat memiliki proses penerimaan, dokumen, biaya, dan jadwal sendiri. Periksa situs resmi kampus dan status program studi sebelum memutuskan.\n\nPersiapan XI: bandingkan bidang studi dan lingkungan belajar. Persiapan XII: buat daftar pertanyaan tentang biaya total, dukungan dana, dan persyaratan.\n\nMateri ini adalah orientasi, bukan panduan penerimaan terverifikasi untuk kampus tertentu.",
    "Pangkalan Data Pendidikan Tinggi",
    "https://pddikti.kemdiktisaintek.go.id/",
  ],
  [
    "perguruan-tinggi-keagamaan",
    "Perguruan tinggi keagamaan Islam",
    "Kuliah",
    "Jelajahi SPAN-PTKIN, UM-PTKIN, dan jalur kampus sesuai informasi resmi.",
    "Perguruan tinggi keagamaan menawarkan beragam bidang studi. SPAN-PTKIN, UM-PTKIN, dan seleksi kampus memiliki ketentuan masing-masing. Gunakan portal resmi untuk mengetahui tahun, jalur, dan persyaratan yang berlaku.\n\nPersiapan XI: pelajari pilihan program. Persiapan XII: tinjau kembali persyaratan dan dukungan biaya bersama sekolah. Keputusan tetap milikmu.",
    "Portal SPAN-PTKIN",
    "https://span.ptkin.ac.id/",
  ],
  [
    "kerja-dan-pelatihan",
    "Kerja & penguatan keterampilan",
    "Kerja",
    "Mulai dari keterampilan yang ingin dilatih dan pelajari layanan ketenagakerjaan resmi.",
    "Bekerja atau mengikuti pelatihan adalah jalur yang dapat dipertimbangkan. Pelajari kompetensi, keselamatan, hak pekerja, dan persyaratan program. Periksa penyelenggara serta hindari tawaran yang meminta pembayaran tanpa penjelasan.\n\nPersiapan XI: coba proyek sederhana dan catat pengalaman. Persiapan XII: tinjau pelatihan dan persyaratan lowongan resmi bersama pendamping.\n\nBiaya, sertifikasi, durasi, dan penempatan kerja berbeda menurut program; tidak ada jaminan gratis atau penempatan dalam kartu ini.",
    "SIAPkerja Kementerian Ketenagakerjaan",
    "https://siapkerja.kemnaker.go.id/",
  ],
  [
    "kuliah-sambil-kerja",
    "Kuliah sambil kerja",
    "Kuliah + Kerja",
    "Pertimbangkan beban waktu, dukungan, dan bentuk pembelajaran yang memungkinkan.",
    "Menggabungkan kerja dan kuliah memerlukan pertimbangan waktu, tenaga, serta biaya. Pelajari bentuk pembelajaran dan persyaratan di institusi yang dituju. Universitas Terbuka dapat menjadi salah satu sumber untuk mengenal pendidikan jarak jauh.\n\nPersiapan XI: latih pengaturan waktu. Persiapan XII: buat perkiraan jadwal mingguan dan pertanyaan tentang dukungan belajar. Jangan menganggap semua program cocok dengan jadwal kerja.",
    "Universitas Terbuka",
    "https://www.ut.ac.id/",
  ],
  [
    "usaha-mandiri",
    "Usaha mandiri & proyek kecil",
    "Usaha",
    "Mulai dengan memahami kebutuhan orang lain, mencoba ide, dan menimbang risiko.",
    "Usaha dapat dimulai dengan proyek belajar kecil, tanpa harus mengeluarkan modal besar. Kenali calon pengguna, biaya, pembagian waktu, dan risiko. Diskusikan dengan orang dewasa tepercaya sebelum membuat komitmen keuangan.\n\nPersiapan XI: coba ide sederhana dalam kegiatan sekolah. Persiapan XII: catat kebutuhan, biaya, dan dukungan yang tersedia. Pelajari informasi usaha dari sumber pemerintah.\n\nTidak ada janji penghasilan atau keberhasilan otomatis.",
    "Kementerian UMKM",
    "https://umkm.go.id/",
  ],
];
const professions = [
  [
    "R",
    "Teknisi listrik",
    "Mempelajari instalasi dan perawatan dengan perhatian pada keselamatan.",
    "47-2111.00",
  ],
  [
    "R",
    "Teknisi otomotif",
    "Memeriksa dan merawat kendaraan dengan alat dan prosedur yang sesuai.",
    "49-3023.00",
  ],
  [
    "R",
    "Teknisi pertanian",
    "Mendukung kegiatan pertanian melalui pengamatan dan keterampilan lapangan.",
    "19-4012.00",
  ],
  [
    "I",
    "Analis laboratorium",
    "Mengamati sampel, mencatat hasil, dan mengikuti prosedur laboratorium.",
    "19-4021.00",
  ],
  [
    "I",
    "Analis data",
    "Mengolah data dan menjelaskan pola secara hati-hati.",
    "15-2051.00",
  ],
  [
    "I",
    "Pengembang perangkat lunak",
    "Menyusun dan menguji perangkat lunak untuk membantu pekerjaan.",
    "15-1252.00",
  ],
  [
    "A",
    "Desainer grafis",
    "Menyampaikan gagasan melalui susunan visual.",
    "27-1024.00",
  ],
  [
    "A",
    "Penulis",
    "Mengembangkan gagasan menjadi teks yang dapat dipahami pembaca.",
    "27-3043.00",
  ],
  [
    "A",
    "Fotografer",
    "Merencanakan dan membuat foto untuk beragam kebutuhan.",
    "27-4021.00",
  ],
  [
    "S",
    "Guru",
    "Mendampingi proses belajar dan menyiapkan kegiatan pembelajaran.",
    "25-2031.00",
  ],
  [
    "S",
    "Perawat",
    "Mendukung perawatan dengan pendidikan dan kewenangan profesi yang sesuai.",
    "29-1141.00",
  ],
  [
    "S",
    "Pekerja sosial",
    "Mendampingi individu dan komunitas mengakses dukungan.",
    "21-1021.00",
  ],
  [
    "E",
    "Pengelola usaha",
    "Mengatur kegiatan usaha, kerja sama, serta pertimbangan risiko.",
    "11-1021.00",
  ],
  [
    "E",
    "Staf pemasaran",
    "Mempelajari kebutuhan pengguna dan menyampaikan informasi produk.",
    "13-1161.00",
  ],
  [
    "E",
    "Koordinator acara",
    "Merencanakan kegiatan dan mengoordinasikan tim.",
    "13-1121.00",
  ],
  [
    "C",
    "Staf administrasi",
    "Menata dokumen dan membantu alur kerja organisasi.",
    "43-9061.00",
  ],
  [
    "C",
    "Staf pembukuan",
    "Mencatat transaksi dengan teliti dan mengikuti prosedur.",
    "43-3031.00",
  ],
  [
    "C",
    "Petugas logistik",
    "Mencatat dan membantu pengaturan aliran barang.",
    "43-5071.00",
  ],
];
export async function seedContent(db, schoolId) {
  const insert = async (item) =>
    db.query(
      "INSERT INTO content_items(school_id,slug,title,kind,category,riasec,summary,body,status,sources,reviewer,reviewed_at,valid_until,demo) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'published',$9,'Peninjau demo — perlu validasi ahli',CURRENT_DATE,CURRENT_DATE+90,true) ON CONFLICT(slug) DO NOTHING",
      [
        schoolId,
        item.slug,
        item.title,
        item.kind,
        item.category,
        item.riasec || null,
        item.summary,
        item.body,
        JSON.stringify(item.sources),
      ],
    );
  for (const [
    slug,
    title,
    category,
    summary,
    body,
    sourceTitle,
    url,
  ] of pathways)
    await insert({
      slug,
      title,
      category,
      summary,
      body,
      kind: "pathway",
      sources: [{ title: sourceTitle, url }],
    });
  for (const [riasec, title, summary, code] of professions)
    await insert({
      slug: title.toLowerCase().replaceAll(" ", "-"),
      title,
      riasec,
      category: riasec === "E" ? "Usaha" : "Kerja",
      summary,
      kind: "profession",
      body: `${summary}\n\nContoh eksplorasi editorial kelompok ${riasec}; bukan tipe atau kecocokan siswa. Jalur pendidikan, sertifikasi, dan kewenangan berbeda menurut pekerjaan serta wilayah.\n\nCoba: cari pengalaman belajar kecil, tanyakan aktivitas harian pada praktisi, dan diskusikan beberapa jalur pendidikan.\n\nSumber O*NET mendeskripsikan pekerjaan dalam konteks Amerika Serikat. Materi dan persyaratan Indonesia memerlukan tinjauan ahli BK; jangan memakai kartu ini sebagai persyaratan profesi resmi.`,
      sources: [
        {
          title: "O*NET OnLine — deskripsi pekerjaan (konteks AS)",
          url: `https://www.onetonline.org/link/summary/${code}`,
        },
      ],
    });
  await insert({
    slug: "cerita-langkah-contoh",
    title: "Cerita Langkah: mencoba sebelum memilih",
    kind: "story",
    category: "Kerja",
    summary: "Cerita simulasi, bukan testimoni alumni nyata.",
    body: "CERITA FIKTIF UNTUK DEMONSTRASI\n\nDara mencoba membantu membuat poster kegiatan sekolah. Ia menyukai proses menggambar, tetapi juga ingin memahami cara orang bekerja dalam tim. Dara mencatat pertanyaan dan membandingkan kuliah desain, pelatihan, serta proyek kecil. Ia belum menentukan pilihan akhir dan berdiskusi dengan guru BK.\n\nTidak ada identitas, pengalaman, atau izin alumni nyata yang digunakan. Cerita nyata hanya boleh diterbitkan setelah izin dan tinjauan sekolah.",
    sources: [
      { title: "Panduan eksplorasi umum", url: "https://www.onetonline.org/" },
    ],
  });
  await insert({
    slug: "ngobrol-dengan-orang-tua",
    title: "Ngobrol dengan Orang Tua",
    kind: "worksheet",
    category: "Kuliah",
    summary:
      "Lembar diskusi kosong untuk berbicara tentang minat, dukungan, dan langkah kecil.",
    body: "Apa kegiatan yang membuatku penasaran?\nPilihan apa yang ingin kupelajari?\nDukungan apa yang kuperlukan?\nApa kekhawatiran kami dan pertanyaan yang perlu dijawab?\nSatu langkah kecil apa yang akan kucoba?\n\nTidak perlu menulis informasi keuangan rinci atau hal pribadi yang belum nyaman dibagikan. Buka lembar kerja cetak dari menu bantuan.",
    sources: [
      { title: "Rujukan eksplorasi", url: "https://www.onetonline.org/" },
    ],
  });
}

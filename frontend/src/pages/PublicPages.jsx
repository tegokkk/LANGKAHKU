import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Compass,
  Scale,
  ListChecks,
  LockKeyhole,
  ShieldCheck,
  BookOpen,
  Users,
  Download,
  Printer,
  Check,
  ExternalLink,
  Trash2,
  ArrowRight,
  Sparkles,
  MessagesSquare,
} from "lucide-react";
import { useResource, useOnline } from "../hooks/useResource";
import {
  downloadedContent,
  downloadContent,
  removeContent,
} from "../services/offline";
import {
  PageTitle,
  Banner,
  Button,
  Badge,
  Loading,
  Empty,
  usePanel,
  date,
} from "../components/ui";
import Reveal from "../components/ui/Reveal";

export function AboutPage() {
  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="TENTANG LANGKAHKU"
        title="Langkah kecil, arah yang lebih jelas."
        actions={
          <Link className="button" to="/peta-jalur">
            <Compass size={18} aria-hidden="true" />
            Jelajahi Peta Jalur
          </Link>
        }
      >
        Website pendamping perencanaan karier bagi siswa SMA kelas XI dan XII,
        terhubung dengan layanan bimbingan dan konseling di sekolah.
      </PageTitle>

      <Reveal className="two-grid">
        <article className="surface card stack-sm">
          <span className="eyebrow">TUJUAN LAYANAN</span>
          <h2>Jembatan antara refleksi mandiri dan pendampingan guru BK.</h2>
          <p>
            Banyak siswa SMA merasa bingung menentukan arah setelah lulus karena
            belum mengenali minat dan kekuatan diri, informasi kuliah maupun
            kerja tersebar di banyak tempat, atau sungkan memulai percakapan
            dengan guru BK.
          </p>
          <p>
            LANGKAHKU menyediakan ruang kerja bertahap—mulai dari{" "}
            <strong>Kenali Diriku</strong>, <strong>Peta Jalur</strong>,{" "}
            <strong>Timbang Pilihan</strong>, hingga{" "}
            <strong>Rencana Langkahku</strong>—agar siswa memiliki draf rencana
            yang dapat terus direvisi dan didiskusikan bersama orang tua serta
            guru BK.
          </p>
        </article>

        <article className="surface card peach stack-sm">
          <span className="eyebrow">PRINSIP PENDAMPINGAN</span>
          <h2>Menjaga otonomi siswa dan kesetaraan setiap jalur.</h2>
          <div className="stack-sm">
            {[
              "Kuliah, kerja langsung, kuliah sambil kerja, dan usaha mandiri dipandang setara.",
              "Hasil utama berupa draf rencana semester yang dapat diperbarui kapan saja.",
              "Bahasa yang ramah remaja, satu tugas utama per layar, tanpa tekanan ujian.",
              "Mendukung akses luring untuk konten publik dan lembar kerja PDF/cetak A4.",
            ].map((item) => (
              <div className="check-item" key={item}>
                <Check size={18} aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </article>
      </Reveal>

      <Reveal className="surface card">
        <span className="eyebrow">BATAS CAKUPAN PRODUK (V1)</span>
        <h2>Apa yang tidak dilakukan oleh LANGKAHKU.</h2>
        <p>
          Untuk melindungi siswa dari pelabelan sempit dan menjaga peran
          konselor manusia di sekolah, LANGKAHKU secara tegas membatasi hal
          berikut:
        </p>
        <div className="three-grid space-top-sm">
          {[
            [
              "Bukan tes psikologi atau penentu otomatis",
              "Tidak menghitung skor kecocokan karier, persentase tipe kepribadian pasti, peringkat siswa, ataupun rekomendasi jurusan otomatis.",
            ],
            [
              "Bukan chatbot AI atau pemindai jurnal",
              "Pesan pendamping ditulis dan ditinjau manusia. Isi jurnal privat tidak pernah dipindai algoritma maupun dianalisis sentimen.",
            ],
            [
              "Bukan layanan darurat 24 jam",
              "Formulir Sapa Guru BK digunakan untuk mengawali penjadwalan tatap muka pada jam layanan sekolah, bukan chat langsung 24 jam.",
            ],
          ].map(([title, text]) => (
            <div className="surface note-block stack-sm" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}

export function HowToUsePage() {
  const roles = [
    [
      "Tamu / Pengunjung",
      "sage",
      Compass,
      [
        "Buka Peta Jalur, Cerita Langkah, dan Panduan Orang Tua tanpa perlu membuat akun.",
        "Gunakan pencarian dan filter kategori (Kuliah, Kerja, Kuliah + Kerja, Usaha) untuk membaca syarat umum dan rujukan resmi.",
        "Simpan materi publik terpilih agar tetap dapat dibaca saat luring, atau unduh lembar kerja PDF kosong untuk dicetak.",
      ],
    ],
    [
      "Siswa SMA (Kelas XI & XII)",
      "blush",
      Heart,
      [
        "Daftar akun mandiri dengan username, kata sandi, nama panggilan, kelas/semester, sekolah, dan kategori usia (tanpa email/telepon/NISN).",
        "Simpan kode pemulihan sekali pakai yang muncul saat pendaftaran, lalu pantau status persetujuan superadmin dan verifikasi izin wali.",
        "Setelah akun aktif, gunakan Kenali Diriku, Peta Jalur, Timbang Pilihan, Rencana Langkahku, dan Jurnal Langkahku dengan ritmemu sendiri.",
        "Ajukan konsultasi di Sapa Guru BK dengan memilih sendiri ringkasan yang ingin dibagikan (semua kosong secara bawaan dan dapat dicabut).",
      ],
    ],
    [
      "Guru BK",
      "lavender",
      MessagesSquare,
      [
        "Masuk menggunakan akun BK yang dibuat oleh superadmin sekolah.",
        "Kelola antrean permintaan konsultasi yang ditugaskan, baca snapshot ringkasan yang diizinkan siswa, dan konfirmasi jadwal pertemuan.",
        "Tinjau Agregat Kebutuhan kelompok apabila ukuran kelompok memenuhi batas perlindungan privasi (minimal 10 siswa, minimal 5 per sel).",
        "Kurasi kartu jalur, profesi, cerita, dan lembar kerja beserta sumber HTTPS resmi, peninjau, serta jam layanan sekolah.",
      ],
    ],
    [
      "Superadmin Sekolah",
      "peach",
      ShieldCheck,
      [
        "Tinjau antrean pendaftaran siswa di sekolahnya, lalu berikan keputusan Setujui atau Tolak beserta alasan operasional yang sopan.",
        "Catat verifikasi izin wali secara terpisah bagi siswa di bawah 18 tahun menggunakan referensi dokumen sekolah tanpa mengunggah berkas identitas.",
        "Buat dan kelola status aktif/nonaktif akun Guru BK serta catat jadwal angkatan untuk kebijakan retensi data sekolah.",
        "Superadmin hanya mengelola administrasi akun dan tidak memiliki akses ke jurnal, refleksi, maupun isi konsultasi siswa.",
      ],
    ],
  ];

  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="CARA MENGGUNAKAN"
        title="Panduan langkah demi langkah untuk setiap peran."
        actions={
          <Link className="button" to="/daftar">
            Daftar akun siswa
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        }
      >
        Pahami alur penggunaan LANGKAHKU mulai dari eksplorasi publik,
        pendaftaran akun, hingga pendampingan di sekolah.
      </PageTitle>

      <div className="two-grid">
        {roles.map(([title, tint, Icon, steps]) => (
          <Reveal as="article" className="surface card stack" key={title}>
            <div className="section-heading">
              <span className={`icon-tile ${tint}`}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className={`pill ${tint}`}>{title}</span>
            </div>
            <h2>{title}</h2>
            <div className="stack-sm">
              {steps.map((step, i) => (
                <div className="check-item" key={i}>
                  <strong>{i + 1}.</strong>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export function StoriesPage() {
  const resource = useResource("/public/content?kind=story");
  const { openPanel } = usePanel();
  const items = resource.data?.items || [];

  const openStory = (item) =>
    openPanel(
      item.title,
      <div className="stack">
        <span className="pill lavender">Cerita Langkah · {item.category}</span>
        {item.demo && (
          <Banner type="warning">
            Cerita simulasi untuk demonstrasi pengembangan. Kisah alumni nyata
            memerlukan persetujuan tertulis dan anonimisasi sebelum diterbitkan.
          </Banner>
        )}
        <p className="lead">{item.summary}</p>
        <div className="prose-text">{item.body}</div>
        <div className="separated">
          <h3>Sumber & peninjauan</h3>
          {item.sources?.map((s) => (
            <a
              className="source-link"
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noreferrer"
            >
              {s.title}
              <ExternalLink size={16} aria-hidden="true" />
            </a>
          ))}
          <small>
            Peninjau: {item.reviewer} · Ditinjau {date(item.reviewed_at)} ·
            Versi {item.version}
          </small>
        </div>
      </div>,
    );

  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="CERITA LANGKAH"
        title="Belajar dari perjalanan mereka yang pernah berada di posisimu."
        actions={
          <Link className="button secondary" to="/peta-jalur">
            Kembali ke Peta Jalur
          </Link>
        }
      >
        Kisah reflektif tentang menimbang pilihan setelah SMA—mulai dari kuliah,
        pelatihan kerja, hingga kuliah sambil bekerja.
      </PageTitle>

      <Banner icon={<Sparkles size={18} aria-hidden="true" />}>
        Setiap cerita di halaman ini bukan patokan tunggal yang harus ditiru.
        Materi simulasi diberi penanda khusus sampai sekolah menerbitkan kisah
        alumni nyata yang telah mendapatkan izin dan dianonimkan.
      </Banner>

      {resource.error && <Banner type="error">{resource.error}</Banner>}

      {resource.loading ? (
        <Loading />
      ) : !items.length ? (
        <Empty title="Belum ada Cerita Langkah terbit">
          Guru BK dapat menambahkan dan menerbitkan cerita melalui ruang kelola
          konten.
        </Empty>
      ) : (
        <div className="two-grid">
          {items.map((item) => (
            <Reveal
              as="article"
              className="surface card catalog-card"
              key={item.id}
            >
              <div className="section-heading">
                <span className="pill lavender">
                  Cerita Langkah · {item.category}
                </span>
                {item.demo && (
                  <Badge status="review">Materi demo / simulasi</Badge>
                )}
              </div>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
              <div className="prose-text story-excerpt">{item.body}</div>
              <div className="catalog-card-footer">
                <span>
                  Ditinjau {date(item.reviewed_at)} · Versi {item.version}
                </span>
                <Button
                  variant="secondary small"
                  onClick={() => openStory(item)}
                >
                  Baca selengkapnya
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

export function ParentsGuidePage() {
  const worksheets = useResource("/public/content?kind=worksheet");
  const items = worksheets.data?.items || [];

  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="PANDUAN ORANG TUA & WALI"
        title="Mendampingi anak menimbang masa depan dengan percakapan yang hangat."
        actions={
          <a
            className="button"
            href="/worksheets/lembar-kerja-langkahku.pdf"
            download
          >
            <Download size={18} aria-hidden="true" />
            Unduh PDF Lembar Diskusi
          </a>
        }
      >
        Orang tua dan wali adalah mitra utama siswa. Halaman ini menyediakan
        panduan obrolan di rumah tanpa memerlukan akun login khusus orang tua.
      </PageTitle>

      <Reveal className="two-grid">
        <article className="surface card peach stack">
          <span className="eyebrow">EMPAT PERTANYAAN PEMANTIK DI RUMAH</span>
          <h2>Mulai dari mendengarkan, bukan langsung memutuskan.</h2>
          <div className="stack-sm">
            {[
              [
                "1. Kegiatan & minat",
                "“Belakangan ini kegiatan atau pelajaran apa di sekolah yang paling membuatmu bersemangat?”",
              ],
              [
                "2. Dua kemungkinan jalur",
                "“Jika ada dua jalur yang ingin kamu pelajari setelah lulus—baik kuliah, pelatihan kerja, maupun kuliah sambil kerja—apa yang paling ingin kamu ketahui?”",
              ],
              [
                "3. Keadaan & dukungan keluarga",
                "“Batas biaya, lokasi, atau kondisi keluarga apa yang perlu kita bicarakan secara jujur sejak sekarang?”",
              ],
              [
                "4. Satu langkah semester ini",
                "“Satu langkah kecil apa yang bisa kita coba bersama bulan ini, misalnya mencari informasi resmi atau berdiskusi dengan guru BK?”",
              ],
            ].map(([title, question]) => (
              <div className="surface note-block stack-sm" key={title}>
                <strong>{title}</strong>
                <p>{question}</p>
              </div>
            ))}
          </div>
        </article>

        <div className="stack">
          <article className="surface card sage stack-sm">
            <span className="eyebrow">PERSETUJUAN WALI & PRIVASI</span>
            <h2>Bagaimana izin wali dan privasi anak dijaga.</h2>
            <p>
              Bagi siswa berusia di bawah 18 tahun, sekolah memverifikasi izin
              orang tua/wali melalui prosedur resmi sekolah sebelum fitur
              refleksi pribadi diaktifkan.
            </p>
            <p>
              LANGKAHKU <strong>tidak meminta unggahan foto KTP/KK</strong> di
              dalam aplikasi. Orang tua dapat mendiskusikan hasil perencanaan
              melalui lembar ringkasan rencana yang dicetak atau dibagikan
              sendiri oleh siswa, sementara jurnal mingguan tetap menjadi ruang
              privat siswa.
            </p>
          </article>

          <article className="surface card stack-sm">
            <span className="eyebrow">LEMBAR KERJA CETAK & MATERI</span>
            <h2>Alternatif diskusi di atas kertas (A4).</h2>
            <p>
              Gunakan lembar kerja cetak apabila keluarga lebih nyaman
              berdiskusi tanpa layar ponsel.
            </p>
            {items.map((item) => (
              <div className="surface note-block stack-sm" key={item.id}>
                <div className="section-heading">
                  <strong>{item.title}</strong>
                  {item.demo && <span className="pill">Materi demo</span>}
                </div>
                <p>{item.summary}</p>
              </div>
            ))}
            <div className="landing-actions">
              <a
                className="button secondary"
                href="/worksheets/lembar-langkahku.html"
                target="_blank"
                rel="noreferrer"
              >
                <Printer size={18} aria-hidden="true" />
                Buka versi siap cetak
              </a>
              <a
                className="button ghost"
                href="/worksheets/lembar-kerja-langkahku.pdf"
                download
              >
                Unduh PDF kosong (7 halaman A4)
              </a>
            </div>
          </article>
        </div>
      </Reveal>
    </div>
  );
}

export function FaqPage() {
  const groups = [
    [
      "Akun, Pendaftaran & Pemulihan",
      [
        [
          "Mengapa pendaftaran siswa tidak meminta email, nomor telepon, atau NISN?",
          "Untuk meminimalkan pengumpulan data pribadi siswa. Siswa cukup membuat username unik, kata sandi minimal 12 karakter, nama panggilan, kelas/semester, sekolah, dan kategori usia.",
        ],
        [
          "Bagaimana jika saya lupa kata sandi akun?",
          "Gunakan Kode Pemulihan sekali pakai yang diberikan saat pendaftaran pada menu Pemulihan di halaman Masuk. Setiap pemulihan akan menerbitkan kode baru dan mencabut sesi lama. Bila kode hilang, hubungi petugas sekolah untuk verifikasi langsung (prosedur manual sekolah wajib ditetapkan sebelum penggunaan data nyata).",
        ],
        [
          "Bisakah guru BK atau superadmin mendaftar sendiri lewat halaman daftar publik?",
          "Tidak. Pendaftaran publik hanya membuat akun siswa dengan status menunggu persetujuan. Akun superadmin pertama dibuat melalui CLI sekolah, dan akun guru BK dibuat oleh superadmin sekolah.",
        ],
      ],
    ],
    [
      "Persetujuan Superadmin & Izin Wali",
      [
        [
          "Mengapa akun saya masih berstatus menunggu setelah disetujui superadmin?",
          "Persetujuan akun oleh superadmin dan verifikasi izin orang tua/wali adalah dua gerbang yang terpisah. Bagi siswa di bawah 18 tahun, akun baru aktif sepenuhnya setelah keduanya terpenuhi. Selama menunggu, kamu tetap bebas membaca Peta Jalur.",
        ],
        [
          "Apa yang terjadi jika pendaftaran saya ditolak?",
          "Kamu akan melihat alasan operasional yang ditulis dengan sopan pada halaman Cek Status dan dapat menghubungi petugas sekolah atau membatalkan pendaftaran dari Pengaturan Akun.",
        ],
      ],
    ],
    [
      "Fitur, Privasi & Konsultasi BK",
      [
        [
          "Apakah hasil Kenali Diriku atau Timbang Pilihan menentukan jurusan saya?",
          "Tidak. Kenali Diriku merangkum jawabanmu sendiri tanpa tambahan tafsir otomatis, dan Timbang Pilihan menampilkan matriks pertimbangan tanpa menjumlahkan skor atau memilih pemenang.",
        ],
        [
          "Siapa saja yang bisa membaca Jurnal Langkahku?",
          "Hanya kamu sendiri sebagai siswa pemilik akun. Guru BK, superadmin sekolah, maupun siswa lain ditolak oleh server bila mencoba mengakses jurnal.",
        ],
        [
          "Bagaimana cara mencabut ringkasan yang sudah saya bagikan ke guru BK?",
          "Buka detail permintaan di halaman Sapa Guru BK, lalu klik Cabut bagian ini atau Cabut seluruh akses ringkasan. Setelah dicabut, isi snapshot langsung dihapus dari tampilan guru BK pada pembacaan berikutnya.",
        ],
      ],
    ],
  ];

  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="PERTANYAAN UMUM (FAQ)"
        title="Jawaban jelas untuk siswa, orang tua, dan guru."
        actions={
          <Link className="button secondary" to="/privasi">
            Kebijakan Privasi & Data
          </Link>
        }
      >
        Temukan penjelasan tentang cara kerja akun, persetujuan, fitur
        perencanaan, hingga batas layanan bimbingan.
      </PageTitle>

      {groups.map(([groupTitle, list]) => (
        <Reveal as="section" className="stack" key={groupTitle}>
          <h2>{groupTitle}</h2>
          <div className="stack">
            {list.map(([q, a]) => (
              <article className="surface card stack-sm" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}

export function PrivacyPage() {
  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="PRIVASI & HAK DATA"
        title="Transparansi penggunaan data dan kendali penuh di tangan siswa."
        actions={
          <Link className="button secondary" to="/masuk">
            Kelola dari akunmu
          </Link>
        }
      >
        Penjelasan ringkas mengenai data apa yang disimpan, siapa yang dapat
        melihatnya, cara mencabut izin berbagi, serta hak ekspor dan hapus data.
      </PageTitle>

      <Banner type="warning">
        Status operasional: jadwal retensi angkatan, prosedur izin wali di
        sekolah, serta kontak bantuan darurat aktual harus disahkan oleh pihak
        sekolah sebelum aplikasi digunakan untuk memproses data siswa nyata.
      </Banner>

      <Reveal className="surface card table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Jenis Data</th>
                <th>Siswa Pemilik</th>
                <th>Guru BK Ditugaskan</th>
                <th>Superadmin Sekolah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="Jenis Data">
                  <strong>Profil & status pendaftaran</strong>
                </td>
                <td data-label="Siswa Pemilik">Baca & ubah profil minimum</td>
                <td data-label="Guru BK Ditugaskan">
                  Nama panggilan & kelas pada permintaan
                </td>
                <td data-label="Superadmin Sekolah">
                  Antrean approval & verifikasi wali
                </td>
              </tr>
              <tr>
                <td data-label="Jenis Data">
                  <strong>Kenali Diriku, Timbang Pilihan, Rencana</strong>
                </td>
                <td data-label="Siswa Pemilik">Penuh (baca, tulis, hapus)</td>
                <td data-label="Guru BK Ditugaskan">
                  Hanya snapshot bagian yang dicentang siswa
                </td>
                <td data-label="Superadmin Sekolah">Tidak ada akses</td>
              </tr>
              <tr>
                <td data-label="Jenis Data">
                  <strong>Jurnal Langkahku</strong>
                </td>
                <td data-label="Siswa Pemilik">
                  <strong>Pemilik saja (100% privat)</strong>
                </td>
                <td data-label="Guru BK Ditugaskan">Tidak ada akses</td>
                <td data-label="Superadmin Sekolah">Tidak ada akses</td>
              </tr>
              <tr>
                <td data-label="Jenis Data">
                  <strong>Agregat kebutuhan kelompok</strong>
                </td>
                <td data-label="Siswa Pemilik">Tidak ditampilkan</td>
                <td data-label="Guru BK Ditugaskan">
                  Hanya jika kelompok ≥ 10 & setiap sel ≥ 5
                </td>
                <td data-label="Superadmin Sekolah">Tidak ada akses bawaan</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Reveal>

      <Reveal className="three-grid">
        <article className="surface card stack-sm">
          <span className="icon-tile blush">
            <LockKeyhole size={20} aria-hidden="true" />
          </span>
          <h3>Berbagi eksplisit & pencabutan</h3>
          <p>
            Saat mengajukan konsultasi, semua kotak centang berbagi ringkasan
            kosong secara bawaan. Ringkasan yang dibagikan disimpan sebagai
            salinan (snapshot) dengan masa berlaku 30 hari dan dapat dicabut
            kapan saja. Perubahan draf pribadi tidak mengubah snapshot lama
            tanpa izin baru.
          </p>
        </article>

        <article className="surface card stack-sm">
          <span className="icon-tile sage">
            <Download size={20} aria-hidden="true" />
          </span>
          <h3>Ekspor & penghapusan mandiri</h3>
          <p>
            Melalui panel Pengaturan Akun, siswa dapat mengunduh data miliknya
            dalam format JSON (pilihan jurnal terpisah dan tidak dicentang
            bawaan) atau menghapus data per fitur maupun seluruh akun setelah
            autentikasi ulang kata sandi.
          </p>
        </article>

        <article className="surface card stack-sm">
          <span className="icon-tile peach">
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <h3>Penyimpanan luring, retensi & backup</h3>
          <p>
            Respons API privat memakai kebijakan <code>no-store</code> dan tidak
            pernah disimpan di cache service worker atau{" "}
            <code>localStorage</code>. Saat hapus akun dikonfirmasi, akses
            langsung diblokir, data aktif dihapus oleh worker (target ≤ 24 jam),
            dan ID tombstone dicatat agar restore backup terenkripsi (batas 30
            hari) tidak menghidupkan kembali data yang telah dihapus.
          </p>
        </article>
      </Reveal>
    </div>
  );
}

export function DownloadsPage() {
  const online = useOnline();
  const catalog = useResource(online ? "/public/content" : null);
  const [downloaded, setDownloaded] = useState([]);
  const [notice, setNotice] = useState("");
  const [busySlug, setBusySlug] = useState("");

  const refreshDownloads = async () => {
    try {
      setDownloaded(await downloadedContent());
    } catch {
      setDownloaded([]);
    }
  };

  useEffect(() => {
    refreshDownloads();
  }, []);

  const allItems = catalog.data?.items || downloaded;

  const handleSave = async (item) => {
    setBusySlug(item.slug);
    setNotice("");
    try {
      await downloadContent(item);
      await refreshDownloads();
      setNotice(
        `"${item.title}" tersimpan untuk dibaca luring di perangkat ini.`,
      );
    } finally {
      setBusySlug("");
    }
  };

  const handleRemove = async (slug, title) => {
    setBusySlug(slug);
    setNotice("");
    try {
      await removeContent(slug);
      await refreshDownloads();
      setNotice(`Unduhan "${title}" dihapus dari perangkat.`);
    } finally {
      setBusySlug("");
    }
  };

  return (
    <div className="stack-xl">
      <PageTitle
        eyebrow="UNDUHAN & AKSES LURING"
        title="Bawa materi publik dan lembar kerja untuk dibaca tanpa kuota."
        actions={
          <Link className="button secondary" to="/peta-jalur">
            Buka katalog Peta Jalur
          </Link>
        }
      >
        Hanya materi publik dan lembar kerja kosong yang disimpan di perangkat.
        Data refleksi pribadi, jurnal, dan pengiriman konsultasi tetap
        memerlukan internet.
      </PageTitle>

      {notice && <Banner type="success">{notice}</Banner>}

      <Reveal className="two-grid">
        <article className="surface card peach stack-sm">
          <span className="eyebrow">LEMBAR KERJA CETAK / PDF KOSONG</span>
          <h2>Paket Lembar Kerja LANGKAHKU (A4).</h2>
          <p>
            Memuat refleksi enam langkah, panduan menelusuri jalur, matriks
            Timbang Pilihan, tabel Rencana Langkahku empat semester, serta
            lembar diskusi bersama orang tua.
          </p>
          <div className="landing-actions">
            <a
              className="button"
              href="/worksheets/lembar-kerja-langkahku.pdf"
              download
            >
              <Download size={18} aria-hidden="true" />
              Unduh PDF (7 Halaman A4)
            </a>
            <a
              className="button white"
              href="/worksheets/lembar-langkahku.html"
              target="_blank"
              rel="noreferrer"
            >
              <Printer size={18} aria-hidden="true" />
              Buka halaman siap cetak
            </a>
          </div>
        </article>

        <article className="surface card sage stack-sm">
          <span className="eyebrow">STATUS PENYIMPANAN PERANGKAT</span>
          <h2>{downloaded.length} materi publik tersimpan luring.</h2>
          <p>
            Materi yang sudah kamu unduh dapat dibuka kembali dari halaman ini
            atau dari Peta Jalur saat perangkat sedang dalam mode pesawat /
            tanpa sinyal. Tautan ke situs eksternal resmi tetap membutuhkan
            sambungan internet.
          </p>
        </article>
      </Reveal>

      <Reveal as="section" className="stack">
        <div className="section-heading">
          <div>
            <h2>Daftar paket materi publik</h2>
            <p>
              Pilih materi jalur, profesi, cerita, atau lembar kerja yang ingin
              kamu simpan di browser perangkat ini.
            </p>
          </div>
          <span>{allItems.length} materi tersedia</span>
        </div>

        {catalog.loading && online ? (
          <Loading />
        ) : !allItems.length ? (
          <Empty title="Belum ada materi yang dimuat">
            Hubungkan perangkat ke internet untuk melihat dan mengunduh materi
            katalog publik.
          </Empty>
        ) : (
          <div className="catalog-grid">
            {allItems.map((item) => {
              const saved = downloaded.find((d) => d.slug === item.slug);
              const outdated = saved && saved.version < item.version;
              return (
                <article className="surface card catalog-card" key={item.slug}>
                  <div className="section-heading">
                    <span className="pill">{item.category}</span>
                    {saved ? (
                      <Badge status={outdated ? "review" : "published"}>
                        {outdated ? "Perlu diperbarui" : "Tersedia luring"}
                      </Badge>
                    ) : (
                      <span className="pill">Versi {item.version}</span>
                    )}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {saved?.downloadedAt && (
                    <div className="catalog-card-meta">
                      <small>
                        Diunduh {date(saved.downloadedAt, true)} · Versi{" "}
                        {saved.version}
                      </small>
                    </div>
                  )}
                  <div className="catalog-card-footer">
                    <Button
                      variant={saved && !outdated ? "secondary small" : "small"}
                      disabled={busySlug === item.slug}
                      onClick={() => handleSave(item)}
                    >
                      <Download size={16} aria-hidden="true" />
                      {saved
                        ? outdated
                          ? "Perbarui luring"
                          : "Simpan ulang"
                        : "Unduh luring"}
                    </Button>
                    {saved && (
                      <Button
                        variant="ghost danger small"
                        disabled={busySlug === item.slug}
                        onClick={() => handleRemove(item.slug, item.title)}
                        aria-label={`Hapus unduhan ${item.title}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        Hapus
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Reveal>
    </div>
  );
}

import { Link, Navigate } from "react-router-dom";
import {
  Heart,
  Compass,
  Scale,
  ListChecks,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Check,
  ArrowRight,
  MessagesSquare,
  BookOpen,
  Download,
  Users,
  CircleHelp,
  GraduationCap,
  BriefcaseBusiness,
  Leaf,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource } from "../hooks/useResource";
import { Loading, Empty, Badge, Button, usePanel, date } from "../components/ui";
import TextRoll from "../components/ui/TextRoll";
import Reveal from "../components/ui/Reveal";

const spaces = [
  [
    "Langkah 01",
    "Kenali Diriku",
    "Enam tahap refleksi minat, pelajaran yang dinikmati, kekuatan, nilai kerja, dan kondisi dukungan tanpa skor tes.",
    "/kenali-diriku",
    Heart,
    "blush",
  ],
  [
    "Langkah 02",
    "Peta Jalur",
    "Eksplorasi jalur kuliah, kerja, kuliah sambil kerja, usaha mandiri, dan profesi dengan rujukan sumber resmi.",
    "/peta-jalur",
    Compass,
    "sage",
  ],
  [
    "Langkah 03",
    "Timbang Pilihan",
    "Bandingkan 2–3 pilihan berdasarkan minat, kemampuan, biaya, dukungan keluarga, dan peluang tanpa penentu otomatis.",
    "/timbang-pilihan",
    Scale,
    "lavender",
  ],
  [
    "Langkah 04",
    "Rencana Langkahku",
    "Susun tujuan utama, rencana cadangan, serta checklist langkah kecil per semester XI dan XII yang siap dicetak.",
    "/rencana",
    ListChecks,
    "peach",
  ],
];

const iconFor = {
  Kuliah: GraduationCap,
  Kerja: BriefcaseBusiness,
  "Kuliah + Kerja": Compass,
  Usaha: Leaf,
};

const faqs = [
  [
    "Apakah LANGKAHKU menentukan jurusan atau pekerjaan secara otomatis?",
    "Tidak. LANGKAHKU adalah ruang refleksi dan perencanaan mandiri. Tidak ada skor kecocokan, label psikologis pasti, atau keputusan karier otomatis.",
  ],
  [
    "Mengapa akun siswa memerlukan persetujuan superadmin dan verifikasi wali?",
    "Untuk menjaga ruang sekolah tetap aman tanpa meminta email, nomor telepon, atau NISN. Persetujuan akun dan verifikasi izin wali (bagi siswa di bawah 18 tahun) diperiksa secara terpisah.",
  ],
  [
    "Apakah guru BK bisa membaca jurnal privat saya?",
    "Tidak. Jurnal Langkahku 100% privat bagi siswa pemilik. Guru BK hanya melihat ringkasan refleksi, perbandingan, atau rencana yang secara sadar kamu centang saat mengajukan konsultasi.",
  ],
  [
    "Bisakah saya menjelajahi informasi jalur tanpa mendaftar akun?",
    "Ya. Pengunjung dan tamu dapat membaca katalog Peta Jalur, Cerita Langkah, Panduan Orang Tua, serta mengunduh materi publik untuk dibaca luring.",
  ],
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const catalog = useResource("/public/content");
  const { openPanel } = usePanel();

  if (loading) return <Loading />;
  if (user?.active) return <Navigate to={user.destination} replace />;

  const items = catalog.data?.items || [];
  const featuredPathways = items
    .filter((x) => x.kind === "pathway" || x.kind === "profession")
    .slice(0, 6);

  const openPreview = (item) =>
    openPanel(
      item.title,
      <div className="stack">
        <span className="pill sage">
          {item.category}
          {item.riasec ? ` · Kelompok ${item.riasec}` : ""}
        </span>
        {item.demo && (
          <div className="surface banner warning">
            <div className="banner-body">
              Materi demonstrasi. Perlu tinjauan ahli sebelum penggunaan nyata.
            </div>
          </div>
        )}
        <p className="lead">{item.summary}</p>
        <div className="prose-text">{item.body}</div>
        <div className="separated">
          <small>
            Peninjau: {item.reviewer || "Tim sekolah"} · Ditinjau{" "}
            {date(item.reviewed_at)} · Versi {item.version}
          </small>
        </div>
        <Link className="button" to="/peta-jalur">
          Buka di Peta Jalur
        </Link>
      </div>,
    );

  return (
    <div className="landing-page stack-xl">
      <section className="surface landing-hero">
        <div className="access-intro">
          <span className="eyebrow pill sage hero-stagger-1">
            <Sparkles size={15} aria-hidden="true" /> RUANG UNTUK MENEMUKAN
            ARAHMU
          </span>
          <h1 className="hero-stagger-2">
            <TextRoll>Masa depanmu,</TextRoll>
            <br />
            <span>
              <TextRoll>dimulai dari</TextRoll>
              <br />
              <TextRoll>satu langkah.</TextRoll>
            </span>
          </h1>
          <p className="hero-stagger-3">
            Kenali dirimu, jelajahi pilihan kuliah maupun kerja, dan susun
            langkah kecil menuju masa depan. Pelan-pelan, bersama guru BK
            sekolahmu.
          </p>
          <div className="landing-actions hero-stagger-4">
            {user ? (
              <Link className="button" to="/status">
                Lihat status akun
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link className="button" to="/daftar">
                  Daftar siswa
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link className="button secondary" to="/masuk">
                  Masuk
                </Link>
              </>
            )}
            <Link className="button ghost" to="/peta-jalur">
              <Compass size={18} aria-hidden="true" />
              Jelajah jalur
            </Link>
          </div>
        </div>

        <div className="landing-visual hero-stagger-3">
          <div className="surface journey-art" aria-hidden="true">
            <div className="art-orbit float-slow" />
            <div className="art-orbit second float-slow-reverse" />
            <span className="art-ball float-gentle" />
            <span className="art-small-ball float-gentle-delayed" />
            <div className="art-caption">
              Setiap orang punya jalannya sendiri.
              <strong>Temukan langkah yang berarti bagimu.</strong>
            </div>
          </div>

          <div className="intro-features">
            {[
              [
                Heart,
                "Kenali dirimu",
                "Refleksi diri tanpa tes atau skor.",
                "blush",
              ],
              [
                Compass,
                "Jelajahi pilihan",
                "Katalog jalur kuliah, kerja, dan usaha.",
                "sage",
              ],
              [
                LockKeyhole,
                "Privasi terjaga",
                "Jurnal privat hanya untuk dirimu.",
                "peach",
              ],
            ].map(([Icon, label, desc, tint]) => (
              <div key={label} className={`surface ${tint}`}>
                <Icon size={20} aria-hidden="true" />
                <strong>{label}</strong>
                <small>{desc}</small>
              </div>
            ))}
          </div>

          <div className="surface access-note blush">
            <ShieldCheck size={22} aria-hidden="true" />
            <div>
              <strong>Ruangmu, pilihanmu.</strong>
              <p>
                Ini pendamping refleksi, bukan tes atau penentu karier otomatis.
                Kamu tetap memegang arah bersama orang tua dan guru BK.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Reveal as="section" className="landing-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">MENGAPA LANGKAHKU</span>
            <h2>Merencanakan masa depan tanpa rasa tertekan.</h2>
            <p>
              Dirancang untuk siswa SMA kelas XI dan XII agar dapat mengenali
              diri dan menyusun langkah nyata dengan tenang.
            </p>
          </div>
          <Link className="button secondary small" to="/tentang">
            Pelajari tentang LANGKAHKU
          </Link>
        </div>
        <div className="three-grid">
          {[
            [
              Heart,
              "Setara & tidak menghakimi",
              "Kuliah, kerja langsung, kuliah sambil kerja, maupun merintis usaha dipandang setara. Tidak ada label gagal atau tidak cocok.",
              "blush",
            ],
            [
              BookOpen,
              "Informasi ringkas & bersumber",
              "Setiap kartu jalur dan profesi mencantumkan rujukan portal resmi, peninjau, serta batas waktu peninjauan ulang.",
              "sage",
            ],
            [
              Download,
              "Ringan & ramah kuota",
              "Materi publik dapat disimpan untuk dibaca luring di ponsel, dilengkapi lembar kerja PDF/cetak A4 untuk diskusi di rumah.",
              "peach",
            ],
          ].map(([Icon, title, text, tint]) => (
            <article
              className="surface card card-interactive stack-sm"
              key={title}
            >
              <span className={`icon-tile ${tint}`}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="landing-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">EMPAT RUANG EKSPLORASI</span>
            <h2>
              Satu alur yang saling terhubung, bebas kamu mulai dari mana saja.
            </h2>
            <p>
              Urutan ini membantu memetakan pikiranmu, namun tidak ada menu yang
              dikunci.
            </p>
          </div>
        </div>
        <div className="four-grid space-cards">
          {spaces.map(([step, title, text, to, Icon, color]) => (
            <article
              key={title}
              className={`surface card card-interactive ${color}`}
            >
              <div className="section-heading">
                <span className="pill white">{step}</span>
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link
                className="button white"
                to={to === "/peta-jalur" ? to : user ? to : "/masuk"}
              >
                {to === "/peta-jalur"
                  ? "Jelajahi katalog"
                  : "Mulai langkah ini"}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="landing-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CARA MENGGUNAKAN</span>
            <h2>Mulai dengan rasa aman dalam tiga tahap.</h2>
          </div>
          <Link className="button secondary small" to="/cara-menggunakan">
            Panduan lengkap penggunaan
          </Link>
        </div>
        <div className="three-grid">
          {[
            [
              "1. Jelajah atau daftar mandiri",
              "Baca Peta Jalur sebagai tamu kapan saja, atau buat akun siswa cukup dengan username dan nama panggilan tanpa email, telepon, maupun NISN.",
            ],
            [
              "2. Ditinjau sekolah & izin wali",
              "Superadmin sekolah menyetujui pendaftaran siswa. Untuk kategori usia di bawah 18 tahun, verifikasi izin wali dicatat secara terpisah oleh sekolah.",
            ],
            [
              "3. Refleksi, susun rencana & diskusi",
              "Isi refleksi, timbang opsi, susun langkah semester, catat jurnal privat, dan ajukan pertemuan dengan guru BK saat membutuhkan teman diskusi.",
            ],
          ].map(([title, text]) => (
            <article
              className="surface card card-interactive stack-sm"
              key={title}
            >
              <span className="icon-tile sage">
                <Check size={20} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="landing-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">CUPLIKAN KATALOG PUBLIK</span>
            <h2>Jalur dan profesi yang dapat langsung kamu pelajari.</h2>
            <p>
              Data dimuat langsung dari katalog terbit. Buka detail untuk
              melihat persiapan kelas XI/XII dan tautan resmi.
            </p>
          </div>
          <Link className="button secondary small" to="/peta-jalur">
            Lihat semua ({catalog.loading ? "…" : items.length} materi)
          </Link>
        </div>
        {catalog.loading ? (
          <Loading />
        ) : featuredPathways.length === 0 ? (
          <Empty title="Materi sedang disiapkan">
            Materi akan tampil setelah diterbitkan oleh pengelola sekolah.
          </Empty>
        ) : (
          <div className="catalog-grid">
            {featuredPathways.map((item, i) => {
              const Icon = iconFor[item.category] || Compass;
              return (
                <article className="surface card catalog-card" key={item.id}>
                  <div className="section-heading">
                    <span
                      className={`icon-tile ${["sage", "peach", "lavender"][i % 3]}`}
                    >
                      <Icon size={23} aria-hidden="true" />
                    </span>
                    <span className="pill">
                      {item.kind === "profession"
                        ? `Profesi · ${item.riasec}`
                        : item.category}
                    </span>
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {item.demo && (
                    <div className="catalog-card-meta">
                      <small>Materi demo · perlu tinjauan ahli</small>
                    </div>
                  )}
                  <div className="catalog-card-footer">
                    <span>Versi {item.version}</span>
                    <Button variant="ghost" onClick={() => openPreview(item)}>
                      Buka ringkasan
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Reveal>

      <Reveal as="section" className="landing-section two-grid">
        <article className="surface card sage stack">
          <span className="eyebrow">
            <MessagesSquare size={16} aria-hidden="true" /> PENDAMPINGAN GURU BK
          </span>
          <h2>Teman diskusi di sekolah, bukan ruang penilaian.</h2>
          <p>
            Melalui <strong>Sapa Guru BK</strong>, siswa dapat mengajukan
            permintaan tatap muka dengan memilih topik dan waktu yang
            memungkinkan. Permintaan ini adalah pintu awal pertemuan di sekolah,
            bukan layanan chat langsung atau pemantauan darurat 24 jam.
          </p>
          <div className="stack-sm">
            <div className="check-item">
              <Check size={18} aria-hidden="true" />
              <span>
                Boleh dikirim <strong>tanpa melampirkan</strong> ringkasan apa
                pun.
              </span>
            </div>
            <div className="check-item">
              <Check size={18} aria-hidden="true" />
              <span>
                Pratinjau menampilkan secara persis data yang akan dibaca guru
                BK sebelum dikirim.
              </span>
            </div>
            <div className="check-item">
              <Check size={18} aria-hidden="true" />
              <span>
                Dilengkapi panduan diskusi hangat bersama orang tua/wali di
                rumah.
              </span>
            </div>
          </div>
          <div className="landing-actions">
            <Link className="button white" to="/panduan-orang-tua">
              <Users size={18} aria-hidden="true" />
              Panduan orang tua
            </Link>
            <Link className="button ghost" to="/cerita-langkah">
              Baca Cerita Langkah
            </Link>
          </div>
        </article>

        <article className="surface card blush stack">
          <span className="eyebrow">
            <LockKeyhole size={16} aria-hidden="true" /> PRIVASI & KENDALI SISWA
          </span>
          <h2>Kamu yang menentukan apa yang ingin dibagikan.</h2>
          <p>
            LANGKAHKU menerapkan prinsip minimisasi data dan kendali penuh di
            tangan siswa. Tidak ada jawaban pribadi yang dibagikan secara
            diam-diam.
          </p>
          <div className="stack-sm">
            <div className="check-item">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                <strong>Jurnal Langkahku selalu privat:</strong> tidak ada
                pilihan berbagi jurnal dan tidak ada endpoint baca bagi guru BK
                maupun superadmin.
              </span>
            </div>
            <div className="check-item">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                <strong>Snapshot eksplisit & dapat dicabut:</strong> semua
                pilihan berbagi kosong secara bawaan dan aksesnya dapat dicabut
                kapan saja.
              </span>
            </div>
            <div className="check-item">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>
                <strong>Hak ekspor & hapus data:</strong> unduh data milikmu
                dalam format JSON atau hapus data per fitur maupun seluruh akun.
              </span>
            </div>
          </div>
          <div className="landing-actions">
            <Link className="button white" to="/privasi">
              Pelajari komitmen privasi
            </Link>
            <Link className="button ghost" to="/unduhan">
              Paket luring & lembar kerja
            </Link>
          </div>
        </article>
      </Reveal>

      <Reveal as="section" className="landing-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PERTANYAAN UMUM</span>
            <h2>Hal yang sering ditanyakan sebelum memulai.</h2>
          </div>
          <Link className="button secondary small" to="/faq">
            <CircleHelp size={16} aria-hidden="true" />
            Lihat semua FAQ
          </Link>
        </div>
        <div className="two-grid">
          {faqs.map(([q, a]) => (
            <article className="surface card stack-sm" key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="surface card peach landing-closing-cta">
        <div>
          <span className="eyebrow">MULAI HARI INI</span>
          <h2>Tidak perlu menunggu semua jawaban siap untuk melangkah.</h2>
          <p>
            Mulai dari mengenal satu hal yang kamu sukai atau membaca satu jalur
            yang membuatmu penasaran.
          </p>
        </div>
        <div className="landing-actions">
          <Link className="button" to={user ? "/status" : "/daftar"}>
            {user ? "Periksa status akun" : "Daftar akun siswa"}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          {!user && (
            <Link className="button white" to="/masuk">
              Masuk akun
            </Link>
          )}
          <Link className="button secondary" to="/peta-jalur">
            Jelajahi Peta Jalur
          </Link>
        </div>
      </Reveal>
    </div>
  );
}

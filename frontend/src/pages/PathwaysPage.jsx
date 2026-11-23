import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Compass,
  GraduationCap,
  BriefcaseBusiness,
  Leaf,
  Download,
  Bookmark,
  Check,
  ExternalLink,
  LockKeyhole,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource, useOnline } from "../hooks/useResource";
import { api } from "../services/api";
import {
  downloadedContent,
  downloadContent,
  removeContent,
} from "../services/offline";
import { blankComparison, blankOption } from "../features/documents";
import {
  PageTitle,
  Button,
  Banner,
  Loading,
  Empty,
  usePanel,
  date,
} from "../components/ui";
const categories = ["all", "Kuliah", "Kerja", "Kuliah + Kerja", "Usaha"];
const iconFor = {
  Kuliah: GraduationCap,
  Kerja: BriefcaseBusiness,
  "Kuliah + Kerja": Compass,
  Usaha: Leaf,
};
export default function PathwaysPage() {
  const { user } = useAuth(),
    online = useOnline(),
    { openPanel } = usePanel(),
    [q, setQ] = useState(""),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("all"),
    [kind, setKind] = useState("all"),
    [riasec, setRiasec] = useState("all"),
    [downloaded, setDownloaded] = useState([]),
    [onlyOffline, setOnlyOffline] = useState(false);
  const resource = useResource(
    online
      ? `/public/content?q=${encodeURIComponent(search)}&category=${encodeURIComponent(category)}&kind=${kind}&riasec=${riasec}`
      : null,
  );
  useEffect(() => {
    const timer = setTimeout(() => setSearch(q), 250);
    return () => clearTimeout(timer);
  }, [q]);
  useEffect(() => {
    downloadedContent()
      .then(setDownloaded)
      .catch(() => {});
  }, []);
  const items =
    online && !onlyOffline
      ? resource.data?.items || []
      : downloaded.filter(
          (x) =>
            (category === "all" || x.category === category) &&
            (kind === "all" || x.kind === kind) &&
            (riasec === "all" || x.riasec === riasec) &&
            `${x.title} ${x.summary}`.toLowerCase().includes(q.toLowerCase()),
        );
  const view = (item) =>
    openPanel(
      item.title,
      <ContentPanel
        item={item}
        onDownload={async () => setDownloaded(await downloadedContent())}
      />,
    );
  return (
    <>
      <PageTitle
        eyebrow="PETA JALUR"
        title="Banyak jalan. Temukan ceritamu."
        actions={
          <Button variant="secondary" onClick={() => setOnlyOffline((v) => !v)}>
            <Download size={18} />
            {onlyOffline
              ? "Kembali ke katalog"
              : `Unduhan (${downloaded.length})`}
          </Button>
        }
      >
        Pelajari kemungkinan setelah SMA. Tidak ada satu jalan yang benar untuk
        semua orang.
      </PageTitle>
      {!user?.active && (
        <Banner icon={<LockKeyhole size={18} aria-hidden="true" />}>
          <span>
            Jelajah bebas tanpa akun. Menyimpan pilihan pribadi memerlukan akun
            siswa aktif.{" "}
            <Link to={user ? "/status" : "/daftar"} className="text-link">
              {user ? "Lihat status akun" : "Daftar siswa"}
            </Link>
          </span>
        </Banner>
      )}
      <div className="surface card catalog-filters">
        <label className="search-input">
          <Search size={21} />
          <input
            aria-label="Cari jalur atau profesi"
            placeholder="Cari jalur, profesi, atau hal yang membuatmu penasaran…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="chip-row">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${category === cat ? "active" : ""}`}
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat === "all" ? "Semua jalur" : cat}
            </button>
          ))}
        </div>
        <div className="filter-secondary">
          <label>
            Jenis{" "}
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="all">Semua materi</option>
              <option value="pathway">Jalur setelah SMA</option>
              <option value="profession">Profesi</option>
              <option value="story">Cerita Langkah</option>
              <option value="worksheet">Lembar kerja</option>
            </select>
          </label>
          <label>
            Kelompok eksplorasi{" "}
            <select value={riasec} onChange={(e) => setRiasec(e.target.value)}>
              <option value="all">Semua kelompok</option>
              {["R", "I", "A", "S", "E", "C"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {resource.error && online && (
        <Banner type="error">
          {resource.error}
          <Button variant="ghost" onClick={resource.reload}>
            Coba lagi
          </Button>
        </Banner>
      )}
      {onlyOffline && (
        <Banner>
          Materi publik yang kamu pilih untuk disimpan. Tautan sumber tetap
          memerlukan internet. Hapus unduhan melalui detail kartu.
        </Banner>
      )}
      <div className="section-heading">
        <h2>
          {onlyOffline ? "Ruang unduhanmu" : "Kemungkinan setelah sekolah"}
        </h2>
        <span>{items.length} materi</span>
      </div>
      {resource.loading && online && !onlyOffline ? (
        <Loading />
      ) : !items.length ? (
        <Empty
          title={
            online &&
            !onlyOffline &&
            !q &&
            category === "all" &&
            kind === "all" &&
            riasec === "all"
              ? "Materi sedang disiapkan"
              : "Belum menemukan yang dicari?"
          }
        >
          {online &&
          !onlyOffline &&
          !q &&
          category === "all" &&
          kind === "all" &&
          riasec === "all" ? (
            <>
              Materi terbit akan muncul setelah ditinjau guru BK. Sambil
              menunggu, gunakan <Link to="/unduhan">lembar kerja</Link> untuk
              mulai berefleksi.
            </>
          ) : (
            "Coba kata lain, hapus filter, atau unduh materi ketika terhubung."
          )}
        </Empty>
      ) : (
        <div className="catalog-grid">
          {items.map((item, i) => {
            const Icon = iconFor[item.category] || Compass;
            const saved = downloaded.find((d) => d.slug === item.slug);
            return (
              <article className="surface card catalog-card" key={item.id}>
                <div className="section-heading">
                  <span
                    className={`icon-tile ${["sage", "peach", "lavender"][i % 3]}`}
                  >
                    <Icon size={25} />
                  </span>
                  <span className="pill">
                    {item.kind === "profession"
                      ? `Profesi · ${item.riasec}`
                      : item.category}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                {(item.demo || item.expired || saved) && (
                  <div className="catalog-card-meta">
                    {item.demo && (
                      <small>Materi demo · perlu tinjauan ahli</small>
                    )}
                    {item.expired && (
                      <span className="badge butter">
                        Perlu peninjauan ulang
                      </span>
                    )}
                    {saved && (
                      <span className="badge sage">
                        {saved.version < item.version
                          ? "Unduhan perlu diperbarui"
                          : "Tersedia luring"}
                      </span>
                    )}
                  </div>
                )}
                <div className="catalog-card-footer">
                  <span>Versi {item.version}</span>
                  <Button variant="ghost" onClick={() => view(item)}>
                    Buka ringkasan
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
function ContentPanel({ item, onDownload }) {
  const { user } = useAuth(),
    online = useOnline(),
    navigate = useNavigate(),
    { closePanel } = usePanel(),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const run = async (action) => {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const add = () =>
    run(async () => {
      if (!user?.active || user.role !== "siswa") {
        setMessage("Daftar atau aktifkan akun siswa untuk menyimpan pilihan.");
        return;
      }
      const result = await api("/student/documents/comparison");
      const saved = result.document,
        data = saved.data || blankComparison();
      const filled = data.options.filter((x) => x.label);
      if (filled.some((x) => x.contentId === item.id)) {
        setMessage("Materi ini sudah ada di pilihanmu.");
        return;
      }
      if (filled.length >= 3) {
        setMessage("Maksimal tiga opsi. Ubah pilihan dari Timbang Pilihan.");
        return;
      }
      const option = {
        ...blankOption(item.title.slice(0, 120)),
        contentId: item.id,
      };
      const options = [...filled, option];
      while (options.length < 2) options.push(blankOption());
      await api("/student/documents/comparison", {
        method: "PUT",
        body: { version: saved.version, data: { options, reviewed: false } },
      });
      setMessage("Ditambahkan ke Timbang Pilihan.");
    });
  return (
    <div className="stack">
      <span className="pill sage">
        {item.category}
        {item.riasec ? ` · Kelompok ${item.riasec}` : ""}
      </span>
      {item.demo && (
        <Banner type="warning">
          Materi demonstrasi. Bukan ketentuan penerimaan atau profesi yang telah
          divalidasi sekolah.
        </Banner>
      )}
      {(item.expired || new Date(item.valid_until) < new Date()) && (
        <Banner type="warning">
          Periode tinjau berakhir. Periksa sumber resmi sebelum memakai
          informasi ini.
        </Banner>
      )}
      <p className="lead">{item.summary}</p>
      <div className="prose-text">{item.body}</div>
      <Banner type="error">{error}</Banner>
      <Banner type="success">{message}</Banner>
      <div className="stack">
        <Button onClick={add} disabled={busy || !online}>
          <Bookmark size={18} />
          Tambahkan ke pilihan
        </Button>
        {user?.active && user.role === "siswa" && (
          <Button
            variant="secondary"
            disabled={busy || !online}
            onClick={() =>
              run(async () => {
                await api("/student/exploration", {
                  method: "POST",
                  body: { contentId: item.id },
                });
                setMessage("Ditandai sudah kupelajari.");
              })
            }
          >
            <Check size={18} />
            Sudah kupelajari
          </Button>
        )}
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await downloadContent(item);
              await onDownload();
              setMessage("Materi publik tersimpan untuk dibaca luring.");
            })
          }
        >
          <Download size={18} />
          {online ? "Unduh / perbarui luring" : "Simpan ulang materi publik"}
        </Button>
        <Button
          variant="ghost"
          onClick={() =>
            run(async () => {
              await removeContent(item.slug);
              await onDownload();
              setMessage("Unduhan dihapus dari perangkat.");
            })
          }
        >
          Hapus unduhan perangkat
        </Button>
      </div>
      <div className="separated">
        <h3>Sumber & peninjauan</h3>
        {item.sources.map((s) => (
          <a
            className="source-link"
            key={s.url}
            href={s.url}
            target="_blank"
            rel="noreferrer"
          >
            {s.title}
            <ExternalLink size={16} />
          </a>
        ))}
        <p>
          Peninjau: {item.reviewer}
          <br />
          Ditinjau {date(item.reviewed_at)} · Versi {item.version}
          <br />
          Tinjau kembali {date(item.valid_until)}
        </p>
        {item.downloadedAt && (
          <small>
            Diunduh {date(item.downloadedAt, true)}. Sumber eksternal tetap
            memerlukan internet.
          </small>
        )}
      </div>
      <Button
        variant="ghost"
        onClick={() => {
          closePanel();
          navigate("/timbang-pilihan");
        }}
      >
        Buka Timbang Pilihan
      </Button>
    </div>
  );
}

import { useState } from "react";
import {
  Search,
  ShieldCheck,
  ChartNoAxesCombined,
  Plus,
  LibraryBig,
  Clock3,
} from "lucide-react";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  PageTitle,
  Button,
  Field,
  Select,
  Textarea,
  Banner,
  Badge,
  Loading,
  Empty,
  ViewTransition,
  date,
} from "../components/ui";
import { ConsultationDetail, sectionLabels } from "./ConsultationPage";
import SnapshotView from "../features/SnapshotView";
export function RequestsPage() {
  const [status, setStatus] = useState("all"),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null),
    resource = useResource(
      `/bk/consultations?status=${status}&q=${encodeURIComponent(q)}&page=${page}`,
    );
  return (
    <>
      <PageTitle eyebrow="RUANG GURU BK" title="Ruang untuk mendengarkan.">
        Tindak lanjuti permintaan yang ditujukan kepada Anda, dengan ringkasan
        yang diizinkan siswa.
      </PageTitle>
      <div className="surface card filter-row">
        <div className="search-field">
          <span>Cari konsultasi</span>
          <label className="search-input">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Cari konsultasi"
              placeholder="Cari nama panggilan atau topik…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        <Select
          label="Status permintaan"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          {[
            ["all", "Semua status"],
            ["submitted", "Diajukan"],
            ["scheduled", "Dijadwalkan"],
            ["reschedule", "Perlu jadwal ulang"],
            ["completed", "Selesai"],
            ["closed", "Ditutup"],
            ["cancelled", "Dibatalkan"],
          ].map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <Banner type="error">{resource.error}</Banner>
      <div className="queue-grid">
        <section>
          <div className="section-heading">
            <h2>Permintaan konsultasi</h2>
            <span>{resource.data?.total || 0} permintaan</span>
          </div>
          <div className="surface card table-card">
            {resource.loading ? (
              <Loading />
            ) : !resource.data?.items.length ? (
              <Empty title="Antrean masih lengang">
                Permintaan yang ditujukan kepada Anda akan muncul di sini.
              </Empty>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Siswa</th>
                      <th>Topik</th>
                      <th>Usulan</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resource.data.items.map((item) => (
                      <tr
                        key={item.id}
                        className={selected === item.id ? "selected" : ""}
                      >
                        <td data-label="Siswa">
                          <button
                            className="table-link"
                            onClick={() => setSelected(item.id)}
                          >
                            <span className="avatar">{item.nickname[0]}</span>
                            <span>
                              <strong>{item.nickname}</strong>
                              <small>
                                Kelas {item.grade} · BK-{item.request_number}
                              </small>
                            </span>
                          </button>
                        </td>
                        <td data-label="Topik">{item.topic}</td>
                        <td data-label="Usulan">{item.availability}</td>
                        <td data-label="Status">
                          <Badge status={item.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination">
              <span>
                Halaman {page} / {resource.data?.pages || 1}
              </span>
              <Button
                variant="secondary small"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="secondary small"
                disabled={page >= (resource.data?.pages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
          <Banner
            type="success"
            icon={<ShieldCheck size={20} aria-hidden="true" />}
          >
            Jurnal dan jawaban asli tetap privat. Ringkasan diperiksa ulang
            izinnya setiap kali dimuat.
          </Banner>
        </section>
        <aside>
          {selected ? (
            <ConsultationDetail
              key={selected}
              id={selected}
              role="bk"
              onUpdate={resource.reload}
            />
          ) : (
            <div className="surface card">
              <Empty title="Pilih permintaan">
                Buka nama siswa untuk melihat detail dan ringkasan berizin.
              </Empty>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
export function AggregatesPage() {
  const resource = useResource("/bk/aggregates");
  const labels = [
    "Belum mulai",
    "Refleksi dikonfirmasi",
    "Eksplorasi ditandai",
    "Pilihan ditinjau",
    "Rencana ditinjau",
  ];
  return (
    <>
      <PageTitle eyebrow="AGREGAT KEBUTUHAN" title="Melihat kebutuhan bersama.">
        Gambaran kelompok untuk merencanakan layanan. Tanpa penelusuran
        individu.
      </PageTitle>
      <Banner
        type="success"
        icon={<ShieldCheck size={20} aria-hidden="true" />}
      >
        Kelompok minimal 10 siswa, setiap sel minimal 5. Jika ada sel kecil,
        seluruh partisi dan total disembunyikan untuk mencegah penghitungan
        balik.
      </Banner>
      <Banner type="error">{resource.error}</Banner>
      {resource.loading ? (
        <Loading />
      ) : (
        resource.data && (
          <>
            <div className="surface card aggregate-scope">
              <span className="pill sage">{resource.data.group}</span>
              <span>{resource.data.period}</span>
              <small>Satuan: {resource.data.unit}</small>
            </div>
            {resource.data.suppressed ? (
              <div className="surface card">
                <Empty title="Data kelompok belum cukup untuk ditampilkan dengan aman.">
                  Angka, total, dan daftar siswa tidak ditampilkan. Tidak ada
                  ukuran kesiapan atau peringkat individu.
                </Empty>
              </div>
            ) : (
              <div className="two-grid">
                <section className="surface card">
                  <h2>Tahap eksplorasi siswa</h2>
                  <p>{resource.data.definition}</p>
                  {resource.data.stages.map((count, i) => (
                    <div className="aggregate-bar-row" key={i}>
                      <div className="section-heading">
                        <span>{labels[i]}</span>
                        <strong>{count} siswa</strong>
                      </div>
                      <div className="progress-track">
                        <span
                          style={{
                            width: `${(count / resource.data.total) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <p className="aggregate-total">
                    Total kelompok: {resource.data.total} siswa
                  </p>
                </section>
                <section className="surface card">
                  <h2>Topik konsultasi bulan ini</h2>
                  {resource.data.topics ? (
                    resource.data.topics.map((item) => (
                      <div className="aggregate-bar-row" key={item.topic}>
                        <div className="section-heading">
                          <span>{item.topic}</span>
                          <strong>{item.count} siswa unik</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Empty title="Topik belum dapat ditampilkan">
                      Sel kecil atau belum ada permintaan. Siswa dapat
                      mengajukan lebih dari satu topik.
                    </Empty>
                  )}
                  <Banner>
                    Agregat menggunakan metadata tahap dan topik. Isi jurnal
                    serta narasi refleksi tidak dibaca untuk membentuk grafik.
                  </Banner>
                </section>
              </div>
            )}
          </>
        )
      )}
    </>
  );
}
const blankContent = () => ({
  title: "",
  slug: "",
  kind: "pathway",
  category: "Kuliah",
  riasec: null,
  summary: "",
  body: "",
  status: "draft",
  sources: [],
  reviewer: null,
  reviewedAt: null,
  validUntil: null,
  demo: false,
});
function normalizeContent(item) {
  return {
    ...blankContent(),
    title: item.title,
    slug: item.slug,
    kind: item.kind,
    category: item.category,
    riasec: item.riasec,
    summary: item.summary,
    body: item.body,
    status: item.status,
    sources: item.sources,
    reviewer: item.reviewer,
    reviewedAt: item.reviewed_at?.slice(0, 10) || null,
    validUntil: item.valid_until?.slice(0, 10) || null,
    demo: item.demo,
  };
}
export function ManagePage() {
  const { refresh } = useAuth();
  const [tab, setTab] = useState("content"),
    [editing, setEditing] = useState(null),
    [filter, setFilter] = useState("all"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    resource = useResource("/bk/content"),
    services = useResource("/bk/services");
  return (
    <>
      <PageTitle
        eyebrow="KONTEN & LAYANAN"
        title="Informasi yang layak dipercaya."
        actions={
          tab === "content" &&
          !editing && (
            <Button
              onClick={() => setEditing({ data: blankContent(), id: null })}
            >
              <Plus size={18} />
              Tambah konten
            </Button>
          )
        }
      >
        Rawat sumber, tinjau isinya, dan berikan ruang untuk pertanyaan siswa.
      </PageTitle>
      <div className="tabs">
        <button
          className={tab === "content" ? "active" : ""}
          onClick={() => {
            setTab("content");
            setEditing(null);
          }}
        >
          <LibraryBig size={18} />
          Konten karier
        </button>
        <button
          className={tab === "services" ? "active" : ""}
          onClick={() => setTab("services")}
        >
          <Clock3 size={18} />
          Layanan sekolah
        </button>
      </div>
      <Banner type="error">{error || resource.error || services.error}</Banner>
      <Banner type="success">{notice}</Banner>
      <ViewTransition
        transitionKey={
          tab === "content"
            ? `content-${editing ? editing.id || "new" : "list"}`
            : "services"
        }
      >
        {tab === "content" ? (
          editing ? (
            <ContentEditor
              key={editing.id || "new"}
              item={editing}
              onCancel={() => setEditing(null)}
              onSaved={async () => {
                await resource.reload();
                setEditing(null);
                setNotice(
                  "Konten tersimpan. Hanya status terbit yang tampil di katalog publik.",
                );
              }}
            />
          ) : (
            <>
              <div className="chip-row">
                {[
                  ["all", "Semua"],
                  ["draft", "Draf"],
                  ["review", "Siap ditinjau"],
                  ["published", "Terbit"],
                  ["archived", "Arsip"],
                ].map(([id, label]) => (
                  <button
                    className={`filter-chip ${filter === id ? "active" : ""}`}
                    key={id}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {resource.loading ? (
                <Loading />
              ) : (
                <div className="content-management-grid">
                  {resource.data?.items
                    .filter((x) => filter === "all" || x.status === filter)
                    .map((item) => (
                      <article
                        className="surface card managed-content"
                        key={item.id}
                      >
                        <div className="section-heading">
                          <span className="pill sage">
                            {
                              {
                                pathway: "Jalur",
                                profession: "Profesi",
                                story: "Cerita",
                                worksheet: "Lembar kerja",
                              }[item.kind]
                            }
                          </span>
                          <Badge status={item.status} />
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.summary}</p>
                        <small>
                          {item.reviewer || "Belum ada peninjau"} · Versi{" "}
                          {item.version}
                          <br />
                          Ditinjau {date(item.reviewed_at)}
                        </small>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setEditing({
                              id: item.id,
                              version: item.version,
                              data: normalizeContent(item),
                            })
                          }
                        >
                          Buka editor
                        </Button>
                      </article>
                    ))}
                </div>
              )}
              {!resource.loading && !resource.data?.items.length && (
                <Empty title="Belum ada konten">
                  Buat draf pertama untuk ditinjau.
                </Empty>
              )}
            </>
          )
        ) : services.loading ? (
          <Loading />
        ) : (
          <form
            key={services.data?.school?.timezone}
            className="surface card service-form stack"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await api("/bk/services", {
                  method: "PUT",
                  body: Object.fromEntries(new FormData(e.currentTarget)),
                });
                await services.reload();
                await refresh();
                setNotice("Pengaturan layanan tersimpan.");
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <h2>Parameter layanan sekolah</h2>
            <Banner>
              Masukkan informasi yang telah dikonfirmasi sekolah. Jangan
              menjanjikan pemantauan 24 jam atau menulis nomor contoh.
            </Banner>
            <Field
              label="Jam layanan"
              name="hours"
              defaultValue={services.data?.school?.service_settings.hours || ""}
              required
              maxLength={300}
            />
            <Field
              label="Estimasi respons"
              name="responseEstimate"
              defaultValue={
                services.data?.school?.service_settings.responseEstimate || ""
              }
              required
              maxLength={200}
            />
            <Select
              label="Zona waktu sekolah"
              name="timezone"
              defaultValue={services.data?.school?.timezone || "Asia/Jakarta"}
            >
              {["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"].map(
                (zone) => (
                  <option key={zone}>{zone}</option>
                ),
              )}
            </Select>
            <Field
              label="Kontak bantuan sekolah (opsional)"
              name="helpContact"
              defaultValue={
                services.data?.school?.service_settings.helpContact || ""
              }
              maxLength={200}
            />
            <Field
              label="Penanggung jawab verifikasi"
              name="responsible"
              defaultValue={
                services.data?.school?.service_settings.responsible || ""
              }
              required
              maxLength={100}
            />
            <Field
              label="Tanggal verifikasi"
              name="verifiedAt"
              type="date"
              defaultValue={
                services.data?.school?.service_settings.verifiedAt || ""
              }
              required
            />
            <Button disabled={busy}>
              {busy ? "Menyimpan…" : "Simpan konfigurasi layanan"}
            </Button>
          </form>
        )}
      </ViewTransition>
    </>
  );
}
function ContentEditor({ item, onCancel, onSaved }) {
  const [data, setData] = useState(item.data),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false),
    [history, setHistory] = useState(null);
  const update = (key, value) => setData((v) => ({ ...v, [key]: value }));
  return (
    <form
      className="surface card stack content-editor"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          await api(`/bk/content${item.id ? `/${item.id}` : ""}`, {
            method: item.id ? "PUT" : "POST",
            body: { ...data, ...(item.id ? { version: item.version } : {}) },
          });
          await onSaved();
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="section-heading">
        <h2>
          {preview
            ? "Pratinjau isi"
            : item.id
              ? "Ubah konten"
              : "Draf konten baru"}
        </h2>
        <Button
          variant="secondary"
          type="button"
          onClick={() => setPreview((v) => !v)}
        >
          {preview ? "Kembali mengedit" : "Pratinjau"}
        </Button>
      </div>
      <Banner type="error">{error}</Banner>
      {preview ? (
        <article className="stack">
          <h2>{data.title}</h2>
          <p>{data.summary}</p>
          <div className="prose-text">{data.body}</div>
          {data.sources.map((s, i) => (
            <a
              href={s.url.startsWith("https://") ? s.url : undefined}
              key={i}
              rel="noreferrer"
              target="_blank"
            >
              {s.title}
            </a>
          ))}
        </article>
      ) : (
        <>
          <div className="two-grid">
            <Field
              label="Judul"
              required
              minLength={3}
              maxLength={180}
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
            />
            <Field
              label="Slug unik"
              required
              pattern="[a-z0-9-]+"
              minLength={3}
              maxLength={180}
              value={data.slug}
              onChange={(e) => update("slug", e.target.value)}
            />
          </div>
          <div className="three-grid">
            <Select
              label="Jenis"
              value={data.kind}
              onChange={(e) => update("kind", e.target.value)}
            >
              {[
                ["pathway", "Jalur"],
                ["profession", "Profesi"],
                ["story", "Cerita"],
                ["worksheet", "Lembar kerja"],
              ].map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
            <Select
              label="Kategori"
              value={data.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {["Kuliah", "Kerja", "Kuliah + Kerja", "Usaha"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
            <Select
              label="Kelompok editorial"
              value={data.riasec || ""}
              onChange={(e) => update("riasec", e.target.value || null)}
            >
              <option value="">Tidak berlaku</option>
              {["R", "I", "A", "S", "E", "C"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <Textarea
            label="Deskripsi singkat"
            required
            minLength={10}
            maxLength={1000}
            value={data.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
          <Textarea
            label="Isi materi (teks biasa)"
            required
            minLength={10}
            rows={10}
            maxLength={15000}
            value={data.body}
            onChange={(e) => update("body", e.target.value)}
            hint="Teks biasa menjaga konten aman. Tidak ada HTML atau skrip yang dijalankan."
          />
          <h3>Sumber</h3>
          {data.sources.map((s, i) => (
            <div className="surface source-editor" key={i}>
              <Field
                label={`Judul sumber ${i + 1}`}
                required
                value={s.title}
                maxLength={160}
                onChange={(e) =>
                  update(
                    "sources",
                    data.sources.map((x, n) =>
                      n === i ? { ...x, title: e.target.value } : x,
                    ),
                  )
                }
              />
              <Field
                label={`URL HTTPS ${i + 1}`}
                type="url"
                required
                value={s.url}
                onChange={(e) =>
                  update(
                    "sources",
                    data.sources.map((x, n) =>
                      n === i ? { ...x, url: e.target.value } : x,
                    ),
                  )
                }
              />
              <Button
                variant="ghost danger"
                type="button"
                onClick={() =>
                  update(
                    "sources",
                    data.sources.filter((_, n) => n !== i),
                  )
                }
              >
                Hapus sumber
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            type="button"
            onClick={() =>
              update("sources", [...data.sources, { title: "", url: "" }])
            }
          >
            Tambah sumber
          </Button>
          <div className="three-grid">
            <Field
              label="Peninjau"
              value={data.reviewer || ""}
              maxLength={100}
              onChange={(e) => update("reviewer", e.target.value || null)}
            />
            <Field
              label="Tanggal ditinjau"
              type="date"
              value={data.reviewedAt || ""}
              onChange={(e) => update("reviewedAt", e.target.value || null)}
            />
            <Field
              label="Batas berlaku / tinjau ulang"
              type="date"
              value={data.validUntil || ""}
              onChange={(e) => update("validUntil", e.target.value || null)}
            />
          </div>
          <Select
            label="Status konten"
            value={data.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {[
              ["draft", "Draf"],
              ["review", "Siap ditinjau"],
              ["published", "Terbit"],
              ["archived", "Arsip"],
            ].map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </Select>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.demo}
              onChange={(e) => update("demo", e.target.checked)}
            />
            Materi demo / simulasi
          </label>
        </>
      )}
      <div className="form-footer">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Kembali ke daftar
        </Button>
        <Button disabled={busy}>{busy ? "Menyimpan…" : "Simpan konten"}</Button>
      </div>
      {item.id && (
        <>
          <button
            className="text-link"
            type="button"
            onClick={async () => {
              try {
                setHistory((await api(`/bk/content/${item.id}/history`)).items);
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Lihat riwayat perubahan
          </button>
          {history?.map((r) => (
            <p key={r.version}>
              Versi {r.version} · {r.actor || "Petugas"} ·{" "}
              {date(r.created_at, true)}
            </p>
          ))}
        </>
      )}
    </form>
  );
}

const accessLabels = {
  active: ["Aktif", "sage"],
  revoked: ["Dicabut siswa", "danger"],
  expired: ["Kedaluwarsa", "butter"],
};

export function SharedHistoryPage() {
  const [section, setSection] = useState("all"),
    [access, setAccess] = useState("all"),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [selectedId, setSelectedId] = useState(null),
    resource = useResource(
      `/bk/shared-history?section=${section}&access=${access}&q=${encodeURIComponent(q)}&page=${page}`,
    );

  const items = resource.data?.items || [];
  const selected = items.find((item) => item.id === selectedId) || null;

  return (
    <>
      <PageTitle eyebrow="RUANG GURU BK" title="Riwayat jawaban siswa">
        Ringkasan jawaban refleksi, perbandingan pilihan, dan rencana langkah
        yang dibagikan secara sadar oleh siswa kepada Anda melalui Sapa Guru BK.
      </PageTitle>
      <div className="surface card filter-row three-col">
        <div className="search-field">
          <span>Cari siswa atau topik</span>
          <label className="search-input">
            <Search size={18} aria-hidden="true" />
            <input
              aria-label="Cari riwayat jawaban siswa"
              placeholder="Cari nama panggilan atau topik konsultasi…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
                setSelectedId(null);
              }}
            />
          </label>
        </div>
        <Select
          label="Bagian jawaban"
          value={section}
          onChange={(e) => {
            setSection(e.target.value);
            setPage(1);
            setSelectedId(null);
          }}
        >
          <option value="all">Semua bagian</option>
          <option value="reflection">Kenali Diriku</option>
          <option value="comparison">Timbang Pilihan</option>
          <option value="plan">Rencana Langkahku</option>
        </Select>
        <Select
          label="Status izin berbagi"
          value={access}
          onChange={(e) => {
            setAccess(e.target.value);
            setPage(1);
            setSelectedId(null);
          }}
        >
          <option value="all">Semua status izin</option>
          <option value="active">Aktif</option>
          <option value="revoked">Dicabut siswa</option>
          <option value="expired">Kedaluwarsa</option>
        </Select>
      </div>
      <Banner type="error">{resource.error}</Banner>
      <div className="queue-grid">
        <section>
          <div className="section-heading">
            <h2>Ringkasan dibagikan</h2>
            <span>{resource.data?.total || 0} ringkasan</span>
          </div>
          <div className="surface card table-card">
            {resource.loading ? (
              <Loading />
            ) : !items.length ? (
              <Empty title="Belum ada riwayat jawaban dibagikan">
                Ringkasan jawaban siswa akan muncul di sini setelah siswa
                mengajukan konsultasi dan mencentang bagian yang ingin
                dibagikan.
              </Empty>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Siswa</th>
                      <th>Bagian</th>
                      <th>Tanggal izin</th>
                      <th>Status izin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const [accessText, accessTone] =
                        accessLabels[item.access] || [item.access, ""];
                      return (
                        <tr
                          key={item.id}
                          className={selectedId === item.id ? "selected" : ""}
                        >
                          <td data-label="Siswa">
                            <button
                              className="table-link"
                              onClick={() => setSelectedId(item.id)}
                            >
                              <span className="avatar">
                                {item.nickname.slice(0, 1).toUpperCase()}
                              </span>
                              <span>
                                <strong>{item.nickname}</strong>
                                <small>
                                  Kelas {item.grade} · BK-{item.request_number}
                                </small>
                              </span>
                            </button>
                          </td>
                          <td data-label="Bagian">
                            {sectionLabels[item.section] || item.section}
                          </td>
                          <td data-label="Tanggal izin">
                            {date(item.consent_at)}
                          </td>
                          <td data-label="Status">
                            <span className={`badge ${accessTone}`}>
                              {accessText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="pagination">
              <span>
                Halaman {page} / {resource.data?.pages || 1}
              </span>
              <Button
                variant="secondary small"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="secondary small"
                disabled={page >= (resource.data?.pages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Berikutnya
              </Button>
            </div>
          </div>
          <Banner
            type="success"
            icon={<ShieldCheck size={20} aria-hidden="true" />}
          >
            Hanya ringkasan yang dipilih siswa saat konsultasi yang tersedia.
            Jurnal Langkahku tetap 100% privat dan tidak pernah dibagikan.
          </Banner>
        </section>
        <aside className="surface card detail-card">
          {!selected ? (
            <Empty title="Pilih riwayat jawaban">
              Klik salah satu baris untuk membaca ringkasan jawaban yang
              diizinkan siswa.
            </Empty>
          ) : (
            <>
              <span className="eyebrow">
                BK-{selected.request_number} ·{" "}
                {sectionLabels[selected.section] || selected.section}
              </span>
              <div className="section-heading">
                <h2>{selected.nickname}</h2>
                <Badge status={selected.request_status} />
              </div>
              <dl className="detail-list">
                <dt>Kelas / semester</dt>
                <dd>
                  {selected.grade} / {selected.semester}
                </dd>
                <dt>Topik konsultasi</dt>
                <dd>{selected.topic}</dd>
                <dt>Disetujui berbagi</dt>
                <dd>{date(selected.consent_at, true)}</dd>
                <dt>Berlaku hingga</dt>
                <dd>{date(selected.expires_at, true)}</dd>
              </dl>
              {selected.access === "active" && selected.data ? (
                <div className="surface snapshot-card">
                  <SnapshotView
                    section={selected.section}
                    data={selected.data}
                  />
                </div>
              ) : (
                <Banner type="warning">
                  {selected.access === "revoked"
                    ? "Izin berbagi untuk ringkasan ini telah dicabut oleh siswa. Isi jawaban tidak lagi tersedia."
                    : "Masa berlaku izin berbagi untuk ringkasan ini telah berakhir."}
                </Banner>
              )}
              <Button variant="ghost small" onClick={resource.reload}>
                Muat status izin terbaru
              </Button>
            </>
          )}
        </aside>
      </div>
    </>
  );
}

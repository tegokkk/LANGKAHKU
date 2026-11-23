import { useEffect, useRef, useState } from "react";
import {
  Search,
  Users,
  ShieldCheck,
  Check,
  X,
  Plus,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";
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

function focusRegistrationRegion(ref) {
  const region = ref.current;
  region?.focus({ preventScroll: true });
  region?.scrollIntoView?.({
    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
}

export default function ApprovalsPage() {
  const detailRegion = useRef(null),
    queueRegion = useRef(null);
  const [tab, setTab] = useState("registrations"),
    [status, setStatus] = useState("pending_approval"),
    [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [selected, setSelected] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  const list = useResource(
      `/admin/registrations?status=${status}&q=${encodeURIComponent(q)}&page=${page}`,
    ),
    staff = useResource(tab === "bk" ? "/admin/bk" : null),
    detail = useResource(selected ? `/admin/registrations/${selected}` : null),
    cohorts = useResource("/admin/cohorts");
  const refresh = async () => {
    await list.reload();
    if (selected) await detail.reload();
  };
  useEffect(() => {
    if (selected) focusRegistrationRegion(detailRegion);
  }, [selected]);
  const review = (id) => {
    setError("");
    setNotice("");
    if (selected === id) focusRegistrationRegion(detailRegion);
    else setSelected(id);
  };
  const act = async (path, body, message = "Perubahan tersimpan.") => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await api(path, { method: "POST", body });
      setNotice(message);
      await refresh();
    } catch (e) {
      setError(e.message);
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  const user = detail.data?.user;
  return (
    <>
      <PageTitle eyebrow="ADMINISTRASI SEKOLAH" title="Pendaftaran siswa">
        Tinjau langkah pertama siswa. Persetujuan yang jelas, akses yang
        terjaga.
      </PageTitle>
      <div className="tabs">
        <button
          className={tab === "registrations" ? "active" : ""}
          onClick={() => setTab("registrations")}
        >
          <Users size={18} />
          Pendaftaran siswa
        </button>
        <button
          className={tab === "bk" ? "active" : ""}
          onClick={() => setTab("bk")}
        >
          Akun guru BK
        </button>
        <button
          className={tab === "operations" ? "active" : ""}
          onClick={() => setTab("operations")}
        >
          Retensi & pekerjaan data
        </button>
      </div>
      <Banner type="error">
        {(!selected || tab !== "registrations" ? error : "") ||
          list.error ||
          staff.error}
      </Banner>
      <Banner type="success">
        {(!selected || tab !== "registrations") && notice}
      </Banner>
      <ViewTransition transitionKey={tab}>
        {tab === "operations" ? (
          <OperationsPanel onCohortsChanged={cohorts.reload} />
        ) : tab === "registrations" ? (
          <>
            <div className="surface card filter-row">
              <div className="search-field">
                <span>Cari pendaftaran</span>
                <label className="search-input">
                  <Search size={18} aria-hidden="true" />
                  <input
                    aria-label="Cari pendaftaran"
                    placeholder="Cari nama panggilan atau username…"
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                  />
                </label>
              </div>
              <Select
                label="Status pendaftaran"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                  setSelected(null);
                }}
              >
                {[
                  ["pending_approval", "Menunggu persetujuan"],
                  ["approved", "Disetujui"],
                  ["rejected", "Ditolak"],
                  ["suspended", "Dinonaktifkan"],
                  ["all", "Semua status"],
                ].map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="queue-grid">
              <section
                ref={queueRegion}
                id="registration-queue"
                tabIndex={-1}
                aria-labelledby="registration-queue-title"
              >
                <div className="section-heading">
                  <h2 id="registration-queue-title">Antrean pendaftaran</h2>
                  <span>{list.data?.total ?? "…"} pendaftaran</span>
                </div>
                <p className="queue-help">
                  Klik Tinjau untuk membuka detail dan tombol persetujuan siswa.
                </p>
                <div className="surface card table-card">
                  {list.loading ? (
                    <Loading />
                  ) : !list.data?.items.length ? (
                    <Empty title="Tidak ada pendaftaran">
                      Pendaftaran yang sesuai filter akan muncul di sini.
                    </Empty>
                  ) : (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>Siswa</th>
                            <th>Kelas</th>
                            <th>Diajukan</th>
                            <th>Status</th>
                            <th aria-label="Aksi" />
                          </tr>
                        </thead>
                        <tbody>
                          {list.data.items.map((u) => (
                            <tr
                              key={u.id}
                              className={u.id === selected ? "selected" : ""}
                            >
                              <td data-label="Siswa">
                                <button
                                  className="table-link"
                                  aria-controls="registration-detail"
                                  aria-expanded={selected === u.id}
                                  onClick={() => review(u.id)}
                                >
                                  <span className="avatar">
                                    {u.nickname.slice(0, 1)}
                                  </span>
                                  <span>
                                    <strong>{u.nickname}</strong>
                                    <small>@{u.username}</small>
                                  </span>
                                </button>
                              </td>
                              <td data-label="Kelas">
                                {u.grade} · {u.semester}
                              </td>
                              <td data-label="Diajukan">{date(u.createdAt)}</td>
                              <td data-label="Status">
                                <Badge status={u.status} />
                              </td>
                              <td data-label="Aksi" className="table-action-cell">
                                <Button
                                  variant="secondary small registration-review"
                                  aria-label={`Tinjau pendaftaran ${u.nickname}`}
                                  aria-controls="registration-detail"
                                  aria-expanded={selected === u.id}
                                  onClick={() => review(u.id)}
                                >
                                  Tinjau{" "}
                                  <ArrowRight size={14} aria-hidden="true" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <div className="pagination">
                    <span>
                      Halaman {page} dari {list.data?.pages || 1}
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
                      disabled={page >= (list.data?.pages || 1)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
                <div className="surface banner sage">
                  <ShieldCheck size={24} />
                  <p>
                    Area ini hanya memuat data administrasi. Jurnal, refleksi,
                    dan konsultasi siswa tidak tersedia bagi superadmin.
                  </p>
                </div>
              </section>
              <aside
                className="surface card detail-card"
                ref={detailRegion}
                id="registration-detail"
                tabIndex={-1}
                aria-label="Detail pendaftaran siswa"
              >
                <div className="registration-detail-heading">
                  <h2>Detail pendaftaran</h2>
                  {selected && (
                    <Button
                      variant="ghost small"
                      onClick={() => {
                        setSelected(null);
                        setError("");
                        setNotice("");
                        focusRegistrationRegion(queueRegion);
                      }}
                    >
                      <ArrowLeft size={16} aria-hidden="true" />
                      Kembali ke antrean
                    </Button>
                  )}
                </div>
                <Banner type="error">{error}</Banner>
                <Banner type="success">{notice}</Banner>
                {!selected ? (
                  <Empty title="Pilih pendaftaran">
                    Klik Tinjau pada siswa untuk membuka data dan memberi
                    keputusan.
                  </Empty>
                ) : detail.loading ? (
                  <Loading />
                ) : detail.error ? (
                  <Banner type="error">
                    {detail.error}
                    <Button variant="secondary small" onClick={detail.reload}>
                      Muat ulang detail
                    </Button>
                  </Banner>
                ) : (
                  user && (
                    <>
                      <span className="eyebrow">DETAIL PENDAFTARAN</span>
                      <div className="section-heading">
                        <h2>{user.nickname}</h2>
                        <Badge status={user.status} />
                      </div>
                      <dl className="detail-list">
                        <dt>Username</dt>
                        <dd>@{user.username}</dd>
                        <dt>Sekolah</dt>
                        <dd>{user.schoolName}</dd>
                        <dt>Kelas / semester</dt>
                        <dd>
                          {user.grade} / {user.semester}
                        </dd>
                        <dt>Kategori usia</dt>
                        <dd>
                          {user.ageBand === "under18"
                            ? "Di bawah 18"
                            : "18 atau lebih"}
                        </dd>
                        <dt>Persetujuan siswa</dt>
                        <dd>{date(user.studentAgreedAt, true)}</dd>
                        <dt>Izin wali</dt>
                        <dd>
                          <Badge status={user.guardianStatus} />
                        </dd>
                      </dl>
                      {user.status === "pending_approval" && (
                        <div className="decision-actions">
                          <Banner>
                            Approval akun tidak mengubah status izin wali.
                          </Banner>
                          <Button
                            disabled={busy}
                            onClick={() =>
                              act(
                                `/admin/registrations/${user.id}/decision`,
                                {
                                  decision: "approved",
                                  version: user.version,
                                },
                                user.guardianStatus === "pending"
                                  ? "Pendaftaran disetujui. Akses siswa masih menunggu verifikasi izin wali."
                                  : "Pendaftaran siswa berhasil disetujui.",
                              )
                            }
                          >
                            <Check size={18} />
                            Setujui pendaftaran
                          </Button>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              act(`/admin/registrations/${user.id}/decision`, {
                                decision: "rejected",
                                reason: new FormData(e.currentTarget).get(
                                  "reason",
                                ),
                                version: user.version,
                              });
                            }}
                          >
                            <Textarea
                              label="Alasan penolakan"
                              name="reason"
                              required
                              minLength={5}
                              maxLength={500}
                              placeholder="Jelaskan alasan operasional dengan sopan."
                            />
                            <Button
                              type="submit"
                              variant="danger secondary"
                              disabled={busy}
                            >
                              <X size={18} />
                              Tolak pendaftaran
                            </Button>
                          </form>
                        </div>
                      )}
                      {user.guardianStatus === "pending" && (
                        <form
                          className="separated stack"
                          onSubmit={(e) => {
                            e.preventDefault();
                            act(`/admin/registrations/${user.id}/guardian`, {
                              reference: new FormData(e.currentTarget).get(
                                "reference",
                              ),
                            });
                          }}
                        >
                          <h3>Verifikasi izin wali</h3>
                          <p>
                            Pastikan sekolah telah memverifikasi izin. Catat
                            nomor referensi, tanpa identitas atau salinan
                            dokumen wali.
                          </p>
                          <Field
                            label="Referensi bukti di sekolah"
                            name="reference"
                            minLength={3}
                            maxLength={100}
                            required
                          />
                          <Button variant="secondary" disabled={busy}>
                            Catat verifikasi wali
                          </Button>
                        </form>
                      )}
                      {["approved", "suspended"].includes(user.status) && (
                        <Button
                          variant="secondary"
                          disabled={busy}
                          onClick={() =>
                            act(`/admin/accounts/${user.id}/status`, {
                              status:
                                user.status === "approved"
                                  ? "suspended"
                                  : "approved",
                              version: user.version,
                            })
                          }
                        >
                          {user.status === "approved"
                            ? "Nonaktifkan akun"
                            : "Aktifkan kembali"}
                        </Button>
                      )}
                      {cohorts.data?.items.length > 0 && (
                        <form
                          className="stack separated"
                          onSubmit={(e) => {
                            e.preventDefault();
                            act(`/admin/registrations/${user.id}/cohort`, {
                              cohortId: new FormData(e.currentTarget).get(
                                "cohortId",
                              ),
                            });
                          }}
                        >
                          <h3>Angkatan & retensi</h3>
                          <Select
                            label="Angkatan"
                            name="cohortId"
                            required
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Pilih angkatan yang sudah ditetapkan
                            </option>
                            {cohorts.data.items.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.label} · hapus {date(c.deletion_at)}
                              </option>
                            ))}
                          </Select>
                          <Button variant="secondary" disabled={busy}>
                            Tetapkan angkatan
                          </Button>
                        </form>
                      )}
                      <div className="separated">
                        <h3>Riwayat keputusan</h3>
                        {detail.data.history.length ? (
                          detail.data.history.map((r, i) => (
                            <div key={i} className="surface history-item">
                              <Badge status={r.decision} />
                              <p>{r.reason || "Pendaftaran disetujui."}</p>
                              <small>
                                {r.reviewer} · {date(r.created_at, true)}
                              </small>
                            </div>
                          ))
                        ) : (
                          <p>Belum ada keputusan.</p>
                        )}
                      </div>
                    </>
                  )
                )}
              </aside>
            </div>
          </>
        ) : (
          <div className="two-grid">
            <section className="surface card">
              <h2>Akun guru BK</h2>
              {staff.loading ? (
                <Loading />
              ) : staff.data?.items.length ? (
                staff.data.items.map((u) => (
                  <div className="list-row" key={u.id}>
                    <div>
                      <strong>{u.nickname}</strong>
                      <small>@{u.username}</small>
                    </div>
                    <Badge status={u.status} />
                    <Button
                      variant="secondary small"
                      disabled={busy}
                      onClick={async () => {
                        await act(`/admin/accounts/${u.id}/status`, {
                          status:
                            u.status === "approved" ? "suspended" : "approved",
                          version: u.version,
                        });
                        await staff.reload();
                      }}
                    >
                      {u.status === "approved" ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  </div>
                ))
              ) : (
                <Empty title="Belum ada akun BK" />
              )}
            </section>
            <form
              className="surface card stack"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                await act("/admin/bk", Object.fromEntries(new FormData(form)));
                await staff.reload();
              }}
            >
              <h2>Buat akun BK</h2>
              <p>
                Akun terikat ke sekolah Anda. Sampaikan kredensial melalui
                prosedur sekolah yang aman.
              </p>
              <Field
                label="Nama guru"
                name="nickname"
                minLength={2}
                maxLength={40}
                required
              />
              <Field
                label="Username BK"
                name="username"
                required
                minLength={3}
                maxLength={40}
              />
              <Field
                label="Kata sandi awal"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={128}
              />
              <Button disabled={busy}>
                <Plus size={18} />
                Buat akun BK
              </Button>
            </form>
          </div>
        )}
      </ViewTransition>
    </>
  );
}
function OperationsPanel({ onCohortsChanged }) {
  const cohorts = useResource("/admin/cohorts"),
    jobs = useResource("/admin/deletion-jobs"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div className="stack">
      <Banner type="warning">
        Tanggal retensi perlu disepakati sekolah. Penghapusan berdasarkan usia
        pendaftaran/angkatan hanya aktif ketika operator mengatur
        RETENTION_ENABLED=true. Hapus mandiri tetap diproses oleh worker.
      </Banner>
      <Banner type="error">{error || cohorts.error || jobs.error}</Banner>
      <div className="two-grid">
        <div className="surface card stack">
          <h2>Angkatan terdaftar</h2>
          {cohorts.loading ? (
            <Loading />
          ) : (
            cohorts.data?.items.map((c) => (
              <div className="surface note-block" key={c.id}>
                <h3>{c.label}</h3>
                <p>
                  Lulus {date(c.graduation_at)}
                  <br />
                  Hapus {date(c.deletion_at, true)}
                </p>
              </div>
            ))
          )}
          {!cohorts.loading && !cohorts.data?.items.length && (
            <Empty title="Belum ada angkatan" />
          )}
        </div>
        <form
          className="surface card stack"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              input = Object.fromEntries(new FormData(form));
            setBusy(true);
            setError("");
            try {
              await api("/admin/cohorts", {
                method: "POST",
                body: {
                  ...input,
                  deletionAt: new Date(input.deletionAt).toISOString(),
                },
              });
              form.reset();
              await cohorts.reload();
              await onCohortsChanged();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Catat kebijakan angkatan</h2>
          <Field
            label="Label angkatan"
            name="label"
            required
            minLength={3}
            maxLength={100}
          />
          <Field
            label="Tanggal kelulusan"
            name="graduationAt"
            type="date"
            required
          />
          <Field
            label="Tanggal penghapusan (waktu perangkat)"
            name="deletionAt"
            type="datetime-local"
            required
          />
          <Button disabled={busy}>Simpan angkatan</Button>
        </form>
      </div>
      <section className="surface card">
        <div className="section-heading">
          <h2>Pekerjaan penghapusan</h2>
          <Button variant="secondary" onClick={jobs.reload}>
            Perbarui
          </Button>
        </div>
        {jobs.loading ? (
          <Loading />
        ) : jobs.data?.items.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Diminta</th>
                  <th>Status</th>
                  <th>Percobaan ulang</th>
                  <th>Hasil</th>
                </tr>
              </thead>
              <tbody>
                {jobs.data.items.map((j) => (
                  <tr key={j.id}>
                    <td data-label="Diminta">{date(j.requested_at, true)}</td>
                    <td data-label="Status">
                      {
                        {
                          pending: "Menunggu",
                          completed: "Selesai",
                          failed: "Perlu dicoba ulang",
                        }[j.status]
                      }
                    </td>
                    <td data-label="Percobaan ulang">{j.retry_count}</td>
                    <td data-label="Hasil">
                      {(j.failure_code ? "Gagal; dicoba ulang worker" : null) ||
                        (j.completed_at
                          ? date(j.completed_at, true)
                          : "Menunggu worker")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Belum ada pekerjaan data" />
        )}
      </section>
    </div>
  );
}

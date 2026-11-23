import { useEffect, useState } from "react";
import { CalendarDays, ShieldCheck, Send, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource, useOnline } from "../hooks/useResource";
import { api } from "../services/api";
import {
  PageTitle,
  Button,
  Select,
  Field,
  Textarea,
  Banner,
  Badge,
  Loading,
  Empty,
  date,
} from "../components/ui";
import SnapshotView from "../features/SnapshotView";
export const sectionLabels = {
  reflection: "Kenali Diriku",
  comparison: "Timbang Pilihan",
  plan: "Rencana Langkahku",
};
export default function ConsultationPage() {
  const { user } = useAuth(),
    online = useOnline(),
    teachers = useResource("/student/teachers"),
    list = useResource("/student/consultations"),
    [mode, setMode] = useState("form"),
    [selected, setSelected] = useState(null),
    [input, setInput] = useState({
      teacherId: "",
      topic: "Pilihan jalur",
      availability: "",
      note: "",
      sections: [],
    }),
    [preview, setPreview] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [key, setKey] = useState(() => crypto.randomUUID());
  const setting = teachers.data?.school.service_settings;
  const currentInput = {
    ...input,
    teacherId: input.teacherId || teachers.data?.items[0]?.id || "",
  };
  const requestPreview = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/student/consultations/preview", {
        method: "POST",
        body: { teacherId: currentInput.teacherId, sections: input.sections },
      });
      setPreview(data);
      setMode("preview");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const send = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await api("/student/consultations", {
        method: "POST",
        body: {
          ...currentInput,
          idempotencyKey: key,
          versions: Object.fromEntries(
            preview.snapshots.map((s) => [s.section, s.version]),
          ),
        },
      });
      setSelected(result.id);
      setInput({
        teacherId: "",
        topic: "Pilihan jalur",
        availability: "",
        note: "",
        sections: [],
      });
      setKey(crypto.randomUUID());
      setMode("detail");
      await list.reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="SAPA GURU BK"
        title="Tidak harus dipikirkan sendiri."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              setMode("form");
              setSelected(null);
            }}
          >
            <Plus size={18} />
            Ajukan konsultasi
          </Button>
        }
      >
        Bicarakan pilihan dan pertanyaanmu bersama guru BK. Ini awal untuk
        pertemuan, bukan chat langsung.
      </PageTitle>
      <div className="surface banner butter">
        <CalendarDays size={20} />
        <div>
          <strong>Jam layanan:</strong>{" "}
          {setting?.hours || "Belum ditetapkan sekolah"}
          <br />
          <small>
            Estimasi respons: {setting?.responseEstimate || "Belum ditetapkan"}{" "}
            · Usulan waktu memerlukan konfirmasi guru.
          </small>
        </div>
      </div>
      <Banner type="error">{error || teachers.error || list.error}</Banner>
      <div className="consultation-grid">
        <section>
          {mode === "detail" && selected ? (
            <ConsultationDetail
              id={selected}
              role="siswa"
              onUpdate={list.reload}
            />
          ) : mode === "preview" ? (
            <div className="surface card stack">
              <span className="eyebrow">SEBELUM KAMU MENGIRIM</span>
              <h2>Ini yang akan dibaca guru BK.</h2>
              <dl className="detail-list">
                <dt>Siswa</dt>
                <dd>
                  {user.nickname} · Kelas {user.grade}
                </dd>
                <dt>Penerima</dt>
                <dd>
                  {
                    teachers.data?.items.find(
                      (t) => t.id === currentInput.teacherId,
                    )?.nickname
                  }
                </dd>
                <dt>Topik</dt>
                <dd>{input.topic}</dd>
                <dt>Ketersediaan</dt>
                <dd>{input.availability}</dd>
                <dt>Catatan</dt>
                <dd>{input.note || "Tanpa catatan"}</dd>
              </dl>
              {preview.snapshots.length ? (
                preview.snapshots.map((s) => (
                  <div key={s.section} className="surface snapshot-card">
                    <h3>{sectionLabels[s.section]}</h3>
                    <SnapshotView section={s.section} data={s.data} />
                    <small>
                      Versi {s.version} · akses 30 hari dari pengiriman
                    </small>
                  </div>
                ))
              ) : (
                <Banner>Tidak ada lampiran ringkasan yang dibagikan.</Banner>
              )}
              <Banner>
                Jurnal tidak ikut dibagikan. Akses ringkasan dapat dicabut,
                namun informasi yang sudah dilihat di luar website tidak dapat
                ditarik kembali.
              </Banner>
              <div className="form-footer">
                <Button
                  variant="secondary"
                  onClick={() => setMode("form")}
                  disabled={busy}
                >
                  Ubah pilihan
                </Button>
                <Button onClick={send} disabled={!online || busy}>
                  <Send size={18} />
                  {busy ? "Mengirim…" : "Kirim permintaan"}
                </Button>
              </div>
            </div>
          ) : (
            <form
              className="surface card stack consultation-form"
              onSubmit={requestPreview}
            >
              <span className="eyebrow">MULAI SEBUAH PERCAKAPAN</span>
              <h2>Apa yang ingin kamu diskusikan?</h2>
              {teachers.loading ? (
                <Loading />
              ) : !teachers.data?.items.length ? (
                <Banner type="warning">
                  Belum ada guru BK aktif di sekolahmu. Petugas sekolah perlu
                  membuat akun BK terlebih dahulu.
                </Banner>
              ) : (
                <Select
                  label="Guru BK penerima"
                  value={currentInput.teacherId}
                  onChange={(e) =>
                    setInput((v) => ({ ...v, teacherId: e.target.value }))
                  }
                >
                  {teachers.data.items.map((t) => (
                    <option value={t.id} key={t.id}>
                      {t.nickname}
                    </option>
                  ))}
                </Select>
              )}
              <Select
                label="Topik konsultasi"
                value={input.topic}
                onChange={(e) =>
                  setInput((v) => ({ ...v, topic: e.target.value }))
                }
              >
                {[
                  "Kenali diri",
                  "Pilihan jalur",
                  "Biaya dan dukungan",
                  "Rencana langkah",
                  "Diskusi lainnya",
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
              <Field
                label="Waktu yang memungkinkan"
                required
                minLength={3}
                maxLength={300}
                value={input.availability}
                placeholder="Contoh: Senin atau Rabu setelah kelas"
                onChange={(e) =>
                  setInput((v) => ({ ...v, availability: e.target.value }))
                }
                hint="Ini usulan, bukan jadwal terkonfirmasi."
              />
              <Textarea
                label="Catatan awal (opsional)"
                value={input.note}
                maxLength={500}
                onChange={(e) =>
                  setInput((v) => ({ ...v, note: e.target.value }))
                }
                hint="Tuliskan garis besar. Hal sensitif dapat dibicarakan langsung saat pertemuan."
              />
              <fieldset className="surface sharing-options">
                <legend>Ringkasan yang ingin kubagikan</legend>
                <p>
                  Semua pilihan kosong secara bawaan. Mengirim tanpa lampiran
                  tetap boleh.
                </p>
                {Object.entries(sectionLabels).map(([section, label]) => (
                  <label key={section} className="surface check-row">
                    <input
                      type="checkbox"
                      checked={input.sections.includes(section)}
                      onChange={(e) =>
                        setInput((v) => ({
                          ...v,
                          sections: e.target.checked
                            ? [...v.sections, section]
                            : v.sections.filter((x) => x !== section),
                        }))
                      }
                    />
                    <span>{label}</span>
                  </label>
                ))}
                <small>Jurnal privat tidak dapat dipilih atau dibagikan.</small>
              </fieldset>
              <Button disabled={!online || busy || !currentInput.teacherId}>
                {busy ? "Menyiapkan…" : "Pratinjau permintaan"}
              </Button>
            </form>
          )}
        </section>
        <aside className="stack">
          <div className="surface card">
            <div className="section-heading">
              <h2>Permintaanmu</h2>
              <button className="text-link" onClick={list.reload}>
                Perbarui
              </button>
            </div>
            {list.loading ? (
              <Loading />
            ) : !list.data?.items.length ? (
              <Empty title="Belum ada permintaan">
                Saat kamu siap, guru BK bisa menjadi teman diskusi.
              </Empty>
            ) : (
              list.data.items.map((item) => (
                <button
                  className={`request-list-row ${selected === item.id ? "selected" : ""}`}
                  key={item.id}
                  onClick={() => {
                    setSelected(item.id);
                    setMode("detail");
                  }}
                >
                  <span>
                    <small>BK-{item.request_number}</small>
                    <strong>{item.topic}</strong>
                    <small>
                      {item.teacher_name} · {date(item.created_at)}
                    </small>
                  </span>
                  <Badge status={item.status} />
                </button>
              ))
            )}
          </div>
          <div className="surface card blush">
            <ShieldCheck size={26} />
            <h3>Ruang aman untuk bertanya.</h3>
            <p>
              Guru hanya membaca permintaan dan ringkasan yang kamu pilih. Tidak
              ada penilaian atau keputusan karier otomatis.
            </p>
            <p>
              Jika butuh bantuan segera, hubungi guru atau orang dewasa
              tepercaya. Layanan ini tidak dipantau 24 jam.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
export function ConsultationDetail({ id, role, onUpdate }) {
  const prefix = role === "bk" ? "bk" : "student",
    resource = useResource(`/${prefix}/consultations/${id}`),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [confirm, setConfirm] = useState(false),
    [renew, setRenew] = useState(false),
    [chosen, setChosen] = useState([]),
    [renewPreview, setRenewPreview] = useState(null);
  const reloadDetail = resource.reload;
  useEffect(() => {
    const timer = setInterval(() => {
      if (navigator.onLine) reloadDetail();
    }, 20000);
    const update = () => {
      if (document.visibilityState === "visible" && navigator.onLine)
        reloadDetail();
    };
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, [reloadDetail]);
  const run = async (path, body, method = "POST") => {
    setError("");
    setBusy(true);
    try {
      await api(path, { method, body });
      setConfirm(false);
      setRenew(false);
      setRenewPreview(null);
      await resource.reload();
      await onUpdate?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (resource.loading && !resource.data) return <Loading />;
  if (resource.error) return <Banner type="error">{resource.error}</Banner>;
  if (!resource.data) return null;
  const { request: r, snapshots } = resource.data,
    closed = ["completed", "closed", "cancelled"].includes(r.status);
  return (
    <div className="surface card stack consultation-detail">
      <span className="eyebrow">BK-{r.request_number}</span>
      <div className="section-heading">
        <h2>{r.topic}</h2>
        <Badge status={r.status} />
      </div>
      <Banner type="error">{error}</Banner>
      <dl className="detail-list">
        <dt>Siswa</dt>
        <dd>
          {r.nickname} · Kelas {r.grade}
        </dd>
        <dt>Guru penerima</dt>
        <dd>{r.teacher_name}</dd>
        <dt>Diajukan</dt>
        <dd>{date(r.created_at, true)}</dd>
        <dt>Waktu usulan</dt>
        <dd>{r.availability}</dd>
        <dt>Jadwal terkonfirmasi</dt>
        <dd>
          {r.confirmed_time
            ? date(r.confirmed_time, true)
            : "Belum dikonfirmasi"}
        </dd>
        {r.location && (
          <>
            <dt>Lokasi</dt>
            <dd>{r.location}</dd>
          </>
        )}
      </dl>
      {r.note && (
        <div className="surface note-block">
          <h3>Catatan awal siswa</h3>
          <p>{r.note}</p>
        </div>
      )}
      {r.operational_reason && (
        <Banner>Catatan operasional: {r.operational_reason}</Banner>
      )}
      <h3>Ringkasan berizin</h3>
      {!snapshots.length ? (
        <Banner>
          Permintaan tanpa lampiran. Tidak ada ringkasan yang dibagikan.
        </Banner>
      ) : (
        snapshots.map((s) => (
          <div key={s.id} className="surface snapshot-card">
            <div className="section-heading">
              <strong>{sectionLabels[s.section]}</strong>
              <Badge status={s.access} />
            </div>
            {s.data ? (
              <SnapshotView section={s.section} data={s.data} />
            ) : (
              <p>
                Isi ringkasan tidak tersedia setelah akses dicabut atau
                berakhir.
              </p>
            )}
            <small>
              Versi {s.source_version} · Berakhir {date(s.expires_at, true)}
            </small>
            {role === "siswa" && s.access === "active" && (
              <Button
                variant="ghost danger small"
                disabled={busy}
                onClick={() =>
                  run(`/student/consultations/${id}/revoke`, {
                    sections: [s.section],
                  })
                }
              >
                Cabut bagian ini
              </Button>
            )}
          </div>
        ))
      )}
      {role === "siswa" && (
        <>
          {snapshots.some((s) => s.access === "active") &&
            (confirm ? (
              <Banner type="warning">
                Cabut seluruh ringkasan?
                <Button
                  variant="danger"
                  disabled={busy}
                  onClick={() =>
                    run(`/student/consultations/${id}/revoke`, {
                      sections: snapshots.map((s) => s.section),
                    })
                  }
                >
                  Ya, cabut semua
                </Button>
                <Button variant="ghost" onClick={() => setConfirm(false)}>
                  Batal
                </Button>
              </Banner>
            ) : (
              <Button
                variant="secondary danger"
                onClick={() => setConfirm(true)}
              >
                Cabut seluruh akses ringkasan
              </Button>
            ))}
          {!closed && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setRenew((v) => !v);
                  setChosen([]);
                  setRenewPreview(null);
                }}
              >
                Pilih ulang ringkasan dengan izin baru
              </Button>
              {renew && (
                <div className="surface note-block stack">
                  {Object.entries(sectionLabels).map(([key, label]) => (
                    <label key={key} className="check-row">
                      <input
                        type="checkbox"
                        checked={chosen.includes(key)}
                        onChange={(e) => {
                          setChosen((v) =>
                            e.target.checked
                              ? [...v, key]
                              : v.filter((x) => x !== key),
                          );
                          setRenewPreview(null);
                        }}
                      />
                      {label}
                    </label>
                  ))}
                  {renewPreview ? (
                    <>
                      {renewPreview.snapshots.map((s) => (
                        <div className="surface snapshot-card" key={s.section}>
                          <h3>{sectionLabels[s.section]}</h3>
                          <SnapshotView section={s.section} data={s.data} />
                        </div>
                      ))}
                      <p>Akses lama diganti; pilihan baru berlaku 30 hari.</p>
                      <Button
                        disabled={busy}
                        onClick={() =>
                          run(`/student/consultations/${id}/refresh-sharing`, {
                            sections: chosen,
                            versions: Object.fromEntries(
                              renewPreview.snapshots.map((s) => [
                                s.section,
                                s.version,
                              ]),
                            ),
                          })
                        }
                      >
                        Setujui & ganti ringkasan
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={async () => {
                        try {
                          setRenewPreview(
                            await api("/student/consultations/preview", {
                              method: "POST",
                              body: {
                                teacherId: r.teacher_id,
                                sections: chosen,
                              },
                            }),
                          );
                        } catch (e) {
                          setError(e.message);
                        }
                      }}
                    >
                      Pratinjau izin baru
                    </Button>
                  )}
                </div>
              )}
              <Button
                variant="ghost danger"
                disabled={busy}
                onClick={() =>
                  run(
                    `/student/consultations/${id}`,
                    { status: "cancelled", version: r.version },
                    "PATCH",
                  )
                }
              >
                Batalkan permintaan
              </Button>
              {r.status === "scheduled" && (
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={() =>
                    run(
                      `/student/consultations/${id}`,
                      { status: "reschedule", version: r.version },
                      "PATCH",
                    )
                  }
                >
                  Minta penjadwalan ulang
                </Button>
              )}
            </>
          )}
        </>
      )}
      {role === "bk" && !closed && (
        <form
          className="stack separated"
          onSubmit={(e) => {
            e.preventDefault();
            const input = Object.fromEntries(new FormData(e.currentTarget));
            const body = {
              status: input.status,
              version: r.version,
              reason: input.reason,
            };
            if (input.status === "scheduled") {
              if (!input.time) {
                setError("Isi waktu jadwal.");
                return;
              }
              body.confirmedTime = new Date(input.time).toISOString();
              body.location = input.location;
            }
            run(`/bk/consultations/${id}`, body, "PATCH");
          }}
        >
          <h3>Tindak lanjut permintaan</h3>
          <Select label="Tindakan" name="status">
            <option value="scheduled">Konfirmasi jadwal</option>
            <option value="reschedule">Perlu penjadwalan ulang</option>
            {r.status === "scheduled" && (
              <option value="completed">Tandai selesai</option>
            )}
            <option value="closed">Tutup operasional</option>
          </Select>
          <Field
            label="Tanggal & waktu lokal perangkat"
            name="time"
            type="datetime-local"
          />
          <Field label="Lokasi pertemuan" name="location" maxLength={200} />
          <Textarea
            label="Alasan operasional / usulan ulang"
            name="reason"
            maxLength={500}
            hint="Wajib untuk penutupan. Jangan menulis catatan konseling sensitif."
          />
          <Button disabled={busy}>
            {busy ? "Menyimpan…" : "Simpan tindak lanjut"}
          </Button>
        </form>
      )}
      <Button variant="ghost" onClick={resource.reload}>
        Muat status & izin terbaru
      </Button>
    </div>
  );
}

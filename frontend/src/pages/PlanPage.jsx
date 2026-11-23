import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Flag,
  Plus,
  Printer,
  LockKeyhole,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { blankPlan, blankComparison, blankOption } from "../features/documents";
import {
  PageTitle,
  Button,
  Field,
  Select,
  Textarea,
  Banner,
  Loading,
  Empty,
  SaveState,
  ViewTransition,
  usePanel,
  date,
} from "../components/ui";
import JournalPanel from "../components/panels/JournalPanel";
const semesters = ["XI-1", "XI-2", "XII-1", "XII-2"];
const criteria = [
  ["interest", "Minat"],
  ["ability", "Kemampuan"],
  ["cost", "Biaya"],
  ["support", "Dukungan keluarga"],
  ["opportunity", "Peluang"],
];
function useDocument(kind, blank) {
  const resource = useResource(`/student/documents/${kind}`),
    [data, setData] = useState(null),
    [version, setVersion] = useState(0),
    [state, setState] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (resource.data) {
      setData(resource.data.document.data || blank());
      setVersion(resource.data.document.version);
      setState(
        resource.data.document.version ? "Draf dimuat" : "Belum tersimpan",
      );
    }
  }, [resource.data, blank]);
  const save = async (next = data) => {
    setState("Menyimpan…");
    setError("");
    try {
      const result = await api(`/student/documents/${kind}`, {
        method: "PUT",
        body: { version, data: next },
      });
      setData(result.document.data);
      setVersion(result.document.version);
      setState("Tersimpan");
      return true;
    } catch (e) {
      setError(e.message);
      setState("Belum tersimpan");
      return false;
    }
  };
  const change = (fn) => {
    setData(fn);
    setState("Perubahan belum disimpan");
  };
  return {
    ...resource,
    data,
    change,
    save,
    state,
    error: error || resource.error,
  };
}
export default function PlanPage() {
  const { pathname } = useLocation(),
    comparison = pathname === "/timbang-pilihan",
    { openPanel } = usePanel();
  return (
    <>
      <PageTitle
        eyebrow="RENCANA LANGKAHKU"
        title={
          comparison
            ? "Melihat pilihan dari dekat."
            : "Langkah kecil, tujuan yang berarti."
        }
        actions={
          <Button
            variant="secondary"
            onClick={() => openPanel("Jurnal privat", <JournalPanel />)}
          >
            <LockKeyhole size={18} />
            Jurnal privat
          </Button>
        }
      >
        Susun pilihan dan tindakan dengan ritmemu sendiri. Semuanya bisa
        ditinjau kembali.
      </PageTitle>
      <div className="tabs route-tabs">
        <Link className={!comparison ? "active" : ""} to="/rencana">
          Rencana
        </Link>
        <Link className={comparison ? "active" : ""} to="/timbang-pilihan">
          Timbang Pilihan
        </Link>
      </div>
      <ViewTransition transitionKey={comparison ? "comparison" : "plan"}>
        {comparison ? <ComparisonEditor /> : <PlanEditor />}
      </ViewTransition>
    </>
  );
}
function PlanEditor() {
  const { user } = useAuth(),
    { openPanel, closePanel } = usePanel(),
    doc = useDocument("plan", blankPlan),
    [semester, setSemester] = useState(`${user.grade}-${user.semester}`),
    [removing, setRemoving] = useState(null);
  if (doc.loading || !doc.data)
    return doc.error ? (
      <Banner type="error">
        {doc.error}
        <Button onClick={doc.reload}>Muat ulang</Button>
      </Banner>
    ) : (
      <Loading />
    );
  const data = doc.data,
    steps = data.steps.filter((s) => s.semester === semester),
    done = steps.filter((x) => x.done).length,
    busy = doc.state === "Menyimpan…";
  const edit = (step) =>
    openPanel(
      step ? "Ubah langkah" : "Tambah langkah",
      <StepForm
        step={step}
        semester={semester}
        onSave={async (saved) => {
          const next = {
            ...data,
            steps: step
              ? data.steps.map((x) => (x.id === step.id ? saved : x))
              : [...data.steps, saved],
          };
          if (await doc.save(next)) closePanel();
          else
            throw new Error(
              "Langkah belum tersimpan. Tutup panel untuk melihat galat dan muat versi server jika terjadi konflik.",
            );
        }}
      />,
    );
  const toggle = (step) =>
    doc.save({
      ...data,
      steps: data.steps.map((x) =>
        x.id === step.id ? { ...x, done: !x.done } : x,
      ),
    });
  const move = (id, direction) => {
    const list = [...data.steps],
      visible = list
        .map((step, index) => ({ step, index }))
        .filter((x) => x.step.semester === semester),
      position = visible.findIndex((x) => x.step.id === id),
      target = visible[position + direction];
    if (!target) return;
    const i = visible[position].index,
      j = target.index;
    [list[i], list[j]] = [list[j], list[i]];
    doc.save({ ...data, steps: list });
  };
  return (
    <>
      <Banner type="error">
        {doc.error}
        {doc.error && (
          <Button variant="ghost" onClick={doc.reload}>
            Muat versi server
          </Button>
        )}
      </Banner>
      <fieldset
        className="plan-grid editor-fieldset"
        disabled={busy}
        aria-label="Editor rencana"
      >
        <section>
          <form
            className="surface card peach goals-card"
            onSubmit={(e) => {
              e.preventDefault();
              doc.save();
            }}
          >
            <div className="section-heading">
              <h2>
                <Flag size={23} /> Arah & peganganmu
              </h2>
              <SaveState state={doc.state} />
            </div>
            <div className="two-grid">
              <Field
                label="Tujuan utama"
                maxLength={300}
                value={data.primaryGoal}
                placeholder="Apa yang ingin kamu jelajahi?"
                onChange={(e) =>
                  doc.change((v) => ({ ...v, primaryGoal: e.target.value }))
                }
              />
              <Field
                label="Rencana cadangan"
                maxLength={300}
                value={data.backupGoal}
                placeholder="Pilihan lain yang ingin tetap terbuka"
                onChange={(e) =>
                  doc.change((v) => ({ ...v, backupGoal: e.target.value }))
                }
              />
            </div>
            <Button variant="white" disabled={busy}>
              Simpan tujuan
            </Button>
          </form>
          <div className="chip-row space-top">
            {semesters.map((s) => (
              <button
                key={s}
                className={`filter-chip ${s === semester ? "active" : ""}`}
                onClick={() => setSemester(s)}
              >
                {s}
                {s === `${user.grade}-${user.semester}` ? " · Aktif" : ""}
              </button>
            ))}
          </div>
          <div className="section-heading">
            <div>
              <h2>Daftar langkah</h2>
              <p>
                {done} dari {steps.length} langkah selesai
              </p>
            </div>
            <Button disabled={busy} onClick={() => edit(null)}>
              <Plus size={18} />
              Tambah langkah
            </Button>
          </div>
          {!steps.length ? (
            <div className="surface card">
              <Empty title="Mulai dari satu langkah">
                Draf dengan satu langkah pun bisa disimpan. Coba susun tiga
                langkah untuk semester ini.
              </Empty>
            </div>
          ) : (
            <div className="stack">
              {steps.map((step) => (
                <article className="surface card plan-step" key={step.id}>
                  <input
                    aria-label={`Selesaikan ${step.title}`}
                    type="checkbox"
                    checked={step.done}
                    disabled={busy}
                    onChange={() => toggle(step)}
                  />
                  <div>
                    <h3 className={step.done ? "completed" : ""}>
                      {step.title}
                    </h3>
                    {step.note && <p>{step.note}</p>}
                    <small>
                      {step.dueDate
                        ? `Tenggat ${date(step.dueDate)}`
                        : "Tanpa tenggat"}{" "}
                      · {step.done ? "Selesai" : "Belum selesai"}
                    </small>
                    {removing === step.id && (
                      <div className="surface confirmation-inline">
                        <p>Hapus langkah ini?</p>
                        <Button
                          variant="danger small"
                          onClick={async () => {
                            await doc.save({
                              ...data,
                              steps: data.steps.filter((s) => s.id !== step.id),
                            });
                            setRemoving(null);
                          }}
                        >
                          Ya, hapus
                        </Button>
                        <Button
                          variant="ghost small"
                          onClick={() => setRemoving(null)}
                        >
                          Batal
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="step-actions">
                    <button
                      aria-label={`Ubah ${step.title}`}
                      disabled={busy}
                      onClick={() => edit(step)}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      aria-label={`Hapus ${step.title}`}
                      disabled={busy}
                      onClick={() => setRemoving(step.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      aria-label={`Naikkan ${step.title}`}
                      disabled={busy || steps[0].id === step.id}
                      onClick={() => move(step.id, -1)}
                    >
                      <ChevronUp size={18} />
                    </button>
                    <button
                      aria-label={`Turunkan ${step.title}`}
                      disabled={busy || steps.at(-1).id === step.id}
                      onClick={() => move(step.id, 1)}
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="form-footer">
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => doc.save({ ...data, reviewed: true })}
            >
              Tinjau & simpan rencana
            </Button>
            <SaveState state={doc.state} />
          </div>
        </section>
        <aside className="stack">
          <div className="surface card">
            <h2>Ritmemu sendiri</h2>
            <p>
              Kemajuan semester {semester} dihitung dari checklist, bukan nilai
              cita-citamu.
            </p>
            <div className="progress-track">
              <span
                style={{
                  width: `${steps.length ? (done / steps.length) * 100 : 0}%`,
                }}
              />
            </div>
            <p>
              <strong>
                {done} / {steps.length}
              </strong>{" "}
              langkah selesai
            </p>
            <p>
              Rencana ditandai ditinjau setelah kamu mengonfirmasi dan memiliki
              sedikitnya tiga langkah.
            </p>
          </div>
          <div className="surface card lavender">
            <h3>Masih menimbang?</h3>
            <p>Berikan ruang untuk beberapa pilihan sebelum menentukan arah.</p>
            <Link className="button white" to="/timbang-pilihan">
              Buka Timbang Pilihan
            </Link>
          </div>
          <div className="surface card">
            <h3>Bawa untuk berdiskusi</h3>
            <p>
              Cetak tujuan dan langkah semester {semester} yang terlihat. Jurnal
              tidak ikut dicetak.
            </p>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer size={18} />
              Cetak semester {semester}
            </Button>
          </div>
        </aside>
      </fieldset>
      <section className="print-only print-plan">
        <h1>Rencana Langkahku</h1>
        <p>
          {user.nickname} · Kelas {user.grade} · Semester {semester}
        </p>
        <h2>Tujuan utama</h2>
        <p>{data.primaryGoal || "Belum diisi"}</p>
        <h2>Rencana cadangan</h2>
        <p>{data.backupGoal || "Belum diisi"}</p>
        <h2>Langkah semester {semester}</h2>
        {steps.map((s) => (
          <article key={s.id}>
            <h3>
              {s.done ? "☑" : "☐"} {s.title}
            </h3>
            <p>{s.note}</p>
            <small>{s.dueDate ? date(s.dueDate) : "Tanpa tenggat"}</small>
          </article>
        ))}
      </section>
    </>
  );
}
function StepForm({ step, semester, onSave }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const input = Object.fromEntries(new FormData(e.currentTarget));
        try {
          await onSave({
            ...input,
            id: step?.id || crypto.randomUUID(),
            done: step?.done || false,
          });
        } catch (e) {
          setError(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field
        label="Langkah yang ingin dicoba"
        name="title"
        defaultValue={step?.title}
        required
        maxLength={200}
      />
      <Select
        label="Semester"
        name="semester"
        defaultValue={step?.semester || semester}
      >
        {semesters.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </Select>
      <Textarea
        label="Catatan (opsional)"
        name="note"
        maxLength={1000}
        defaultValue={step?.note || ""}
      />
      <Field
        label="Tenggat (opsional)"
        name="dueDate"
        type="date"
        defaultValue={step?.dueDate || ""}
      />
      <Banner type="error">{error}</Banner>
      <Button disabled={busy}>{busy ? "Menyimpan…" : "Simpan langkah"}</Button>
    </form>
  );
}
function ComparisonEditor() {
  const doc = useDocument("comparison", blankComparison),
    [message, setMessage] = useState(""),
    [transferBusy, setTransferBusy] = useState(false),
    [transferError, setTransferError] = useState("");
  if (doc.loading || !doc.data)
    return doc.error ? (
      <Banner type="error">
        {doc.error}
        <Button onClick={doc.reload}>Muat ulang</Button>
      </Banner>
    ) : (
      <Loading />
    );
  const data = doc.data,
    busy = doc.state === "Menyimpan…" || transferBusy;
  const update = (id, changes) =>
    doc.change((v) => ({
      ...v,
      reviewed: false,
      options: v.options.map((x) => (x.id === id ? { ...x, ...changes } : x)),
    }));
  const toPlan = async (label, key) => {
    if (!label || busy) return;
    setTransferBusy(true);
    setTransferError("");
    setMessage("");
    try {
      const saved = (await api("/student/documents/plan")).document;
      const plan = saved.data || blankPlan();
      await api("/student/documents/plan", {
        method: "PUT",
        body: {
          version: saved.version,
          data: { ...plan, [key]: label, reviewed: false },
        },
      });
      setMessage(
        "Pilihanmu disimpan sebagai tujuan. Buka Rencana untuk menyusun langkah.",
      );
    } catch (e) {
      setTransferError(e.message);
    } finally {
      setTransferBusy(false);
    }
  };
  return (
    <>
      <Banner>
        Hasil ini bahan diskusi, bukan keputusan otomatis. 1 berarti kurang
        mendukung, 5 sangat mendukung; untuk biaya, 5 berarti lebih terjangkau.
        Belum tahu tetap boleh.
      </Banner>
      <Banner type="error">
        {doc.error}
        {doc.error && (
          <Button variant="ghost" onClick={doc.reload}>
            Muat versi server
          </Button>
        )}
      </Banner>
      <Banner type="success">{message}</Banner>
      <Banner type="error">{transferError}</Banner>
      <div className="section-heading">
        <div>
          <h2>Ruang untuk beberapa kemungkinan</h2>
          <p>Dua atau tiga opsi. Tanpa total, peringkat, atau pemenang.</p>
        </div>
        <Button
          variant="secondary"
          disabled={busy || data.options.length >= 3}
          onClick={() =>
            doc.change((v) => ({
              ...v,
              options: [...v.options, blankOption()],
            }))
          }
        >
          <Plus size={18} />
          Tambah opsi
        </Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          doc.save();
        }}
      >
        <fieldset
          className="editor-fieldset"
          disabled={busy}
          aria-label="Editor perbandingan"
        >
          <div className="comparison-grid">
            {data.options.map((option, i) => (
              <article className="surface card" key={option.id}>
                <span className="eyebrow">PILIHAN {i + 1}</span>
                <Field
                  label="Nama pilihan"
                  required
                  maxLength={120}
                  value={option.label}
                  placeholder="Contoh: pelatihan desain"
                  onChange={(e) => update(option.id, { label: e.target.value })}
                />
                {criteria.map(([key, label]) => (
                  <Select
                    label={label}
                    key={key}
                    value={option.values[key] ?? ""}
                    onChange={(e) =>
                      update(option.id, {
                        values: {
                          ...option.values,
                          [key]:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        },
                      })
                    }
                  >
                    <option value="">Belum tahu</option>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} —{" "}
                        {n === 1
                          ? "kurang mendukung"
                          : n === 5
                            ? "sangat mendukung"
                            : "pertimbangan pribadi"}
                      </option>
                    ))}
                  </Select>
                ))}
                <Textarea
                  label="Alasanku (opsional)"
                  maxLength={1000}
                  value={option.reason}
                  onChange={(e) =>
                    update(option.id, { reason: e.target.value })
                  }
                />
                <div className="stack">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={!option.label}
                    onClick={() => toPlan(option.label, "primaryGoal")}
                  >
                    Jadikan tujuan utama
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={!option.label}
                    onClick={() => toPlan(option.label, "backupGoal")}
                  >
                    Jadikan cadangan
                  </Button>
                  {data.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost danger"
                      onClick={() =>
                        doc.change((v) => ({
                          ...v,
                          options: v.options.filter((x) => x.id !== option.id),
                        }))
                      }
                    >
                      Hapus opsi
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="form-footer">
            <SaveState state={doc.state} />
            <Button variant="secondary" disabled={busy}>
              Simpan draf
            </Button>
            <Button
              type="button"
              disabled={busy || data.options.some((o) => !o.label.trim())}
              onClick={() => doc.save({ ...data, reviewed: true })}
            >
              Konfirmasi sudah kutinjau
            </Button>
          </div>
        </fieldset>
      </form>
    </>
  );
}

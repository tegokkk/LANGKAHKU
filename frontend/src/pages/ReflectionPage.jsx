import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShieldCheck } from "lucide-react";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import {
  blankReflection,
  reflectionSteps,
  summarizeAnswers,
} from "../features/documents";
import {
  PageTitle,
  Button,
  Banner,
  Loading,
  Textarea,
  SaveState,
} from "../components/ui";
export default function ReflectionPage() {
  const resource = useResource("/student/documents/reflection"),
    [doc, setDoc] = useState(null),
    [version, setVersion] = useState(0),
    [step, setStep] = useState(0),
    [state, setState] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    if (resource.data) {
      const saved = resource.data.document;
      setDoc(saved.data || blankReflection());
      setVersion(saved.version);
      setStep(saved.data?.lastStep || 0);
      setState(saved.version ? "Draf dimuat" : "Belum tersimpan");
    }
  }, [resource.data]);
  if (resource.loading || !doc)
    return resource.error ? (
      <Banner type="error">
        {resource.error}
        <Button onClick={resource.reload}>Coba lagi</Button>
      </Banner>
    ) : (
      <Loading />
    );
  const current = reflectionSteps[step],
    busy = state === "Menyimpan…";
  const changeAnswer = (key, value) => {
    setDoc((v) => ({
      ...v,
      reviewed: false,
      answers: v.answers.map((a, i) =>
        i === step ? { ...a, [key]: value } : a,
      ),
    }));
    setState("Perubahan belum disimpan");
  };
  const save = async (nextStep = step, reviewed = false) => {
    setState("Menyimpan…");
    setError("");
    const data = {
      ...doc,
      lastStep: nextStep,
      summary: step === 5 ? doc.summary : summarizeAnswers(doc.answers),
      reviewed,
    };
    try {
      const result = await api("/student/documents/reflection", {
        method: "PUT",
        body: { version, data },
      });
      setDoc(result.document.data);
      setVersion(result.document.version);
      setStep(nextStep);
      setState("Tersimpan");
    } catch (e) {
      setError(e.message);
      setState("Belum tersimpan");
    }
  };
  return (
    <>
      <PageTitle eyebrow="KENALI DIRIKU" title="Mengenal diri, selangkah lagi.">
        Minat, kekuatan, dan hal yang berarti bagimu. Semuanya bisa berubah dan
        bertumbuh.
      </PageTitle>
      <Banner icon={<Heart size={18} aria-hidden="true" />}>
        Ini refleksi, bukan tes. Tidak ada jawaban benar atau salah.
      </Banner>
      <fieldset
        className="reflection-grid editor-fieldset"
        disabled={busy}
        aria-label="Formulir refleksi"
      >
        <section>
          <div className="surface card reflection-progress">
            <div className="section-heading">
              <strong>Perjalanan refleksi diri</strong>
              <SaveState state={state} />
            </div>
            <div className="wizard-steps">
              {reflectionSteps.map((s, i) => (
                <button
                  key={s.label}
                  aria-label={`Langkah ${i + 1}: ${s.label}`}
                  aria-current={i === step ? "step" : undefined}
                  className={i === step ? "active" : i < step ? "past" : ""}
                  onClick={() => {
                    setStep(i);
                  }}
                >
                  <span />
                  <small>
                    {i + 1}. {s.label}
                  </small>
                </button>
              ))}
            </div>
          </div>
          <div className="surface card reflection-form">
            <span className="eyebrow">LANGKAH {step + 1} DARI 6</span>
            <h2>{current.title}</h2>
            <p>{current.description}</p>
            <Banner type="error">{error}</Banner>
            {step < 5 ? (
              <>
                <div className="choices-grid">
                  {current.options.map((option) => (
                    <label
                      className={`surface choice ${doc.answers[step].selected.includes(option) ? "checked" : ""}`}
                      key={option}
                    >
                      <input
                        type="checkbox"
                        checked={doc.answers[step].selected.includes(option)}
                        onChange={(e) =>
                          changeAnswer(
                            "selected",
                            e.target.checked
                              ? [...doc.answers[step].selected, option]
                              : doc.answers[step].selected.filter(
                                  (x) => x !== option,
                                ),
                          )
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
                <Textarea
                  label="Cerita atau pilihanmu sendiri (opsional)"
                  value={doc.answers[step].note}
                  maxLength={1000}
                  onChange={(e) => changeAnswer("note", e.target.value)}
                  hint="Boleh dilewati. Tuliskan hal yang nyaman kamu ceritakan."
                />
              </>
            ) : (
              <>
                <Textarea
                  label="Ringkasan yang bisa kamu perbaiki"
                  rows={14}
                  value={doc.summary}
                  maxLength={6000}
                  onChange={(e) => {
                    setDoc((v) => ({
                      ...v,
                      summary: e.target.value,
                      reviewed: false,
                    }));
                    setState("Perubahan belum disimpan");
                  }}
                />
                <Banner>
                  Ringkasan ini hanya milikmu. Berbagi ke BK memerlukan pilihan
                  dan persetujuan terpisah di Sapa Guru BK.
                </Banner>
              </>
            )}
            <div className="form-footer">
              <Button
                variant="ghost"
                disabled={step === 0 || busy}
                onClick={() => setStep((s) => s - 1)}
              >
                Kembali
              </Button>
              {step < 5 ? (
                <>
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => save(step + 1)}
                  >
                    Lewati dulu
                  </Button>
                  <Button disabled={busy} onClick={() => save(step + 1)}>
                    Simpan dan lanjut
                  </Button>
                </>
              ) : (
                <>
                  <Button disabled={busy} onClick={() => save(5, true)}>
                    Konfirmasi ringkasan
                  </Button>
                  {doc.reviewed && (
                    <Link className="button secondary" to="/peta-jalur">
                      Jelajahi jalur
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
        <aside>
          <div className="surface card summary-sidebar">
            <span className="eyebrow">
              <ShieldCheck size={16} /> HANYA UNTUKMU
            </span>
            <h2>Benang merah ceritamu</h2>
            <p>
              Inilah yang kamu tulis sejauh ini. Tanpa penilaian atau kesimpulan
              otomatis.
            </p>
            {doc.answers.map((a, i) => (
              <div
                className={`surface summary-block ${["blush", "sage", "peach", "lavender", "butter"][i]}`}
                key={i}
              >
                <div className="section-heading">
                  <strong>{reflectionSteps[i].label}</strong>
                  <button className="text-link" onClick={() => setStep(i)}>
                    Ubah
                  </button>
                </div>
                <p>
                  {[...a.selected, a.note].filter(Boolean).join(" · ") ||
                    "Belum diisi / dilewati"}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </fieldset>
    </>
  );
}

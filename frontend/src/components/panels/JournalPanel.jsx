import { useState } from "react";
import { LockKeyhole, Plus, Trash2 } from "lucide-react";
import { useResource } from "../../hooks/useResource";
import { api } from "../../services/api";
import {
  Button,
  Field,
  Textarea,
  Banner,
  Loading,
  Empty,
  SaveState,
  date,
} from "../ui";
export default function JournalPanel() {
  const list = useResource("/student/journals"),
    [entry, setEntry] = useState(null),
    [state, setState] = useState(""),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState(false);
  const start = () => {
    setEntry({
      entry_date: new Date().toLocaleDateString("en-CA"),
      answers: ["", "", ""],
      version: 0,
    });
    setState("Belum tersimpan");
    setConfirm(false);
  };
  const load = async (id) => {
    try {
      const result = await api(`/student/journals/${id}`);
      setEntry({
        ...result.entry,
        entry_date: result.entry.entry_date.slice(0, 10),
      });
      setState("Draf dimuat");
      setConfirm(false);
    } catch (e) {
      setError(e.message);
    }
  };
  const save = async (e) => {
    e.preventDefault();
    setState("Menyimpan…");
    setError("");
    try {
      const body = {
        entryDate: entry.entry_date,
        answers: entry.answers,
        ...(entry.id ? { version: entry.version } : {}),
      };
      const result = await api(
        `/student/journals${entry.id ? `/${entry.id}` : ""}`,
        { method: entry.id ? "PUT" : "POST", body },
      );
      setEntry({
        ...result.entry,
        entry_date: result.entry.entry_date.slice(0, 10),
      });
      setState("Tersimpan");
      await list.reload();
    } catch (e) {
      setError(e.message);
      setState("Belum tersimpan");
    }
  };
  return (
    <div className="stack">
      <Banner icon={<LockKeyhole size={18} aria-hidden="true" />}>
        Jurnal tidak dibagikan ke guru BK. Hanya kamu yang dapat membaca isinya.
      </Banner>
      <Banner type="error">{error || list.error}</Banner>
      {entry ? (
        <form className="stack" onSubmit={save}>
          <div className="section-heading">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setEntry(null)}
            >
              Kembali ke daftar
            </Button>
            <SaveState state={state} />
          </div>
          <Field
            label="Tanggal jurnal"
            type="date"
            required
            value={entry.entry_date}
            onChange={(e) =>
              setEntry((v) => ({ ...v, entry_date: e.target.value }))
            }
          />
          {[
            "Langkah apa yang sudah kucoba?",
            "Apa yang kupelajari tentang diriku?",
            "Dukungan apa yang ingin kucari?",
          ].map((label, i) => (
            <Textarea
              key={label}
              label={label}
              maxLength={2000}
              value={entry.answers[i] || ""}
              onChange={(e) => {
                setEntry((v) => ({
                  ...v,
                  answers: v.answers.map((a, n) =>
                    n === i ? e.target.value : a,
                  ),
                }));
                setState("Perubahan belum disimpan");
              }}
            />
          ))}
          <Button disabled={state === "Menyimpan…"}>Simpan jurnal</Button>
          {entry.id &&
            (confirm ? (
              <div className="surface banner blush">
                <p>Hapus jurnal ini secara permanen?</p>
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    try {
                      await api(`/student/journals/${entry.id}`, {
                        method: "DELETE",
                      });
                      setEntry(null);
                      await list.reload();
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Ya, hapus jurnal
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirm(false)}
                >
                  Batal
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost danger"
                type="button"
                onClick={() => setConfirm(true)}
              >
                <Trash2 size={17} />
                Hapus jurnal
              </Button>
            ))}
        </form>
      ) : (
        <>
          <Button onClick={start}>
            <Plus size={18} />
            Tulis catatan baru
          </Button>
          {list.loading ? (
            <Loading />
          ) : !list.data?.items.length ? (
            <Empty title="Ruang untuk ceritamu">
              Mulai saat kamu ingin. Tidak wajib diisi dan tidak memengaruhi
              kemajuanmu.
            </Empty>
          ) : (
            list.data.items.map((item) => (
              <button
                className="surface journal-list-row"
                key={item.id}
                onClick={() => load(item.id)}
              >
                <LockKeyhole size={18} />
                <span>
                  <strong>{date(item.entry_date)}</strong>
                  <small>Diperbarui {date(item.updated_at, true)}</small>
                </span>
                <span>Buka</span>
              </button>
            ))
          )}
        </>
      )}
    </div>
  );
}

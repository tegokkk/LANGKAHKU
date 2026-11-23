export default function SnapshotView({ section, data }) {
  if (!data) return null;
  if (section === "reflection")
    return <p className="prose-text">{data.summary || "Ringkasan kosong."}</p>;
  if (section === "plan")
    return (
      <div className="stack">
        <p>
          <strong>Tujuan utama:</strong> {data.primaryGoal || "Belum diisi"}
        </p>
        <p>
          <strong>Cadangan:</strong> {data.backupGoal || "Belum diisi"}
        </p>
        {data.steps?.map((s) => (
          <div className="snapshot-step" key={s.id}>
            <strong>
              {s.done ? "Selesai" : "Belum selesai"} · {s.title}
            </strong>
            <small>
              {s.semester}
              {s.dueDate ? ` · ${s.dueDate}` : ""}
            </small>
            {s.note && <p>{s.note}</p>}
          </div>
        ))}
      </div>
    );
  return (
    <div className="stack">
      {data.options?.map((o) => (
        <div className="snapshot-step" key={o.id}>
          <strong>{o.label || "Pilihan tanpa judul"}</strong>
          <dl className="detail-list">
            {[
              ["interest", "Minat"],
              ["ability", "Kemampuan"],
              ["cost", "Biaya"],
              ["support", "Dukungan"],
              ["opportunity", "Peluang"],
            ].map(([key, label]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{o.values?.[key] ?? "Belum tahu"}</dd>
              </div>
            ))}
          </dl>
          {o.reason && <p>{o.reason}</p>}
        </div>
      ))}
    </div>
  );
}

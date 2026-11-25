import { Link } from "react-router-dom";
import {
  Heart,
  Compass,
  Scale,
  ListChecks,
  LockKeyhole,
  MessagesSquare,
  Flag,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource } from "../hooks/useResource";
import {
  PageTitle,
  Loading,
  Banner,
  Button,
  usePanel,
  date,
} from "../components/ui";
import Reveal from "../components/ui/Reveal";
import JournalPanel from "../components/panels/JournalPanel";

const spaces = [
  [
    "reflection",
    "Kenali Diriku",
    "Kenali hal yang kamu sukai, kekuatan, dan nilai yang berarti.",
    "/kenali-diriku",
    Heart,
    "blush",
  ],
  [
    "comparison",
    "Timbang Pilihan",
    "Lihat setiap pilihan dari sudut pandang dan keadaanmu.",
    "/timbang-pilihan",
    Scale,
    "lavender",
  ],
  [
    "plan",
    "Rencana Langkahku",
    "Ubah gagasan menjadi langkah kecil yang bisa kamu coba.",
    "/rencana",
    ListChecks,
    "peach",
  ],
];

const activityLabels = {
  reflection: "Kenali Diriku",
  exploration: "Peta Jalur",
  comparison: "Timbang Pilihan",
  plan: "Rencana Langkahku",
};

export default function HomePage() {
  const { user } = useAuth(),
    { openPanel } = usePanel(),
    resource = useResource("/student/home");
  if (resource.loading) return <Loading />;
  if (resource.error)
    return (
      <Banner type="error">
        {resource.error}
        <Button variant="ghost" onClick={resource.reload}>
          Coba lagi
        </Button>
      </Banner>
    );
  const { progress, plan, latest } = resource.data,
    count = spaces.filter(([key]) => progress[key]).length,
    next = spaces.find(([key]) => !progress[key]) || spaces[spaces.length - 1],
    step = plan?.steps?.find((x) => !x.done),
    doneSteps = plan?.steps?.filter((x) => x.done).length || 0,
    totalSteps = plan?.steps?.length || 0;

  return (
    <>
      <PageTitle eyebrow="RUANG LANGKAHMU" title={`Halo, ${user.nickname}.`}>
        Mau melangkah ke mana hari ini? Tidak perlu terburu-buru.
      </PageTitle>

      <div className="home-hero-grid">
        <section className="surface home-hero hero-stagger-1">
          <span className="pill translucent">
            <Compass size={17} aria-hidden="true" /> PERJALANANMU, RITMEMU
          </span>
          <h2>
            Pelan-pelan,
            <br />
            yang penting mulai.
          </h2>
          <p>
            {count} dari {spaces.length} langkah inti telah kamu tinjau.
            <br />
            Setiap langkah kecil membantu melihat arah lebih jelas.
          </p>
          <div className="progress-segments">
            {spaces.map(([key, label]) => (
              <div key={key}>
                <span className={progress[key] ? "filled" : ""} />
                <small>{label}</small>
              </div>
            ))}
          </div>
          <div className="home-hero-actions">
            <Link className="button white" to={next[3]}>
              Lanjutkan {next[1]}
            </Link>
            {latest && (
              <span className="pill translucent">
                <Clock3 size={14} aria-hidden="true" />
                Terakhir: {activityLabels[latest.kind] || "Eksplorasi"} ·{" "}
                {date(latest.updated_at)}
              </span>
            )}
          </div>
          <div className="hero-ring float-slow" aria-hidden="true" />
        </section>

        <aside className="surface card peach next-step hero-stagger-2">
          <span className="eyebrow">
            <Flag size={17} aria-hidden="true" /> RENCANA TERDEKAT
          </span>
          <h2>{step?.title || "Satu langkah kecil untuk hari ini"}</h2>
          <p>
            {step?.note ||
              "Mulai dengan satu hal yang ingin kamu pelajari. Rencana dapat diubah kapan saja."}
          </p>
          {step?.dueDate && (
            <span className="pill white">Target {date(step.dueDate)}</span>
          )}
          <div className="next-divider" />
          <div className="progress-track home-step-track">
            <span
              style={{
                width: `${totalSteps ? (doneSteps / totalSteps) * 100 : 0}%`,
              }}
            />
          </div>
          <p>
            <strong>
              {doneSteps} dari {totalSteps}
            </strong>{" "}
            langkah selesai
          </p>
          <Link className="button white" to="/rencana">
            Buka rencanaku
          </Link>
        </aside>
      </div>

      <Reveal>
        <div className="section-heading space-top">
          <div>
            <h2>Empat ruang eksplorasi</h2>
            <p>
              Buka sesuai kebutuhanmu. Tidak ada ujian atau nilai kelulusan.
            </p>
          </div>
          {latest && (
            <small>
              Diperbarui pada {activityLabels[latest.kind] || "ruangmu"} ·{" "}
              {date(latest.updated_at)}
            </small>
          )}
        </div>
        <div className="three-grid space-cards">
          {spaces.map(([key, title, text, to, Icon, color], i) => (
            <article
              key={key}
              className={`surface card card-interactive ${color}`}
            >
              <div className="section-heading">
                <span className="pill white">
                  {progress[key] ? (
                    <CheckCircle2 size={14} aria-hidden="true" />
                  ) : null}
                  {progress[key] ? "Sudah ditinjau" : `Langkah ${i + 1}`}
                </span>
                <Icon size={23} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link className="button white" to={to}>
                {progress[key] ? "Buka kembali" : "Mulai jelajahi"}
              </Link>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="surface card home-utilities">
        <div>
          <span className="icon-tile blush">
            <LockKeyhole aria-hidden="true" />
          </span>
          <div>
            <h3>
              Jurnal Langkahku <span className="badge">Privat</span>
            </h3>
            <p>
              Tempat mencatat untuk dirimu sendiri. Tidak dibagikan ke guru BK.
            </p>
            <Button
              variant="secondary"
              onClick={() => openPanel("Jurnal privat", <JournalPanel />)}
            >
              Tulis jurnal privat
            </Button>
          </div>
        </div>
        <div>
          <span className="icon-tile sage">
            <MessagesSquare aria-hidden="true" />
          </span>
          <div>
            <h3>Tidak harus melangkah sendiri.</h3>
            <p>
              Guru BK dapat menjadi teman diskusi saat kamu memerlukan arah.
            </p>
            <Link className="button" to="/sapa-bk">
              Sapa Guru BK
            </Link>
          </div>
        </div>
      </Reveal>
    </>
  );
}

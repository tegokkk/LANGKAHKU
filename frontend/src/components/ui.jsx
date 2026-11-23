import {
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  Children,
} from "react";
import {
  X,
  LoaderCircle,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock3,
  Flower2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const Button = ({
  children,
  variant = "",
  className = "",
  ...props
}) => (
  <button className={`button ${variant} ${className}`.trim()} {...props}>
    {children}
  </button>
);

export function Field({ label, children, hint, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span id={`${id}-label`}>{label}</span>
      {children || (
        <input
          id={id}
          aria-labelledby={`${id}-label`}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
        />
      )}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  );
}

export function Textarea({ label, hint, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span id={`${id}-label`}>{label}</span>
      <textarea
        id={id}
        aria-labelledby={`${id}-label`}
        aria-describedby={hint ? `${id}-hint` : undefined}
        rows={4}
        {...props}
      />
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </label>
  );
}

export function Select({ label, children, ...props }) {
  const id = useId();
  return (
    <label className="field" htmlFor={id}>
      <span id={`${id}-label`}>{label}</span>
      <select id={id} aria-labelledby={`${id}-label`} {...props}>
        {children}
      </select>
    </label>
  );
}

const bannerIcons = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Banner({ children, type = "info", icon }) {
  const visible = Children.toArray(children).filter(
    (child) =>
      child !== "" && child !== null && child !== false && child !== undefined,
  );
  if (!visible.length) return null;
  const DefaultIcon = bannerIcons[type] || Info;
  return (
    <div
      className={`surface banner ${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {icon || <DefaultIcon size={18} aria-hidden="true" />}
      <div className="banner-body">{visible}</div>
    </div>
  );
}

export const Empty = ({ title = "Belum ada data", children }) => (
  <div className="empty">
    <Flower2 size={32} aria-hidden="true" />
    <h3>{title}</h3>
    {children && <p>{children}</p>}
  </div>
);

export const Loading = () => (
  <div className="loading" role="status">
    <LoaderCircle className="spin" size={20} aria-hidden="true" /> Memuat ruang
    langkahmu…
  </div>
);

export const SaveState = ({ state }) => (
  <span
    role="status"
    className={`save-state ${state === "Tersimpan" ? "success" : ""}`}
  >
    {state === "Tersimpan" && <CheckCircle2 size={16} aria-hidden="true" />}{" "}
    {state}
  </span>
);

export const statusLabels = {
  pending_approval: "Menunggu persetujuan",
  approved: "Disetujui",
  rejected: "Ditolak",
  suspended: "Dinonaktifkan",
  pending: "Menunggu izin wali",
  verified: "Izin wali terverifikasi",
  not_required: "Izin wali tidak diperlukan",
  submitted: "Diajukan",
  scheduled: "Dijadwalkan",
  reschedule: "Perlu penjadwalan ulang",
  completed: "Selesai",
  cancelled: "Dibatalkan",
  closed: "Ditutup",
  draft: "Draf",
  review: "Siap ditinjau",
  published: "Terbit",
  archived: "Arsip",
  active: "Akses aktif",
  revoked: "Akses dicabut",
  expired: "Akses berakhir",
};

const positiveStatuses = [
  "approved",
  "verified",
  "published",
  "scheduled",
  "completed",
  "active",
];
const negativeStatuses = ["rejected", "suspended", "revoked"];

export const Badge = ({ status, children }) => {
  const isPositive = positiveStatuses.includes(status);
  const isNegative = negativeStatuses.includes(status);
  const tone = isPositive ? "sage" : isNegative ? "blush" : "butter";
  const Icon = isPositive ? CheckCircle2 : isNegative ? AlertCircle : Clock3;
  return (
    <span className={`badge ${tone}`}>
      {status && <Icon size={13} aria-hidden="true" />}
      {children || statusLabels[status] || status}
    </span>
  );
};

export { formatDate as date } from "../utils/time";

export const PageTitle = ({ eyebrow, title, children, actions }) => (
  <div className="page-title">
    <div>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
    {actions && <div className="actions">{actions}</div>}
  </div>
);

const PanelContext = createContext(null);

export function PanelProvider({ children }) {
  const { user } = useAuth();
  const identity = user ? `${user.id}:${user.active}` : "guest";
  const [panel, setPanel] = useState(null),
    trigger = useRef(null),
    dialog = useRef(null);

  const openPanel = (title, content) => {
    trigger.current = document.activeElement;
    setPanel({ title, content });
  };
  const closePanel = () => setPanel(null);

  useEffect(() => {
    setPanel(null);
  }, [identity]);

  useEffect(() => {
    if (!panel) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const node = dialog.current;
    node.querySelector("button")?.focus();
    const key = (e) => {
      if (e.key === "Escape") setPanel(null);
      if (e.key === "Tab") {
        const nodes = [
          ...node.querySelectorAll(
            'button,a[href],input,select,textarea,[tabindex="0"]',
          ),
        ].filter((x) => !x.disabled && x.getClientRects().length);
        const first = nodes[0],
          last = nodes.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", key);
      trigger.current?.focus();
    };
  }, [panel]);

  return (
    <PanelContext.Provider value={{ openPanel, closePanel }}>
      <div className="app-surface" inert={panel ? true : undefined}>
        {children}
      </div>
      {panel && (
        <div
          className="panel-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) closePanel();
          }}
        >
          <section
            ref={dialog}
            className="side-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
          >
            <header>
              <div>
                <span className="eyebrow">RUANG LANGKAHMU</span>
                <h2 id="panel-title">{panel.title}</h2>
              </div>
              <Button
                variant="icon-button ghost"
                onClick={closePanel}
                aria-label="Tutup panel"
              >
                <X size={20} />
              </Button>
            </header>
            <div className="panel-body">{panel.content}</div>
          </section>
        </div>
      )}
    </PanelContext.Provider>
  );
}

export function ViewTransition({ transitionKey, className = "", children }) {
  const ref = useRef(null);
  const previousKey = useRef(transitionKey);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || previousKey.current === transitionKey) return;
    previousKey.current = transitionKey;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    node.classList.remove("view-enter");
    void node.offsetWidth;
    node.classList.add("view-enter");
  }, [transitionKey]);

  return (
    <div
      ref={ref}
      className={`view-stage ${className}`.trim()}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) {
          e.currentTarget.classList.remove("view-enter");
        }
      }}
    >
      {children}
    </div>
  );
}

export const usePanel = () => useContext(PanelContext);

import { useEffect, useRef, useState } from "react";
import {
  NavLink,
  Link,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Footprints,
  House,
  Heart,
  Compass,
  ListChecks,
  MessagesSquare,
  ChartNoAxesCombined,
  LibraryBig,
  Users,
  Headphones,
  Settings,
  LogOut,
  LogIn,
  ShieldCheck,
  WifiOff,
  BookOpen,
  Download,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useOnline } from "../hooks/useResource";
import { Button, Banner, ViewTransition, usePanel } from "../components/ui";
import AdaptiveNavPill from "../components/ui/AdaptiveNavPill";
import { HelpPanel, SettingsPanel } from "../components/panels/AccountPanels";

const studentLinks = [
  ["/beranda", "Beranda", House],
  ["/kenali-diriku", "Diriku", Heart],
  ["/peta-jalur", "Peta Jalur", Compass],
  ["/rencana", "Rencana", ListChecks],
  ["/sapa-bk", "Sapa BK", MessagesSquare],
];

const publicLinks = [
  ["/", "Awal", House],
  ["/peta-jalur", "Peta Jalur", Compass],
  ["/cerita-langkah", "Cerita", BookOpen],
  ["/panduan-orang-tua", "Orang Tua", Users],
  ["/unduhan", "Unduhan", Download],
];

const publicAllPages = [
  ["/", "Halaman Utama"],
  ["/tentang", "Tentang LANGKAHKU"],
  ["/cara-menggunakan", "Cara Menggunakan"],
  ["/peta-jalur", "Peta Jalur & Profesi"],
  ["/cerita-langkah", "Cerita Langkah"],
  ["/panduan-orang-tua", "Panduan Orang Tua"],
  ["/unduhan", "Unduhan & Lembar Kerja"],
  ["/faq", "Pertanyaan Umum (FAQ)"],
  ["/privasi", "Privasi & Hak Data"],
];

const bkLinks = [
  ["/bk/permintaan", "Permintaan", MessagesSquare],
  ["/bk/riwayat-jawaban", "Riwayat jawaban", FileText],
  ["/bk/agregat", "Agregat kebutuhan", ChartNoAxesCombined],
  ["/bk/kelola", "Konten & layanan", LibraryBig],
];

export function Brand() {
  return (
    <Link to="/" className="brand" aria-label="LANGKAHKU beranda">
      <span className="brand-mark" aria-hidden="true">
        <Footprints size={20} />
      </span>
      <span>
        LANGKAH<span className="brand-light">KU</span>
        <small>LANGKAH KECIL, ARAH LEBIH JELAS</small>
      </span>
    </Link>
  );
}

export default function AppLayout() {
  const { user, demo, logout } = useAuth(),
    online = useOnline(),
    { openPanel } = usePanel(),
    navigate = useNavigate(),
    location = useLocation(),
    menuToggle = useRef(null),
    [mobileMenu, setMobileMenu] = useState(false),
    [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    setMobileMenu(false);
    if (!location.hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  const routeKey =
    location.pathname === "/timbang-pilihan"
      ? "/rencana"
      : ["/masuk", "/daftar", "/pemulihan", "/status"].includes(
            location.pathname,
          )
        ? "/akses"
        : location.pathname;

  const authRoute = routeKey === "/akses";

  const staff = ["bk", "superadmin"].includes(user?.role),
    links = staff
      ? user.role === "bk"
        ? bkLinks
        : [["/superadmin/pendaftaran", "Pendaftaran siswa", Users]]
      : user?.active
        ? studentLinks
        : publicLinks;

  const help = () => {
    setMobileMenu(false);
    openPanel("Bantuan & privasi", <HelpPanel />);
  };
  const exit = async () => {
    setLogoutError("");
    try {
      await logout();
      navigate(staff ? "/masuk?akses=staf" : "/masuk");
    } catch (error) {
      setLogoutError(error.message);
    }
  };

  return (
    <div
      className={`app${staff ? " staff-app" : ""}${authRoute ? " auth-app" : ""}`}
    >
      <a href="#main" className="skip-link">
        Lewati ke isi utama
      </a>
      {staff && (
        <aside className="staff-sidebar">
          <Brand />
          <span className="role-label">
            {user.role === "bk" ? "Ruang Guru BK" : "Administrasi Akun"}
          </span>
          <p className="school-name">{user.schoolName}</p>
          <nav aria-label="Navigasi staf">
            {links.map(([to, label, Icon]) => (
              <NavLink key={to} to={to}>
                <Icon size={20} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="surface sidebar-note">
            <ShieldCheck size={20} aria-hidden="true" />
            <p>
              {user.role === "superadmin"
                ? "Administrasi akun tidak membuka data konseling siswa."
                : "Hanya ringkasan berizin. Jurnal tetap privat."}
            </p>
          </div>
          <div className="staff-account">
            <span className="avatar" aria-hidden="true">
              {user.nickname.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <strong>{user.nickname}</strong>
              <small>{user.role === "bk" ? "Guru BK" : "Superadmin"}</small>
            </div>
            <div className="staff-account-actions">
              <Button
                variant="ghost icon-button staff-mobile-help"
                onClick={help}
                aria-label="Bantuan & privasi"
              >
                <Headphones size={18} />
              </Button>
              <Button
                variant="ghost icon-button"
                onClick={exit}
                aria-label="Keluar"
                title="Keluar"
              >
                <LogOut size={18} />
              </Button>
            </div>
          </div>
        </aside>
      )}
      <div className="app-body">
        <header
          className="topbar"
          onKeyDown={(event) => {
            if (event.key === "Escape" && mobileMenu) {
              setMobileMenu(false);
              menuToggle.current?.focus();
            }
          }}
        >
          <div className="topbar-inner">
            {!staff && (
              <div className="mobile-brand"><Brand /></div>
            )}
            {!staff && (
              <AdaptiveNavPill
                links={links}
                actions={
                  user
                    ? []
                    : [
                        {
                          id: "help",
                          label: "Bantuan",
                          Icon: Headphones,
                          onClick: help,
                          variant: "help",
                        },
                        {
                          id: "/masuk",
                          to: "/masuk",
                          label: "Masuk akun",
                          Icon: LogIn,
                          variant: "primary",
                        },
                      ]
                }
              />
            )}
            {!staff && (
              <nav
                className="main-nav mobile-only-nav"
                aria-label="Navigasi seluler"
              >
                {(user?.active ? studentLinks : publicLinks.slice(0, 3)).map(
                  ([to, label, Icon]) => (
                    <NavLink key={to} to={to} end={to === "/"}>
                      <Icon size={18} aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  ),
                )}
                {!user && (
                  <>
                    <button type="button" onClick={help}>
                      <Headphones size={18} aria-hidden="true" />
                      <span>Bantuan</span>
                    </button>
                    <NavLink to="/masuk">
                      <LogIn size={18} aria-hidden="true" />
                      <span>Masuk</span>
                    </NavLink>
                  </>
                )}
              </nav>
            )}
            {staff && (
              <span className="breadcrumb">
                Ruang staf <span aria-hidden="true">/</span>{" "}
                {user.role === "bk"
                  ? "Pendampingan siswa"
                  : "Persetujuan pendaftaran"}
              </span>
            )}
            {user ? (
              <div className="topbar-actions">
                <Button
                  variant="help-button"
                  onClick={help}
                  aria-label="Butuh bicara sekarang?"
                  title="Butuh bicara sekarang?"
                >
                  <Headphones size={17} aria-hidden="true" />
                  <span>Butuh bicara sekarang?</span>
                </Button>
                <Button
                  variant="account-button ghost"
                  aria-label={`Pengaturan akun ${user.nickname}`}
                  onClick={() =>
                    user.role === "siswa"
                      ? openPanel("Pengaturan akun", <SettingsPanel />)
                      : help()
                  }
                >
                  <span className="avatar" aria-hidden="true">
                    {user.nickname.slice(0, 1).toUpperCase()}
                  </span>
                  <span>
                    {user.nickname}
                    <small>
                      {user.role === "siswa"
                        ? `Kelas ${user.grade} · Semester ${user.semester}`
                        : user.role}
                    </small>
                  </span>
                  <Settings size={16} aria-hidden="true" />
                </Button>
                {!staff && (
                  <Button
                    variant="ghost icon-button"
                    aria-label="Keluar"
                    title="Keluar"
                    onClick={exit}
                  >
                    <LogOut size={18} />
                  </Button>
                )}
              </div>
            ) : (
              <div className="topbar-actions mobile-menu-toggle">
                <Button
                  ref={menuToggle}
                  variant="ghost icon-button"
                  aria-label={
                    mobileMenu ? "Tutup menu navigasi" : "Buka menu navigasi"
                  }
                  aria-expanded={mobileMenu}
                  aria-controls="mobile-public-menu"
                  onClick={() => setMobileMenu((v) => !v)}
                >
                  {mobileMenu ? <X size={20} /> : <Menu size={20} />}
                </Button>
              </div>
            )}
          </div>
          {!user && (
            <div
              id="mobile-public-menu"
              className={`mobile-public-drawer ${mobileMenu ? "is-open" : ""}`}
              aria-hidden={!mobileMenu}
              inert={!mobileMenu}
            >
              <nav aria-label="Menu halaman publik">
                {publicAllPages.map(([to, label]) => (
                  <NavLink key={to} to={to} end={to === "/"}>
                    {label}
                  </NavLink>
                ))}
                <div className="drawer-actions">
                  <Link className="button small" to="/daftar">
                    Daftar siswa
                  </Link>
                  <Link className="button secondary small" to="/masuk">
                    Masuk akun
                  </Link>
                  <button
                    type="button"
                    className="button help-button small"
                    onClick={help}
                  >
                    <Headphones size={16} aria-hidden="true" />
                    Butuh bicara sekarang?
                  </button>
                </div>
              </nav>
            </div>
          )}
        </header>
        {!online && (
          <div className="offline-strip" role="status">
            <WifiOff size={18} aria-hidden="true" /> Kamu sedang luring. Konten
            unduhan tetap dapat dibaca; data pribadi dan pengiriman memerlukan
            internet.
          </div>
        )}
        <main
          id="main"
          tabIndex={-1}
          className={
            staff
              ? "main-content staff-content"
              : authRoute
                ? "main-content auth-main"
                : "main-content"
          }
        >
          {user ? (
            <div className="dashboard-shell">
              {demo && (
                <div className="demo-label">
                  <span aria-hidden="true" /> DATA DEMO · Ruang pengembangan
                  dengan data fiktif
                </div>
              )}
              {logoutError && (
                <Banner type="error">
                  Keluar akun belum berhasil. {logoutError}
                </Banner>
              )}
              <ViewTransition
                key={user?.id || "guest"}
                transitionKey={routeKey}
              >
                <Outlet />
              </ViewTransition>
            </div>
          ) : (
            <>
              {demo && (
                <div className="demo-label">
                  <span aria-hidden="true" /> DATA DEMO · Ruang pengembangan
                  dengan data fiktif
                </div>
              )}
              {logoutError && (
                <Banner type="error">
                  Keluar akun belum berhasil. {logoutError}
                </Banner>
              )}
              <ViewTransition
                key={user?.id || "guest"}
                transitionKey={routeKey}
              >
                <Outlet />
              </ViewTransition>
            </>
          )}
        </main>
        {!authRoute && (
          <footer>
            {!staff ? (
            <div className="footer-rich">
              <div className="public-footer-grid">
                <div className="stack-sm">
                  <Brand />
                  <p>
                    Pendamping perencanaan karier siswa SMA kelas XI dan XII.
                    Mengenali diri, menimbang jalur kuliah maupun kerja, dan
                    menyusun langkah bersama guru BK.
                  </p>
                </div>
                <div className="footer-col">
                  <strong>Eksplorasi</strong>
                  <Link to="/peta-jalur">Peta Jalur & Profesi</Link>
                  <Link to="/cerita-langkah">Cerita Langkah</Link>
                  <Link to="/panduan-orang-tua">Panduan Orang Tua</Link>
                  <Link to="/unduhan">Unduhan & Lembar Kerja</Link>
                </div>
                <div className="footer-col">
                  <strong>Panduan & Informasi</strong>
                  <Link to="/tentang">Tentang LANGKAHKU</Link>
                  <Link to="/cara-menggunakan">Cara Menggunakan</Link>
                  <Link to="/faq">Pertanyaan Umum (FAQ)</Link>
                  <Link to="/privasi">Privasi & Hak Data</Link>
                </div>
                <div className="footer-col">
                  <strong>Akses & Bantuan</strong>
                  {user ? (
                    <Link to={user.destination}>Ruang Langkahku</Link>
                  ) : (
                    <>
                      <Link to="/masuk">Masuk Akun</Link>
                      <Link to="/masuk?akses=staf">Masuk Superadmin / BK</Link>
                      <Link to="/daftar">Daftar Siswa</Link>
                    </>
                  )}
                  <button type="button" onClick={help}>
                    Butuh bicara sekarang?
                  </button>
                  <button type="button" onClick={help}>
                    Jam layanan BK sekolah
                  </button>
                </div>
              </div>
              <div className="footer-bottom">
                <span>
                  <strong>LANGKAHKU</strong>{" "}
                  <span className="footer-muted">
                    — Langkah kecil, arah yang lebih jelas.
                  </span>
                </span>
                <div className="footer-links">
                  <Link to="/privasi">Privasi</Link>
                  <Link to="/faq">FAQ</Link>
                  <button type="button" onClick={help}>
                    Bantuan
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="footer-inner">
              <span>
                <strong>LANGKAHKU</strong>{" "}
                <span className="footer-muted">
                  — Pendamping perencanaan karier siswa.
                </span>
              </span>
              <div className="footer-links">
                <button type="button" onClick={help}>
                  Panduan & privasi
                </button>
                <button type="button" onClick={help}>
                  Jam layanan BK
                </button>
              </div>
            </div>
          )}
          </footer>
        )}
      </div>
    </div>
  );
}

export function RequestError({ message, retry }) {
  return (
    <Banner type="error">
      <span>{message}</span>
      {retry && (
        <button type="button" className="text-link" onClick={retry}>
          Coba lagi
        </button>
      )}
    </Banner>
  );
}

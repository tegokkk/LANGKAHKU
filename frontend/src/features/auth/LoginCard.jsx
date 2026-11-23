import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Banner, Button, Field } from "../../components/ui";

const audiences = [
  { id: "siswa", label: "Siswa", eyebrow: "RUANG SISWA", Icon: GraduationCap },
  {
    id: "staf",
    label: "Superadmin / BK",
    eyebrow: "RUANG SEKOLAH",
    Icon: ShieldCheck,
  },
];

export default function LoginCard({ statusPrompt = false }) {
  const { login, error: authError, refresh } = useAuth();
  const navigate = useNavigate(),
    location = useLocation();
  const audience =
    new URLSearchParams(location.search).get("akses") === "staf"
      ? "staf"
      : "siswa";
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const forms = useRef({});

  useEffect(() => {
    setError("");
    // Passwords never remain on the hidden face when switching access.
    Object.values(forms.current).forEach((form) => form?.reset());
  }, [audience]);

  const submit = async (event, face) => {
    event.preventDefault();
    if (busy || face !== audience) return;
    const input = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError("");
    try {
      const result = await login({ ...input, audience: face });
      navigate(result.user.destination, { replace: true });
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell login-shell">
      <Link className="auth-back-link" to="/">
        <ArrowLeft size={16} aria-hidden="true" />
        Kembali ke halaman awal
      </Link>
      <div
        className="login-audience-tabs"
        role="group"
        aria-label="Pilih akses masuk"
      >
        {audiences.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={audience === id}
            className={audience === id ? "active" : ""}
            disabled={busy}
            onClick={() =>
              navigate(id === "staf" ? "/masuk?akses=staf" : "/masuk")
            }
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="login-flip-stage">
        <div
          className={`login-flip-rotor ${audience === "staf" ? "is-flipped" : ""}`}
        >
          {audiences.map(({ id, eyebrow, Icon }) => {
            const active = id === audience,
              staff = id === "staf";
            return (
              <section
                key={id}
                className={`surface card access-card login-face login-face--${id}`}
                aria-label={
                  staff ? "Login superadmin dan guru BK" : "Login siswa"
                }
                aria-hidden={!active}
                inert={!active}
              >
                <div className="login-face-heading">
                  <span className={`icon-tile ${staff ? "sage" : "blush"}`}>
                    <Icon size={25} aria-hidden="true" />
                  </span>
                  <span className="eyebrow">{eyebrow}</span>
                </div>
                <h1>
                  {staff
                    ? "Masuk ruang sekolah"
                    : statusPrompt
                      ? "Masuk untuk melihat keputusan"
                      : "Selamat datang kembali"}
                </h1>
                <p className="login-description">
                  {staff
                    ? "Akses superadmin dan guru BK untuk mendampingi langkah siswa."
                    : "Lanjutkan refleksi, jelajahi pilihan, dan susun langkah kecilmu."}
                </p>
                {active && (
                  <>
                    <Banner type="error">{error || authError}</Banner>
                    {authError && (
                      <Button
                        variant="secondary"
                        onClick={() => refresh().catch(() => {})}
                      >
                        Coba hubungkan kembali
                      </Button>
                    )}
                  </>
                )}
                <form
                  ref={(node) => {
                    forms.current[id] = node;
                  }}
                  onSubmit={(event) => submit(event, id)}
                >
                  <fieldset
                    className="editor-fieldset stack"
                    disabled={!active || busy || !!authError}
                  >
                    <Field
                      label="Username"
                      name="username"
                      required
                      minLength={3}
                      maxLength={40}
                      autoComplete={`section-${id} username`}
                      pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]*"
                      placeholder={
                        staff
                          ? "Username akun sekolah"
                          : "Username siswa"
                      }
                    />
                    <Field
                      label="Kata sandi"
                      name="password"
                      type="password"
                      required
                      maxLength={128}
                      autoComplete={`section-${id} current-password`}
                      placeholder="Masukkan kata sandi"
                    />
                    <Button type="submit">
                      {busy && active
                        ? "Memproses…"
                        : staff
                          ? "Masuk sebagai staf sekolah"
                          : "Masuk sebagai siswa"}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Button>
                    <Link
                      className="text-link login-recovery"
                      to={staff ? "/pemulihan?akses=staf" : "/pemulihan"}
                    >
                      Lupa kata sandi?
                    </Link>
                  </fieldset>
                </form>
                <div className="login-face-footer">
                  {staff ? (
                    <p>Akun staf disediakan oleh pengelola sekolah.</p>
                  ) : (
                    <p>
                      Belum punya akun?{" "}
                      <Link className="text-link" to="/daftar">
                        Daftar siswa
                      </Link>
                    </p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
      <div className="surface access-note blush login-privacy-note">
        <ShieldCheck size={21} aria-hidden="true" />
        <div>
          <strong>Ruang yang sesuai, akses yang terjaga.</strong>
          <p>
            Jurnal siswa tetap privat. Guru BK hanya membaca ringkasan yang
            dibagikan dengan izin.
          </p>
        </div>
      </div>
    </div>
  );
}

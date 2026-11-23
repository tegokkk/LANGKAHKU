import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { ShieldCheck, Clock3, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";
import {
  Button,
  Field,
  Select,
  Banner,
  Badge,
  date,
  Loading,
  ViewTransition,
  usePanel,
} from "../components/ui";
import { SettingsPanel } from "../components/panels/AccountPanels";
import LoginCard from "../features/auth/LoginCard";

export default function AccessPage() {
  const {
      user,
      register,
      refresh,
      loading: authLoading,
      error: authError,
    } = useAuth(),
    { openPanel } = usePanel(),
    navigate = useNavigate(),
    location = useLocation();

  const initial =
    location.pathname === "/daftar"
      ? "register"
      : location.pathname === "/pemulihan"
        ? "recover"
        : location.pathname === "/status"
          ? "status"
          : "login";

  const [tab, setTab] = useState(initial),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [code, setCode] = useState(""),
    [notice, setNotice] = useState("");
  const schools = useResource(tab === "register" ? "/public/schools" : null);
  const staffAccess =
    new URLSearchParams(location.search).get("akses") === "staf";

  useEffect(() => {
    setTab(initial);
  }, [initial]);

  useEffect(() => {
    if (tab !== "status" || !user) return;
    const timer = setInterval(() => {
      if (navigator.onLine) refresh().catch(() => {});
    }, 20000);
    return () => clearInterval(timer);
  }, [tab, user, refresh]);

  if (authLoading) return <Loading />;
  if (user?.active && location.pathname !== "/status")
    return <Navigate to={user.destination} replace />;
  if (
    location.pathname === "/masuk" ||
    (location.pathname === "/status" && !user)
  )
    return <LoginCard statusPrompt={location.pathname === "/status"} />;

  const switchTab = (next) => {
    setError("");
    setNotice("");
    setTab(next);
    const routeMap = {
      login: staffAccess ? "/masuk?akses=staf" : "/masuk",
      register: "/daftar",
      status: "/status",
      recover: staffAccess ? "/pemulihan?akses=staf" : "/pemulihan",
    };
    if (
      routeMap[next] &&
      `${location.pathname}${location.search}` !== routeMap[next]
    ) {
      navigate(routeMap[next]);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    setNotice("");
    const form = new FormData(event.currentTarget),
      input = Object.fromEntries(form.entries());
    try {
      if (tab === "register") {
        const result = await register({
          ...input,
          semester: Number(input.semester),
          consent: form.has("consent"),
          noticeVersion: "2026-11-v1",
        });
        setCode(result.recoveryCode);
        setTab("status");
        navigate("/status");
      } else if (tab === "recover") {
        const result = await api("/auth/recover", {
          method: "POST",
          body: input,
        });
        setCode(result.recoveryCode);
        setNotice(
          "Kata sandi diperbarui. Simpan kode baru, lalu masuk kembali.",
        );
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <Link className="auth-back-link" to="/">
        <ArrowLeft size={16} aria-hidden="true" />
        Kembali ke halaman awal
      </Link>

      <div className="surface card access-card">
        <div className="tabs compact">
          {[
            ["login", "Masuk akun"],
            ["register", "Daftar siswa"],
            ["status", "Cek status"],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => switchTab(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <Banner type="error">{error || authError || schools.error}</Banner>
        {authError && (
          <Button variant="secondary" onClick={() => refresh().catch(() => {})}>
            Coba hubungkan kembali
          </Button>
        )}
        {tab === "register" && schools.error && (
          <Button variant="secondary" onClick={schools.reload}>
            Muat ulang daftar sekolah
          </Button>
        )}
        {tab === "register" &&
          !schools.loading &&
          !schools.error &&
          !schools.data?.items.length && (
            <Banner>
              Pendaftaran sekolah belum dibuka. Hubungi petugas sekolah untuk
              mendapatkan akses.
            </Banner>
          )}
        {notice && <Banner type="success">{notice}</Banner>}

        {code && (
          <div className="surface recovery-card">
            <ShieldCheck aria-hidden="true" />
            <strong>Simpan kode pemulihan ini</strong>
            <code>{code}</code>
            <p>
              Ditampilkan satu kali. Simpan di tempat aman, terpisah dari kata
              sandi. Kode berikutnya menggantikan kode ini.
            </p>
            <Button
              type="button"
              variant="secondary small"
              onClick={() => setCode("")}
            >
              Sudah kusimpan
            </Button>
          </div>
        )}

        <ViewTransition transitionKey={tab}>
          {tab === "status" && user ? (
            <>
              <div className="status-illustration">
                <Clock3 size={30} aria-hidden="true" />
              </div>
              <h1>
                {user.active
                  ? "Akunmu siap digunakan"
                  : user.status === "rejected"
                    ? "Pendaftaran belum disetujui"
                    : user.status === "suspended"
                      ? "Akun sedang dinonaktifkan"
                      : user.status === "approved"
                        ? "Satu persetujuan lagi"
                        : "Langkah pertamamu sudah diterima"}
              </h1>
              <p>
                Pantau keputusan pendaftaran di sini. Persetujuan akun dan izin
                wali diperiksa secara terpisah.
              </p>
              <div className="status-list">
                <div>
                  <span>Status akun</span>
                  <Badge status={user.status} />
                </div>
                <div>
                  <span>Persetujuan wali</span>
                  <Badge status={user.guardianStatus} />
                </div>
                {user.reviewedAt && (
                  <div>
                    <span>Diputuskan</span>
                    <strong>{date(user.reviewedAt, true)}</strong>
                  </div>
                )}
              </div>
              {user.reason && (
                <Banner type="warning">Alasan keputusan: {user.reason}</Banner>
              )}
              {user.status === "approved" && !user.active && (
                <Banner>
                  Hubungi petugas sekolah untuk verifikasi izin wali. Kamu tetap
                  dapat membaca Peta Jalur.
                </Banner>
              )}
              <div className="stack">
                <Button
                  type="button"
                  onClick={async () => {
                    setBusy(true);
                    try {
                      await refresh();
                    } catch (e) {
                      setError(e.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                  disabled={busy}
                >
                  {busy ? "Memeriksa…" : "Perbarui status"}
                </Button>
                {user.active && (
                  <Link className="button" to={user.destination}>
                    Buka ruang langkahku
                  </Link>
                )}
                <Link className="button secondary" to="/peta-jalur">
                  Jelajahi Peta Jalur
                </Link>
                <button
                  type="button"
                  className="text-link"
                  onClick={() =>
                    openPanel("Pengaturan akun", <SettingsPanel />)
                  }
                >
                  Batalkan pendaftaran / kelola akun
                </button>
              </div>
            </>
          ) : (
            <>
              <h1>
                {tab === "register"
                  ? "Mulai langkah pertamamu"
                  : tab === "recover"
                    ? "Pulihkan akses akun"
                    : tab === "status"
                      ? "Masuk untuk melihat keputusan"
                      : "Selamat datang kembali"}
              </h1>
              <p>
                {tab === "register"
                  ? "Buat akun siswa. Petugas sekolah akan meninjau pendaftaranmu."
                  : tab === "recover"
                    ? "Gunakan kode pemulihan sekali pakai. Jika hilang, hubungi sekolah untuk verifikasi langsung."
                    : "Masuk melalui akses yang sesuai dengan akunmu."}
              </p>
              <form onSubmit={submit} className="stack" key={tab}>
                <Field
                  label="Username"
                  name="username"
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={40}
                  pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]*"
                  placeholder="Username akunmu"
                />
                {tab === "recover" && (
                  <Field
                    label="Kode pemulihan"
                    name="code"
                    required
                    autoComplete="off"
                  />
                )}
                <Field
                  label={tab === "recover" ? "Kata sandi baru" : "Kata sandi"}
                  name="password"
                  type="password"
                  required
                  minLength={tab === "register" || tab === "recover" ? 12 : 1}
                  maxLength={128}
                  autoComplete={
                    tab === "register" || tab === "recover"
                      ? "new-password"
                      : "current-password"
                  }
                  placeholder={
                    tab === "register"
                      ? "Minimal 12 karakter"
                      : "Masukkan kata sandi"
                  }
                  hint={
                    tab === "register"
                      ? "Gunakan frasa panjang yang sulit ditebak."
                      : undefined
                  }
                />
                {tab === "register" && (
                  <>
                    <Field
                      label="Nama panggilan"
                      name="nickname"
                      required
                      minLength={2}
                      maxLength={40}
                      placeholder="Kami boleh memanggilmu siapa?"
                    />
                    <Select
                      label="Sekolah"
                      name="schoolCode"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Pilih sekolahmu
                      </option>
                      {schools.data?.items.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                    <div className="form-grid">
                      <Select label="Kelas" name="grade">
                        <option>XI</option>
                        <option>XII</option>
                      </Select>
                      <Select label="Semester" name="semester">
                        <option value="1">1</option>
                        <option value="2">2</option>
                      </Select>
                    </div>
                    <Select label="Kategori usia" name="ageBand">
                      <option value="under18">Di bawah 18 tahun</option>
                      <option value="adult">18 tahun atau lebih</option>
                    </Select>
                    <details className="surface privacy-details">
                      <summary>Bagaimana dataku digunakan?</summary>
                      <p>
                        Akun dipakai untuk refleksi dan perencanaan karier.
                        Jurnal hanya dapat dibaca pemilik. BK hanya menerima
                        ringkasan yang kamu pilih. Superadmin melihat data
                        administrasi pendaftaran. Kamu dapat mengekspor dan
                        menghapus data. Data privat memerlukan internet dan
                        tidak disimpan untuk luring. Jadwal retensi dan kontak
                        sekolah ditampilkan di pengaturan.
                      </p>
                    </details>
                    <label className="check-row">
                      <input type="checkbox" name="consent" required />
                      <span>
                        Saya memahami penjelasan data dan setuju menggunakan
                        LANGKAHKU. Jika di bawah 18 tahun, izin wali perlu
                        diverifikasi sekolah.
                      </span>
                    </label>
                  </>
                )}
                <Button
                  type="submit"
                  disabled={
                    busy ||
                    !!authError ||
                    (tab === "register" &&
                      (schools.loading || !schools.data?.items.length))
                  }
                >
                  {busy
                    ? "Memproses…"
                    : tab === "register"
                      ? "Daftar akun siswa"
                      : tab === "recover"
                        ? "Perbarui kata sandi"
                        : "Masuk ke ruang langkahku"}
                </Button>
                {tab !== "register" && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      switchTab(tab === "recover" ? "login" : "recover")
                    }
                  >
                    {tab === "recover" ? "Kembali masuk" : "Lupa kata sandi?"}
                  </button>
                )}
              </form>
            </>
          )}
        </ViewTransition>
      </div>

      <div className="surface access-note blush">
        <ShieldCheck size={22} aria-hidden="true" />
        <div>
          <strong>Ruangmu, pilihanmu.</strong>
          <p>
            Ini pendamping refleksi, bukan tes atau penentu karier. Kamu yang
            memegang arah.
          </p>
        </div>
      </div>
    </div>
  );
}

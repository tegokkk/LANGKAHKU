import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Download, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useResource } from "../../hooks/useResource";
import { api, downloadJson } from "../../services/api";
import { Button, Field, Select, Banner, Loading, date, usePanel } from "../ui";
export function HelpPanel() {
  const { user } = useAuth(),
    services = useResource(
      user ? `/public/services?schoolId=${user.schoolId}` : null,
    );
  const settings = services.data?.school?.service_settings;
  return (
    <div className="stack">
      <div className="surface banner sage">
        <ShieldCheck />
        <p>
          Langkah kecil, arah yang lebih jelas. Kamu boleh mengubah pilihan,
          melewati pertanyaan, dan meminta bantuan.
        </p>
      </div>
      <h3>Siapa yang melihat dataku?</h3>
      <p>
        Jurnal hanya untuk siswa pemilik. Guru BK hanya menerima ringkasan yang
        kamu pilih saat konsultasi. Superadmin mengurus pendaftaran dan akun,
        tanpa akses otomatis ke data konseling.
      </p>
      <h3>Butuh bicara sekarang?</h3>
      <p>
        Hubungi guru BK atau orang dewasa tepercaya di sekolah. Form konsultasi
        bukan percakapan langsung dan tidak dipantau 24 jam.
      </p>
      {services.loading && user ? (
        <Loading />
      ) : settings?.hours ? (
        <>
          <p>
            <strong>Jam layanan:</strong> {settings.hours}
          </p>
          <p>
            <strong>Estimasi respons:</strong> {settings.responseEstimate}
          </p>
          <p>
            <strong>Kontak sekolah:</strong>{" "}
            {settings.helpContact || "Belum diisi sekolah"}
          </p>
          <small>
            Penanggung jawab: {settings.responsible} · Verifikasi{" "}
            {date(settings.verifiedAt)} · {services.data.school.timezone}
          </small>
        </>
      ) : (
        <Banner type="warning">
          Jam layanan dan kontak bantuan belum diverifikasi sekolah. Tanyakan
          langsung kepada petugas sekolah.
        </Banner>
      )}
      <h3>Pilihan dan hakmu</h3>
      <p>
        Persetujuan wali diperiksa terpisah dari approval akun. Ringkasan yang
        dibagikan dapat dicabut; informasi yang sudah dilihat di luar aplikasi
        tidak dapat ditarik kembali.
      </p>
      <p>
        Ekspor dan hapus tersedia di pengaturan akun. Data privat tidak masuk
        penyimpanan luring. Keluar setelah memakai perangkat bersama. Masa
        simpan sekolah perlu ditetapkan sebelum penggunaan nyata.
      </p>
      <a
        className="text-link"
        href="/worksheets/lembar-langkahku.html"
        target="_blank"
        rel="noreferrer"
      >
        Buka lembar kerja kosong untuk dicetak
      </a>
      <a
        className="text-link"
        href="/worksheets/lembar-kerja-langkahku.pdf"
        download
      >
        Unduh PDF lembar kerja kosong
      </a>
    </div>
  );
}
export function SettingsPanel() {
  const { user, setUser, refresh } = useAuth(),
    { closePanel } = usePanel(),
    navigate = useNavigate();
  const [tab, setTab] = useState("profile"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [selected, setSelected] = useState([
      "profile",
      "reflection",
      "comparison",
      "plan",
      "consultations",
    ]);
  const retention = useResource("/account/retention");
  if (!user) return <Banner>Masuk untuk mengelola akun.</Banner>;
  const run = async (action) => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await action();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="stack">
      <div className="tabs compact">
        <button
          className={tab === "profile" ? "active" : ""}
          onClick={() => setTab("profile")}
        >
          Profil
        </button>
        {user.active && (
          <button
            className={tab === "export" ? "active" : ""}
            onClick={() => setTab("export")}
          >
            Ekspor
          </button>
        )}
        <button
          className={tab === "delete" ? "active" : ""}
          onClick={() => setTab("delete")}
        >
          Hapus data
        </button>
      </div>
      <Banner type="error">{error}</Banner>
      <Banner type="success">{notice}</Banner>
      {tab === "profile" ? (
        <>
          <h3>Profil minimum</h3>
          {user.active ? (
            <form
              className="stack"
              onSubmit={(e) => {
                e.preventDefault();
                const data = Object.fromEntries(new FormData(e.currentTarget));
                run(async () => {
                  await api("/student/profile", {
                    method: "PATCH",
                    body: { ...data, semester: Number(data.semester) },
                  });
                  await refresh();
                  setNotice("Profil tersimpan.");
                });
              }}
            >
              <Field
                label="Nama panggilan"
                name="nickname"
                defaultValue={user.nickname}
                required
                minLength={2}
                maxLength={40}
              />
              <div className="form-grid">
                <Select label="Kelas" name="grade" defaultValue={user.grade}>
                  <option>XI</option>
                  <option>XII</option>
                </Select>
                <Select
                  label="Semester"
                  name="semester"
                  defaultValue={user.semester}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                </Select>
              </div>
              <Button disabled={busy}>Simpan profil</Button>
            </form>
          ) : (
            <p>
              @{user.username} · {user.nickname} · Kelas {user.grade}
            </p>
          )}
          <h3>Masa simpan</h3>
          <p>
            {retention.data?.scheduledDeletionAt
              ? `Penghapusan terjadwal: ${date(retention.data.scheduledDeletionAt)}`
              : "Tanggal retensi angkatan belum ditetapkan sekolah."}
          </p>
          {!retention.data?.retentionValidated && (
            <Banner type="warning">
              Kebijakan retensi operasional belum divalidasi. Gunakan data
              fiktif di lingkungan pengembangan.
            </Banner>
          )}
          <p>
            Akses diblokir segera saat hapus akun. Penghapusan aktif ditargetkan
            paling lambat 24 jam melalui job terjadwal; backup terenkripsi
            memiliki batas 30 hari.
          </p>
          <h3>Keamanan</h3>
          <p>
            Pemulihan kata sandi menggunakan kode sekali pakai pada halaman
            masuk dan mencabut sesi lama. Jangan bagikan kode tersebut.
          </p>
          {user.active && (
            <>
              <h3>Ringkasan yang dibagikan</h3>
              <p>
                Lihat penerima, masa akses, dan cabut izin dari detail
                permintaan konsultasi.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  closePanel();
                  navigate("/sapa-bk");
                }}
              >
                Kelola akses ringkasan
              </Button>
            </>
          )}
        </>
      ) : tab === "export" ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            const password = new FormData(e.currentTarget).get("password");
            run(async () => {
              const data = await api("/student/export", {
                method: "POST",
                body: { password, sections: selected },
              });
              downloadJson(data, "langkahku-ekspor.json");
              setNotice(
                "Ekspor siap. Jaga file karena dapat dibaca orang yang memilikinya.",
              );
            });
          }}
        >
          <h3>Pilih bagian untuk diekspor</h3>
          {[
            ["profile", "Profil"],
            ["reflection", "Kenali Diriku"],
            ["comparison", "Timbang Pilihan"],
            ["plan", "Rencana Langkahku"],
            ["consultations", "Permintaan konsultasi"],
            ["journal", "Jurnal privat — pilihan terpisah"],
          ].map(([id, label]) => (
            <label className="check-row" key={id}>
              <input
                type="checkbox"
                checked={selected.includes(id)}
                onChange={(e) =>
                  setSelected((v) =>
                    e.target.checked ? [...v, id] : v.filter((x) => x !== id),
                  )
                }
              />
              {label}
            </label>
          ))}
          <Banner>
            File berisi data pribadi. Simpan di perangkat yang kamu percayai.
            Jurnal tidak dipilih secara bawaan.
          </Banner>
          <Field
            label="Konfirmasi kata sandi"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
          <Button disabled={busy || !selected.length}>
            <Download size={18} />
            Unduh ekspor JSON
          </Button>
        </form>
      ) : (
        <>
          <h3>Hapus dengan sadar</h3>
          <Banner type="warning">
            Penghapusan tidak dapat dibatalkan. Hapus per fitur juga mencabut
            salinan ringkasannya yang dibagikan. Unduhan di luar aplikasi tidak
            ikut dihapus.
          </Banner>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const input = Object.fromEntries(new FormData(e.currentTarget));
              run(async () => {
                if (input.kind === "account") {
                  await api("/account/delete", {
                    method: "POST",
                    body: {
                      password: input.password,
                      confirmation: input.confirmation,
                    },
                  });
                  setUser(null);
                  closePanel();
                  navigate("/masuk");
                  await refresh();
                } else {
                  await api(`/student/data/${input.kind}`, {
                    method: "DELETE",
                    body: { password: input.password },
                  });
                  setNotice("Data fitur dan snapshot terkait telah dihapus.");
                }
              });
            }}
          >
            <Select
              label="Data yang dihapus"
              name="kind"
              defaultValue="account"
            >
              {user.active &&
                [
                  ["reflection", "Kenali Diriku"],
                  ["comparison", "Timbang Pilihan"],
                  ["plan", "Rencana"],
                  ["journal", "Jurnal"],
                  ["consultations", "Konsultasi"],
                ].map(([id, label]) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              <option value="account">
                Seluruh akun / batalkan pendaftaran
              </option>
            </Select>
            <Field
              label="Kata sandi"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Field
              label="Ketik HAPUS AKUN untuk penghapusan akun"
              name="confirmation"
              placeholder="HAPUS AKUN"
            />
            <Button variant="danger" disabled={busy}>
              <Trash2 size={18} />
              Hapus data yang dipilih
            </Button>
          </form>
        </>
      )}
    </div>
  );
}

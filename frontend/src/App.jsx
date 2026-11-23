import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Loading, Banner, Button, Empty } from "./components/ui";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import AccessPage from "./pages/AccessPage";

const HomePage = lazy(() => import("./pages/HomePage"));
const ReflectionPage = lazy(() => import("./pages/ReflectionPage"));
const PathwaysPage = lazy(() => import("./pages/PathwaysPage"));
const PlanPage = lazy(() => import("./pages/PlanPage"));
const ConsultationPage = lazy(() => import("./pages/ConsultationPage"));
const ApprovalsPage = lazy(() => import("./pages/ApprovalsPage"));
const RequestsPage = lazy(() =>
  import("./pages/BkPages").then((m) => ({ default: m.RequestsPage })),
);
const StudentsPage = lazy(() =>
  import("./pages/BkPages").then((m) => ({ default: m.StudentsPage })),
);
const SharedHistoryPage = lazy(() =>
  import("./pages/BkPages").then((m) => ({ default: m.SharedHistoryPage })),
);
const AggregatesPage = lazy(() =>
  import("./pages/BkPages").then((m) => ({ default: m.AggregatesPage })),
);
const ManagePage = lazy(() =>
  import("./pages/BkPages").then((m) => ({ default: m.ManagePage })),
);
const AboutPage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.AboutPage })),
);
const HowToUsePage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.HowToUsePage })),
);
const StoriesPage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.StoriesPage })),
);
const ParentsGuidePage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.ParentsGuidePage })),
);
const FaqPage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.FaqPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.PrivacyPage })),
);
const DownloadsPage = lazy(() =>
  import("./pages/PublicPages").then((m) => ({ default: m.DownloadsPage })),
);

function Protected({ role }) {
  const { user, loading, error, refresh } = useAuth(),
    location = useLocation();
  if (loading) return <Loading />;
  if (error && !user)
    return (
      <Banner type="error">
        {error}
        <Button onClick={() => refresh().catch(() => {})}>
          Coba hubungkan lagi
        </Button>
      </Banner>
    );
  if (!user)
    return (
      <Navigate
        to={role === "siswa" ? "/masuk" : "/masuk?akses=staf"}
        state={{ from: location.pathname }}
        replace
      />
    );
  if (!user.active) return <Navigate to="/status" replace />;
  if (user.role !== role) return <Navigate to={user.destination} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          {["/masuk", "/daftar", "/pemulihan", "/status"].map((path) => (
            <Route path={path} element={<AccessPage />} key={path} />
          ))}
          <Route path="/tentang" element={<AboutPage />} />
          <Route path="/cara-menggunakan" element={<HowToUsePage />} />
          <Route path="/peta-jalur" element={<PathwaysPage />} />
          <Route path="/cerita-langkah" element={<StoriesPage />} />
          <Route path="/panduan-orang-tua" element={<ParentsGuidePage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/privasi" element={<PrivacyPage />} />
          <Route path="/unduhan" element={<DownloadsPage />} />
          <Route element={<Protected role="siswa" />}>
            <Route path="/beranda" element={<HomePage />} />
            <Route path="/kenali-diriku" element={<ReflectionPage />} />
            <Route path="/rencana" element={<PlanPage />} />
            <Route path="/timbang-pilihan" element={<PlanPage />} />
            <Route path="/sapa-bk" element={<ConsultationPage />} />
          </Route>
          <Route element={<Protected role="superadmin" />}>
            <Route path="/superadmin/pendaftaran" element={<ApprovalsPage />} />
          </Route>
          <Route element={<Protected role="bk" />}>
            <Route path="/bk/permintaan" element={<RequestsPage />} />
            <Route path="/bk/siswa" element={<StudentsPage />} />
            <Route
              path="/bk/riwayat-jawaban"
              element={<SharedHistoryPage />}
            />
            <Route path="/bk/agregat" element={<AggregatesPage />} />
            <Route path="/bk/kelola" element={<ManagePage />} />
          </Route>
          <Route
            path="*"
            element={
              <Empty title="Halaman belum ditemukan">
                Gunakan navigasi untuk kembali ke ruang langkahmu.
              </Empty>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

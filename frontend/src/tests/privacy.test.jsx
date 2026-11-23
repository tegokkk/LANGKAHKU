import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PanelProvider } from "../components/ui";
import ConsultationPage from "../pages/ConsultationPage";
import App from "../App";
const user = {
  id: "u",
  schoolId: "s",
  nickname: "Siswa Fiktif",
  role: "siswa",
  status: "approved",
  active: true,
  grade: "XI",
  semester: 1,
  destination: "/beranda",
};
const response = (data) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function providers(ui, path = "/sapa-bk") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <PanelProvider>{ui}</PanelProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}
describe("privacy-critical UI", () => {
  it("expired sessions remove the private page and return to login", async () => {
    let signedIn = true;
    vi.stubGlobal(
      "fetch",
      vi.fn((path) =>
        response(
          path.includes("/auth/me")
            ? { user: signedIn ? user : null, csrf: "fresh-token" }
            : path.includes("/student/home")
              ? { user, progress: {}, plan: null }
              : { items: [] },
        ),
      ),
    );
    providers(<App />, "/beranda");
    await screen.findByRole("heading", {
      name: /langkah|halo|pagi|siang|sore|malam/i,
      level: 1,
    });
    signedIn = false;
    act(() => window.dispatchEvent(new Event("session-expired")));
    expect(
      await screen.findByRole("heading", { name: "Selamat datang kembali" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /jurnal privat/i }),
    ).not.toBeInTheDocument();
  });
  it("sharing is empty by default, journal is absent and preview permits no attachment", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path) =>
        response(
          path.includes("/auth/me")
            ? { user, csrf: "test" }
            : path.includes("/teachers")
              ? {
                  items: [{ id: "teacher", nickname: "Guru Fiktif" }],
                  school: { service_settings: {} },
                }
              : { items: [] },
        ),
      ),
    );
    providers(<ConsultationPage />);
    await screen.findByText("Guru Fiktif");
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((x) => expect(x).not.toBeChecked());
    expect(
      screen.queryByRole("checkbox", { name: /jurnal/i }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Waktu yang memungkinkan"), {
      target: { value: "Senin setelah kelas" },
    });
    const mock = fetch;
    mock.mockImplementation((path) =>
      response(
        path.includes("/preview")
          ? { snapshots: [], expiresInDays: 30 }
          : { items: [] },
      ),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Pratinjau permintaan" }),
    );
    expect(
      await screen.findByText("Tidak ada lampiran ringkasan yang dibagikan."),
    ).toBeInTheDocument();
  });
  it("pending account is redirected to status before rendering private forms", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((path) =>
        response(
          path.includes("/auth/me")
            ? {
                user: {
                  ...user,
                  status: "pending_approval",
                  active: false,
                  guardianStatus: "pending",
                  destination: "/status",
                },
                csrf: "test",
              }
            : { items: [] },
        ),
      ),
    );
    providers(<App />, "/kenali-diriku");
    expect(
      await screen.findByText("Langkah pertamamu sudah diterima"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Apa yang membuatmu ingin mencoba?"),
    ).not.toBeInTheDocument();
  });
});

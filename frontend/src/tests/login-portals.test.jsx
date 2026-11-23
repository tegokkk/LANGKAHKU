import { beforeEach, afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import LoginCard from "../features/auth/LoginCard";

const auth = vi.hoisted(() => ({ login: vi.fn(), refresh: vi.fn() }));
vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ ...auth, error: "" }),
}));
beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);
function setup(path = "/masuk") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/masuk" element={<LoginCard />} />
        <Route path="/beranda" element={<h1>Beranda siswa</h1>} />
        <Route path="/bk/permintaan" element={<h1>Ruang guru BK</h1>} />
        <Route
          path="/superadmin/pendaftaran"
          element={<h1>Ruang superadmin</h1>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

it("switches to staff access while clearing passwords and disabling the hidden face", () => {
  const { container } = setup();
  const student = screen.getByRole("region", { name: "Login siswa" });
  const password = within(student).getByLabelText("Kata sandi");
  fireEvent.change(password, { target: { value: "private-unsent-password" } });
  expect(
    screen.queryByRole("region", { name: "Login superadmin dan guru BK" }),
  ).not.toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Superadmin / BK", exact: true }),
  );
  expect(
    screen.getByRole("region", { name: "Login superadmin dan guru BK" }),
  ).toBeInTheDocument();
  expect(password).toHaveValue("");
  expect(password).toBeDisabled();
  expect(container.querySelector(".login-face--siswa")).toHaveAttribute(
    "inert",
  );
  fireEvent.submit(
    within(student)
      .getByRole("button", { name: "Masuk sebagai siswa", hidden: true })
      .closest("form"),
  );
  expect(auth.login).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Siswa", exact: true }));
  expect(screen.getByRole("region", { name: "Login siswa" })).toBe(student);
  expect(password).not.toBeDisabled();
});

it.each([
  [
    "/masuk",
    "Login siswa",
    "Masuk sebagai siswa",
    "siswa",
    "/beranda",
    "Beranda siswa",
  ],
  [
    "/masuk?akses=staf",
    "Login superadmin dan guru BK",
    "Masuk sebagai staf sekolah",
    "staf",
    "/bk/permintaan",
    "Ruang guru BK",
  ],
  [
    "/masuk?akses=staf",
    "Login superadmin dan guru BK",
    "Masuk sebagai staf sekolah",
    "staf",
    "/superadmin/pendaftaran",
    "Ruang superadmin",
  ],
])(
  "submits the selected portal and follows the server destination: %s -> %s",
  async (path, label, button, audience, destination, heading) => {
    auth.login.mockResolvedValue({ user: { destination } });
    setup(path);
    const face = screen.getByRole("region", { name: label });
    fireEvent.change(within(face).getByLabelText("Username"), {
      target: { value: "akun.uji" },
    });
    fireEvent.change(within(face).getByLabelText("Kata sandi"), {
      target: { value: "password-pengujian" },
    });
    fireEvent.click(within(face).getByRole("button", { name: button }));
    await waitFor(() =>
      expect(auth.login).toHaveBeenCalledWith({
        username: "akun.uji",
        password: "password-pengujian",
        audience,
      }),
    );
    expect(
      await screen.findByRole("heading", { name: heading }),
    ).toBeInTheDocument();
  },
);

it("shows a mismatched-portal error without navigating and clears it on switching access", async () => {
  auth.login.mockRejectedValue(new Error("Gunakan akses Superadmin / BK."));
  setup();
  const face = screen.getByRole("region", { name: "Login siswa" });
  fireEvent.change(within(face).getByLabelText("Username"), {
    target: { value: "admin.demo" },
  });
  fireEvent.change(within(face).getByLabelText("Kata sandi"), {
    target: { value: "password-pengujian" },
  });
  fireEvent.click(
    within(face).getByRole("button", { name: "Masuk sebagai siswa" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Gunakan akses Superadmin / BK.",
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Superadmin / BK", exact: true }),
  );
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

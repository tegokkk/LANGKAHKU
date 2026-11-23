import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null, demo: false, logout: vi.fn() }),
}));
vi.mock("../components/ui/AsmrBackground", () => ({ default: () => null }));
vi.mock("../components/ui/AdaptiveNavPill", () => ({ default: () => null }));
vi.mock("../components/ui", async (importOriginal) => ({
  ...(await importOriginal()),
  usePanel: () => ({ openPanel: vi.fn() }),
}));

beforeEach(() => vi.spyOn(window, "scrollTo").mockImplementation(() => {}));
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function setup() {
  render(
    <MemoryRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<h1>Halaman awal</h1>} />
          <Route path="/tentang" element={<h1>Halaman tentang</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

it("closes the mobile menu with Escape and restores focus to its toggle", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Buka menu navigasi" }));
  const menu = screen.getByRole("navigation", { name: "Menu halaman publik" });
  const link = within(menu).getByRole("link", { name: "Tentang LANGKAHKU" });
  link.focus();
  fireEvent.keyDown(link, { key: "Escape" });
  const toggle = screen.getByRole("button", { name: "Buka menu navigasi" });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
  expect(
    screen.queryByRole("navigation", { name: "Menu halaman publik" }),
  ).not.toBeInTheDocument();
});

it("closes the drawer and returns to the top when opening another page", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Buka menu navigasi" }));
  window.scrollTo.mockClear();
  const menu = screen.getByRole("navigation", { name: "Menu halaman publik" });
  fireEvent.click(
    within(menu).getByRole("link", { name: "Tentang LANGKAHKU" }),
  );
  expect(
    screen.getByRole("heading", { name: "Halaman tentang" }),
  ).toBeInTheDocument();
  expect(window.scrollTo).toHaveBeenCalledWith({
    top: 0,
    left: 0,
    behavior: "instant",
  });
  expect(
    screen.getByRole("button", { name: "Buka menu navigasi" }),
  ).toHaveAttribute("aria-expanded", "false");
});

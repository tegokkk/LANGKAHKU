import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ApprovalsPage from "../pages/ApprovalsPage";
import { setCsrf } from "../services/api";

const pending = {
  id: "student-30",
  nickname: "Siswa Fiktif 30",
  username: "siswa.demo.30",
  status: "pending_approval",
  version: 7,
  grade: "XI",
  semester: 1,
  schoolName: "Sekolah Fiktif",
  ageBand: "under18",
  guardianStatus: "pending",
  createdAt: "2026-11-22T00:00:00Z",
  studentAgreedAt: "2026-11-22T00:00:00Z",
};
const response = (body, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: async () => body });
beforeEach(() => setCsrf("form-token"));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function setup({ conflict = false, detailFails = false } = {}) {
  let user = { ...pending },
    failDetail = detailFails;
  const fetchMock = vi.fn((path, options = {}) => {
    if (options.method === "POST") {
      if (conflict)
        return response(
          {
            error: {
              code: "VERSION_CONFLICT",
              message:
                "Pendaftaran ini sudah diputuskan atau berubah. Muat ulang untuk melihat keputusan.",
            },
          },
          409,
        );
      user = { ...user, status: "approved", version: user.version + 1 };
      return response({ ok: true });
    }
    if (path.includes("/admin/cohorts")) return response({ items: [] });
    if (path.includes("/admin/registrations?"))
      return response({
        items: user.status === "pending_approval" ? [user] : [],
        total: user.status === "pending_approval" ? 1 : 0,
        pages: 1,
      });
    if (path.endsWith("/admin/registrations/student-30")) {
      if (failDetail) {
        failDetail = false;
        return response(
          { error: { message: "Detail belum dapat dimuat." } },
          503,
        );
      }
      return response({ user, history: [] });
    }
    throw new Error(`Unexpected test request: ${path}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <MemoryRouter>
      <ApprovalsPage />
    </MemoryRouter>,
  );
  return fetchMock;
}

it("opens approval controls explicitly, focuses the detail and submits the current version without approving guardian consent", async () => {
  const fetchMock = setup();
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Tinjau pendaftaran Siswa Fiktif 30",
    }),
  );
  const detail = screen.getByRole("complementary", {
    name: "Detail pendaftaran siswa",
  });
  expect(detail).toHaveFocus();
  fireEvent.click(
    await within(detail).findByRole("button", { name: "Setujui pendaftaran" }),
  );
  expect(
    await within(detail).findByText(
      "Pendaftaran disetujui. Akses siswa masih menunggu verifikasi izin wali.",
    ),
  ).toBeInTheDocument();
  const sent = fetchMock.mock.calls.find(
    ([, options]) => options?.method === "POST",
  );
  expect(sent[0]).toBe("/api/v1/admin/registrations/student-30/decision");
  expect(JSON.parse(sent[1].body)).toEqual({
    decision: "approved",
    version: 7,
  });
  expect(
    within(detail).queryByRole("button", { name: "Setujui pendaftaran" }),
  ).not.toBeInTheDocument();
  expect(
    within(detail).getByRole("button", { name: "Catat verifikasi wali" }),
  ).toBeInTheDocument();
  fireEvent.click(
    within(detail).getByRole("button", { name: "Kembali ke antrean" }),
  );
  expect(
    screen.getByRole("region", { name: "Antrean pendaftaran" }),
  ).toHaveFocus();
});

it("shows a version conflict next to approval controls instead of hiding it above the queue", async () => {
  setup({ conflict: true });
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Tinjau pendaftaran Siswa Fiktif 30",
    }),
  );
  const detail = screen.getByRole("complementary", {
    name: "Detail pendaftaran siswa",
  });
  fireEvent.click(
    await within(detail).findByRole("button", { name: "Setujui pendaftaran" }),
  );
  expect(await within(detail).findByRole("alert")).toHaveTextContent(
    "Pendaftaran ini sudah diputuskan atau berubah.",
  );
  expect(
    within(detail).queryByText(/Pendaftaran disetujui/),
  ).not.toBeInTheDocument();
});

it("allows retrying a failed detail request in the detail panel", async () => {
  setup({ detailFails: true });
  fireEvent.click(
    await screen.findByRole("button", {
      name: "Tinjau pendaftaran Siswa Fiktif 30",
    }),
  );
  const detail = screen.getByRole("complementary", {
    name: "Detail pendaftaran siswa",
  });
  fireEvent.click(
    await within(detail).findByRole("button", { name: "Muat ulang detail" }),
  );
  expect(
    await within(detail).findByRole("button", { name: "Setujui pendaftaran" }),
  ).toBeEnabled();
});

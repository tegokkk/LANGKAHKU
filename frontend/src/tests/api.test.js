import { describe, it, expect, vi, afterEach } from "vitest";
import { api, ApiError } from "../services/api";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("api client error and session handling", () => {
  it("rejects invalid JSON and non-object success responses instead of claiming a successful save", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError();
        },
      }),
    );
    await expect(
      api("/student/documents/plan", { method: "PUT", body: {} }),
    ).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
    fetch.mockResolvedValue({ ok: true, status: 200, json: async () => null });
    await expect(api("/student/home")).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });
  it("bounds waiting time without retrying a write whose commit status is unknown", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_path, options) =>
          new Promise((_resolve, reject) => {
            options.signal.addEventListener(
              "abort",
              () => reject(options.signal.reason),
              { once: true },
            );
          }),
      ),
    );
    await expect(
      api("/student/documents/plan", {
        method: "PUT",
        body: {},
        timeoutMs: 25,
      }),
    ).rejects.toMatchObject({ code: "TIMEOUT" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("throws ApiError OFFLINE without ReferenceError when fetch rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    await expect(api("/student/home")).rejects.toMatchObject({
      name: "Error",
      status: 0,
      code: "OFFLINE",
    });
    await expect(api("/student/home")).rejects.toBeInstanceOf(ApiError);
  });

  it("dispatches session-restricted on 403 ACCOUNT_RESTRICTED", async () => {
    const listener = vi.fn();
    window.addEventListener("session-restricted", listener);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: () =>
          Promise.resolve({
            error: {
              code: "ACCOUNT_RESTRICTED",
              message: "Akun atau persetujuan belum aktif.",
            },
          }),
      }),
    );
    await expect(api("/student/home")).rejects.toMatchObject({
      status: 403,
      code: "ACCOUNT_RESTRICTED",
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("session-restricted", listener);
  });

  it("dispatches session-expired on 401 SESSION_EXPIRED", async () => {
    const listener = vi.fn();
    window.addEventListener("session-expired", listener);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error: {
              code: "SESSION_EXPIRED",
              message: "Silakan masuk kembali.",
            },
          }),
      }),
    );
    await expect(api("/student/home")).rejects.toMatchObject({
      status: 401,
      code: "SESSION_EXPIRED",
    });
    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener("session-expired", listener);
  });
});

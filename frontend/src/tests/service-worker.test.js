// Kontrak cache diperiksa dari worker yang sama dengan keluaran produksi.
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import vm from "node:vm";
describe("service worker privacy allowlist", () => {
  const source = readFileSync("public/sw.js", "utf8");
  function handler() {
    const handlers = {};
    vm.runInNewContext(source, {
      URL,
      self: {
        location: { origin: "https://langkahku.test" },
        addEventListener: (name, fn) => {
          handlers[name] = fn;
        },
      },
      caches: {},
      fetch: () => {},
    });
    return handlers.fetch;
  }
  it("never intercepts authentication, private APIs, exports, or non-GET requests", () => {
    const onFetch = handler();
    for (const path of [
      "/api/v1/auth/me",
      "/api/v1/student/journals",
      "/api/v1/student/export",
      "/api/v1/bk/consultations",
      "/api/v1/admin/registrations",
    ]) {
      let intercepted = false;
      onFetch({
        request: { url: `https://langkahku.test${path}`, method: "GET" },
        respondWith: () => {
          intercepted = true;
        },
      });
      expect(intercepted).toBe(false);
    }
    let intercepted = false;
    onFetch({
      request: { url: "https://langkahku.test/", method: "POST" },
      respondWith: () => {
        intercepted = true;
      },
    });
    expect(intercepted).toBe(false);
  });
  it("does not cache arbitrary assets or third party requests", () => {
    const onFetch = handler();
    for (const url of [
      "https://langkahku.test/private.json",
      "https://external.test/icon.svg",
    ]) {
      let intercepted = false;
      onFetch({
        request: { url, method: "GET" },
        respondWith: () => {
          intercepted = true;
        },
      });
      expect(intercepted).toBe(false);
    }
  });
});

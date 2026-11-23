// Build memasukkan daftar aset publik shell. Tidak ada API, sesi, atau isi privat dalam cache.
const SHELL_CACHE = "langkahku-shell-v1";
const SHELL_ASSETS = [
  "/",
  "/icons/icon.svg",
  "/manifest.webmanifest",
  "/worksheets/lembar-langkahku.html",
];
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith("langkahku-shell-") && key !== SHELL_CACHE) ||
                key === "langkahku-public-selected-v1",
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/offline-content/")
  )
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.open(SHELL_CACHE).then((cache) => cache.match("/")),
      ),
    );
    return;
  }
  if (SHELL_ASSETS.includes(url.pathname))
    event.respondWith(
      caches
        .open(SHELL_CACHE)
        .then((cache) =>
          cache
            .match(event.request)
            .then((cached) => cached || fetch(event.request)),
        ),
    );
});

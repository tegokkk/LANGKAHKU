export const PUBLIC_CACHE = "langkahku-public-selected-v2";
export async function downloadedContent() {
  if (!("caches" in window)) return [];
  const cache = await caches.open(PUBLIC_CACHE);
  return Promise.all(
    (await cache.keys()).map(async (key) => (await cache.match(key)).json()),
  );
}
export async function downloadContent(item) {
  const cache = await caches.open(PUBLIC_CACHE);
  await cache.put(
    `/offline-content/${item.slug}`,
    new Response(
      JSON.stringify({ ...item, downloadedAt: new Date().toISOString() }),
      { headers: { "Content-Type": "application/json" } },
    ),
  );
}
export async function removeContent(slug) {
  const cache = await caches.open(PUBLIC_CACHE);
  await cache.delete(`/offline-content/${slug}`);
}

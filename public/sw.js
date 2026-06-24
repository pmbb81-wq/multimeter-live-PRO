// Multimeter·Live service worker.
// The three __PLACEHOLDER__ values are injected at build time by
// scripts/finalize-pwa.mjs (precache list, base path, content-derived version).
const VERSION = "__VERSION__";
const BASE_PATH = "__BASE_PATH__";
const PRECACHE_URLS = __PRECACHE_URLS__;

const CACHE = `multimeter-${VERSION}`;

// Precache the app shell. Note: NO skipWaiting() here — a new worker waits
// until the user explicitly accepts the update (prompted update strategy).
// `cache: "reload"` bypasses the HTTP cache so the new cache is filled with the
// genuinely-new assets, not a stale copy of index.html (GitHub Pages serves HTML
// with max-age=600, which would otherwise poison the precache).
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: "reload" })))
      )
  );
});

// Drop caches from older versions once this worker takes control.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// The page posts this only when the user clicks "Reload".
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigations → network-first so an online reload always shows the latest UI;
  // fall back to the cached app shell only when offline. (Cache-first here would
  // pin the HTML to whatever was cached, hiding new deploys until the next update.)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(`${BASE_PATH}/index.html`))
    );
    return;
  }

  // Static assets → cache-first, backfilling the cache on a miss.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
    )
  );
});

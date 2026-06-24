// Multimeter·Live service worker.
// The three __PLACEHOLDER__ values are injected at build time by
// scripts/finalize-pwa.mjs (precache list, base path, content-derived version).
const VERSION = "__VERSION__";
const BASE_PATH = "__BASE_PATH__";
const PRECACHE_URLS = __PRECACHE_URLS__;

const CACHE = `multimeter-${VERSION}`;

// Precache the app shell. Note: NO skipWaiting() here — a new worker waits
// until the user explicitly accepts the update (prompted update strategy).
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)));
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

  // Navigations → serve the cached app shell (single-page app fallback).
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match(`${BASE_PATH}/index.html`).then((cached) => cached || fetch(req))
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

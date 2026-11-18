// Offline support: app files are fetched fresh when online (so updates show right away) and served from cache when offline.
const CACHE = "tasks-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const u = new URL(e.request.url);
  const put = (res) => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); } return res; };
  if (u.origin === location.origin) {
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html"))));
  } else if (u.hostname === "www.gstatic.com" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then(put)));
  }
});

/* MedFSP: offline copy of the app. Pages are loaded from the network first (so updates arrive at once) and from the cache when offline. */
const V = "medfsp-v1";
const CORE = ["./", "./index.html", "./az.html", "./en.html", "./de.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url); if (u.origin !== self.location.origin) return;
  const fresh = r.mode === "navigate" || /\.(html|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith("/");
  if (fresh) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.status === 200) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});

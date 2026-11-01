/* Standards Pick & Pack — fonctionnement hors ligne
   Changer VERSION à chaque mise à jour de index.html ou des supports pour forcer le rechargement. */
const VERSION = "spp-2026-11-01";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];
const SLIDES = [  "slides/P01-1.webp?v=2610",  "slides/P01-2.webp?v=2610",  "slides/P01-3.webp?v=2610",  "slides/P01-4.webp?v=2610",  "slides/P01-5.webp?v=2610",  "slides/P01-6.webp?v=2610",  "slides/P01-7.webp?v=2610",  "slides/P01-8.webp?v=2610",  "slides/P02-1.webp?v=2610",  "slides/P02-2.webp?v=2610",  "slides/P02-3.webp?v=2610",  "slides/P02-4.webp?v=2610",  "slides/P02-5.webp?v=2610",  "slides/P02-6.webp?v=2610",  "slides/P02-7.webp?v=2610",  "slides/P02-8.webp?v=2610",  "slides/P03-1.webp?v=2610",  "slides/P03-2.webp?v=2610",  "slides/P03-3.webp?v=2610",  "slides/P03-4.webp?v=2610",  "slides/P03-5.webp?v=2610",  "slides/P03-6.webp?v=2610",  "slides/P03-7.webp?v=2610",  "slides/P03-8.webp?v=2610",  "slides/P04-1.webp?v=2610",  "slides/P04-2.webp?v=2610",  "slides/P04-3.webp?v=2610",  "slides/P04-4.webp?v=2610",  "slides/P04-5.webp?v=2610",  "slides/P04-6.webp?v=2610",  "slides/P04-7.webp?v=2610",  "slides/P04-8.webp?v=2610",  "slides/P05-1.webp?v=2610",  "slides/P05-2.webp?v=2610",  "slides/P05-3.webp?v=2610",  "slides/P05-4.webp?v=2610",  "slides/P05-5.webp?v=2610",  "slides/P05-6.webp?v=2610",  "slides/P05-7.webp?v=2610",  "slides/P05-8.webp?v=2610",  "slides/P06-1.webp?v=2610",  "slides/P06-2.webp?v=2610",  "slides/P06-3.webp?v=2610",  "slides/P06-4.webp?v=2610",  "slides/P06-5.webp?v=2610",  "slides/P06-6.webp?v=2610",  "slides/P06-7.webp?v=2610",  "slides/P06-8.webp?v=2610",  "slides/P07-1.webp?v=2610",  "slides/P07-2.webp?v=2610",  "slides/P07-3.webp?v=2610",  "slides/P07-4.webp?v=2610",  "slides/P07-5.webp?v=2610",  "slides/P07-6.webp?v=2610",  "slides/P07-7.webp?v=2610",  "slides/P07-8.webp?v=2610",  "slides/P08-1.webp?v=2610",  "slides/P08-2.webp?v=2610",  "slides/P08-3.webp?v=2610",  "slides/P08-4.webp?v=2610",  "slides/P08-5.webp?v=2610",  "slides/P08-6.webp?v=2610",  "slides/P08-7.webp?v=2610",  "slides/P08-8.webp?v=2610",  "slides/P09-1.webp?v=2610",  "slides/P09-2.webp?v=2610",  "slides/P09-3.webp?v=2610",  "slides/P09-4.webp?v=2610",  "slides/P09-5.webp?v=2610",  "slides/P09-6.webp?v=2610",  "slides/P09-7.webp?v=2610",  "slides/P09-8.webp?v=2610",  "slides/P10-1.webp?v=2610",  "slides/P10-2.webp?v=2610",  "slides/P10-3.webp?v=2610",  "slides/P10-4.webp?v=2610",  "slides/P10-5.webp?v=2610",  "slides/P10-6.webp?v=2610",  "slides/P10-7.webp?v=2610",  "slides/P10-8.webp?v=2610",  "slides/P11-1.webp?v=2610",  "slides/P11-5.webp?v=2610",  "slides/P11-6.webp?v=2610",  "slides/P11-7.webp?v=2610",  "slides/P11-8.webp?v=2610",  "slides/P12-1.webp?v=2610",  "slides/P12-2.webp?v=2610",  "slides/P12-3.webp?v=2610",  "slides/P12-4.webp?v=2610",  "slides/P12-5.webp?v=2610",  "slides/P12-6.webp?v=2610",  "slides/P12-7.webp?v=2610",  "slides/P12-8.webp?v=2610",  "slides/P13-1.webp?v=2610",  "slides/P13-2.webp?v=2610",  "slides/P13-3.webp?v=2610",  "slides/P13-4.webp?v=2610",  "slides/P13-5.webp?v=2610",  "slides/P13-6.webp?v=2610",  "slides/P13-7.webp?v=2610",  "slides/P13-8.webp?v=2610",  "slides/P14-1.webp?v=2610",  "slides/P14-2.webp?v=2610",  "slides/P14-3.webp?v=2610",  "slides/P14-4.webp?v=2610",  "slides/P14-5.webp?v=2610",  "slides/P14-6.webp?v=2610",  "slides/P14-7.webp?v=2610",  "slides/P14-8.webp?v=2610",  "slides/P15-1.webp?v=2610",  "slides/P15-2.webp?v=2610",  "slides/P15-3.webp?v=2610",  "slides/P15-4.webp?v=2610",  "slides/P15-5.webp?v=2610",  "slides/P15-6.webp?v=2610",  "slides/P15-7.webp?v=2610",  "slides/P15-8.webp?v=2610",  "slides/P16-1.webp?v=2610",  "slides/P16-2.webp?v=2610",  "slides/P16-3.webp?v=2610",  "slides/P16-4.webp?v=2610",  "slides/P16-5.webp?v=2610",  "slides/P16-6.webp?v=2610",  "slides/P16-7.webp?v=2610",  "slides/P16-8.webp?v=2610",  "slides/P17-1.webp?v=2610",  "slides/P17-2.webp?v=2610",  "slides/P17-3.webp?v=2610",  "slides/P17-4.webp?v=2610",  "slides/P17-5.webp?v=2610",  "slides/P17-6.webp?v=2610",  "slides/P17-7.webp?v=2610",  "slides/P17-8.webp?v=2610",  "slides/P18-1.webp?v=2610",  "slides/P18-2.webp?v=2610",  "slides/P18-3.webp?v=2610",  "slides/P18-4.webp?v=2610",  "slides/P18-5.webp?v=2610",  "slides/P18-6.webp?v=2610",  "slides/P18-7.webp?v=2610",  "slides/P18-8.webp?v=2610"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(SHELL);
    /* les supports en arrière-plan : un échec isolé ne bloque pas l'installation */
    await Promise.allSettled(SLIDES.map(u => c.add(u)));
  }).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== VERSION).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  /* page : réseau d'abord (toujours la dernière version), cache si hors ligne */
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(VERSION).then(x => x.put("index.html", c)); return res; })
      .catch(() => caches.match("index.html")));
    return;
  }
  /* PowerPoint : jamais mis en cache (lourd, téléchargement ponctuel) */
  if (u.pathname.endsWith(".pptx")) return;
  /* le reste (images, polices, icônes) : cache d'abord */
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => {
    if (res.ok || res.type === "opaque") { const c = res.clone(); caches.open(VERSION).then(x => x.put(r, c)); }
    return res;
  })));
});

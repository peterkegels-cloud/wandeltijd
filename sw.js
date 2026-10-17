// Wandeltijd: werkt offline. Bij elke update dit versienummer verhogen.
// Ruimt alleen eigen caches (wandeltijd-...) op: Eten en X4 op hetzelfde adres blijven intact.
const VERSION = 'wandeltijd-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('wandeltijd-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Eerst netwerk (nieuwste versie, pagina altijd vers van GitHub), zonder bereik uit de cache.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, e.request.mode === 'navigate' ? { cache: 'no-store' } : {}).then(r => {
      const copy = r.clone();
      caches.open(VERSION).then(c => c.put(e.request, copy));
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});

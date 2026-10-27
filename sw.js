// Offline support: serve the saved copy first, refresh it in the background when online.
const CACHE = 'swap-clock-202610271942';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const key = req.mode === 'navigate' ? './index.html' : req;
    const hit = await c.match(key, {ignoreSearch: true});
    const fresh = fetch(req).then(res => { if(res && (res.ok || res.type === 'opaque')) c.put(key, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});

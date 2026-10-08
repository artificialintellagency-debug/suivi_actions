const V = 'cours-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Les fichiers de l'appli : cache d'abord, mis à jour en arrière-plan.
// Le lien CSV Google (autre domaine) n'est pas intercepté : l'appli gère elle-même son repli.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req)
        .then(r => { const copy = r.clone(); caches.open(V).then(c => c.put(req, copy)); return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});

// Keeps a copy of the game on the device so it opens and plays with no internet.
// When any game file changes, bump VERSION so devices pick up the new copy.
const VERSION = 'rdp-6';
const FILES = ['./', 'index.html', 'style.css', 'js/data.js', 'js/draw.js', 'js/music.js', 'js/app.js',
  'manifest.webmanifest', 'icon.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Online: fetch fresh files (and keep the copy up to date). Offline: use the saved copy.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});

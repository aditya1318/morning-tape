// The Morning Tape service worker.
// App shell: cache-first. Editions: network-first, falling back to the last saved copy offline.
const SHELL = 'mt-shell-v1';
const NEWS = 'mt-news';
const FONTS = 'mt-fonts';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mt-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: cache-first so the paper keeps its typefaces offline.
  if (url.host === 'fonts.googleapis.com' || url.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then((c) => c.match(req).then((hit) => hit || fetch(req).then((res) => { c.put(req, res.clone()); return res; }))));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Editions: network-first, saved without the cache-busting query.
  if (url.pathname.includes('/editions/')) {
    const key = url.origin + url.pathname;
    e.respondWith(
      fetch(req).then((res) => {
        if (res.ok) caches.open(NEWS).then((c) => c.put(key, res.clone()));
        return res;
      }).catch(() => caches.open(NEWS).then((c) => c.match(key)).then((hit) => hit || Response.error()))
    );
    return;
  }

  // Page navigations: network-first so app updates arrive, shell as fallback.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        caches.open(SHELL).then((c) => c.put('./index.html', res.clone()));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else in the shell: cache-first.
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});

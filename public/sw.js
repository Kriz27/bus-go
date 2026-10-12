const CACHE_PREFIX = 'busgo-';
const CACHE_NAME = `${CACHE_PREFIX}static-v3`;
const APP_ROOT = '/bus-go/';
const APP_SHELL = [
  APP_ROOT,
  `${APP_ROOT}manifest.webmanifest`,
  `${APP_ROOT}railone.png`,
  `${APP_ROOT}railone-192.png`,
  `${APP_ROOT}railone-512.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const response = await fetch(APP_ROOT);
      const html = await response.clone().text();
      const pageAssets = Array.from(
        html.matchAll(/(?:src|href)="([^\"]+)"/g),
        (match) => match[1],
      ).filter((path) => path.startsWith(APP_ROOT));

      await cache.put(APP_ROOT, response);
      await cache.addAll([...new Set([...APP_SHELL, ...pageAssets])]);
    })(),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(APP_ROOT)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) || (await caches.match(APP_ROOT)),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});

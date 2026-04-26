/* Minimal service worker for PWA installability (Chrome requires a fetch listener). */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  /* Network-first: no offline cache in this tool. */
});

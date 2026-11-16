/**
 * ==============================================================================
 * SERVICE WORKER OFFLINE-FIRST (PWA) - MATERMED SEMANA 3
 * Diseño Web II • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 * ==============================================================================
 */

const CACHE_NAME = 'matermed-pwa-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './pwa.html',
  './styles.css',
  './pwa.css',
  './script.js',
  './pwa.js',
  './manifest.json',
  './data/suturas.json',
  './images/logo-matermed.svg',
  './images/poliglactina.svg',
  './images/nylon.svg',
  './images/seda.svg',
  './images/polipropileno.svg',
  './images/catgut.svg',
  './images/polidioxanona.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://code.jquery.com/jquery-3.7.1.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW MATERMED V4] Cacheando recursos estáticos para modo offline...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW MATERMED V4] Eliminando caché obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./pwa.html') || caches.match('./index.html');
        }
      });
    })
  );
});

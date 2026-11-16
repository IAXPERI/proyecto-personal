/**
 * ==============================================================================
 * MATERMED - SERVICE WORKER UNIFICADO (CACHE STORAGE V5)
 * Diseño Web II (SIS-0141) • UPDS 2026 • Ing. Miguel Angel Cruz Ramos
 * ==============================================================================
 */

const CACHE_NAME = 'matermed-unificado-v8';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'pwa.html',
  'styles.css',
  'pwa.css',
  'script.js',
  'pwa.js',
  'manifest.json',
  'data/suturas.json',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'images/logo-matermed.svg',
  'images/poliglactina.svg',
  'images/nylon.svg',
  'images/seda.svg',
  'images/polipropileno.svg',
  'images/catgut.svg',
  'images/polidioxanona.svg',
  'https://code.jquery.com/jquery-3.7.1.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW MATERMED UNIFICADO] Precaching todos los recursos de la PWA...');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('[SW MATERMED UNIFICADO] Advertencia al cachear algunos recursos:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[SW MATERMED UNIFICADO] Depurando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('pwa.html');
        }
      });
    })
  );
});

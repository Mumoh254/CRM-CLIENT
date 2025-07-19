const CACHE_VERSION = 'v4';
const CACHE_NAME = `stock-link-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/offline.html',
  '/images/image.png',
  '/images/logo2.png',
  '/images/icon.svg',
  '/images/apple-touch-icon.png',
  '/assets/index.js',
  '/assets/index.css'
];

// INSTALL EVENT
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => {
        console.log(`[SW] Cache ${CACHE_NAME} installed`);
        return self.skipWaiting();
      })
  );
});

// ACTIVATE EVENT
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      )
    ).then(() => {
      console.log(`[SW] Claiming clients for ${CACHE_NAME}`);
      return self.clients.claim();
    })
  );
});

// FETCH EVENT
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request).then(cachedResponse => cachedResponse || caches.match(OFFLINE_URL)))
  );
});

// MESSAGE EVENT
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

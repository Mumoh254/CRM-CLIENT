const CACHE_VERSION = 'v4';
const CACHE_NAME = `stock-link-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css', // If you have one
  '/offline.html',
  '/images/image.png', // From manifest.json and mask-icon
  '/images/logo2.png', // From index.html favicon
  '/images/icon.svg',  // From index.html favicon
  '/images/apple-touch-icon.png', // From index.html apple-touch-icon
  '/assets/index.js',
  '/assets/index.css' // If you have one
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
    }).then(() => {
      return self.clients.matchAll({ type: 'window' }).then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'RELOAD_PAGE' });
        });
      });
    })
  );
});



// MESSAGE EVENT
self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'RELOAD_CLIENTS':
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'FORCE_RELOAD' }));
      });
      break;
  }
});

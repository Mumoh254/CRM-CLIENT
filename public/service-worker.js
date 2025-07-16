const CACHE_VERSION = 'v4';
const CACHE_NAME = `city-neuro-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const INSTALL_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/styles.css',
  '/offline.html',
  '/images/logo.png',
  '/images/logo.png',
  '/assets/index.js',
  '/assets/index.css'
];

// Enhanced install event
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(INSTALL_CACHE))
      .then(() => {
        console.log(`Cache ${CACHE_NAME} installed`);
        return self.skipWaiting();
      })
  );
});

// Enhanced activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log(`Deleting old cache: ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log(`Claiming clients for ${CACHE_NAME}`);
      return self.clients.claim();
    }).then(() => {
      // Force refresh all open windows
      return self.clients.matchAll({type: 'window'}).then(clients => {
        clients.forEach(client => {
          client.postMessage({type: 'RELOAD_PAGE'});
        });
      });
    })
  );
});

// Enhanced fetch handler with version check
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Version check for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        const newVersion = response.headers.get('X-New-Version');
        if (newVersion && newVersion !== CACHE_VERSION) {
          self.registration.postMessage({
            type: 'NEW_VERSION_AVAILABLE',
            version: newVersion
          });
        }
        return response;
      })
    );
    return;
  }

  // Existing fetch logic...
});

// Enhanced message handler
self.addEventListener('message', (event) => {
  switch(event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'RELOAD_CLIENTS':
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({type: 'FORCE_RELOAD'}));
      });
      break;
  }
});

// Add version check interval
setInterval(() => {
  fetch('/api/version').then(response => {
    return response.json().then(data => {
      if (data.version !== CACHE_VERSION) {
        self.registration.postMessage({
          type: 'NEW_VERSION_AVAILABLE',
          version: data.version
        });
      }
    });
  }).catch(console.error);
}, 300000); // Check every 5 minutes

// Client-side integration (add this to your main JS file)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (confirm('New version available! Refresh now?')) {
            newWorker.postMessage({type: 'SKIP_WAITING'});
            window.location.reload();
          }
        }
      });
    });

    // Handle controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Listen for version messages
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data.type === 'NEW_VERSION_AVAILABLE') {
        console.log(`New version ${event.data.version} available`);
        if (confirm(`Update to version ${event.data.version}?`)) {
          reg.update().then(() => window.location.reload());
        }
      }
    });
  });
}
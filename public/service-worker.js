const CACHE_VERSION = 'v5'; // Increment this version for every new deployment that changes cached assets
const CACHE_NAME = `stock-link-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html'; // Ensure this file exists at your root

const INSTALL_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles.css', // If you have a global styles.css
    '/offline.html',
    '/images/image.png',
    '/images/logo2.png',
    '/images/icon.svg',
    '/images/apple-touch-icon.png',
    '/assets/index.js', // Your main application JS bundle
    '/assets/index.css', // Your main application CSS bundle
    // Add external assets you want to cache, but be mindful of their caching headers
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.5/dist/css/bootstrap.min.css',
    // You might also want to cache your main.jsx if it's not bundled into index.js
    // './src/main.jsx' // If you're directly loading this and it's not bundled
];

// INSTALL EVENT: Pre-cache essential assets
self.addEventListener('install', (event) => {
    console.log(`[SW] Installing Service Worker v${CACHE_VERSION}...`);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log(`[SW] Caching shell assets for ${CACHE_NAME}`);
                return cache.addAll(INSTALL_CACHE);
            })
            .then(() => {
                console.log(`[SW] Cache ${CACHE_NAME} installed successfully.`);
                // Force the waiting service worker to become the active service worker
                // immediately after installation. This is useful during development
                // but for production, you might want to skip this if you implement
                // a user-driven "update available" notification.
                return self.skipWaiting();
            })
            .catch(error => {
                console.error(`[SW] Failed to install cache ${CACHE_NAME}:`, error);
            })
    );
});

// ACTIVATE EVENT: Clean up old caches
self.addEventListener('activate', (event) => {
    console.log(`[SW] Activating Service Worker v${CACHE_VERSION}...`);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log(`[SW] Deleting old cache: ${cache}`);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.log(`[SW] Claiming clients for ${CACHE_NAME}`);
            // This ensures that the newly activated service worker takes control
            // of existing clients (pages) immediately.
            return self.clients.claim();
        }).catch(error => {
            console.error(`[SW] Failed to activate or clean caches:`, error);
        })
    );
});

// FETCH EVENT: Cache First, then Network Fallback strategy
self.addEventListener('fetch', (event) => {
    // Only handle HTTP/HTTPS requests
    if (!(event.request.url.startsWith('http'))) {
        return;
    }

    // Always go network-first for navigation requests to ensure fresh HTML
    // unless you have a strong reason for Cache First for HTML.
    // For a SPA, HTML often serves as the entry point and should be fresh.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                console.log('[SW] Network failed for navigation, serving offline page.');
                return caches.match(OFFLINE_URL);
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request) // Try to find the request in the cache first
            .then(cachedResponse => {
                // If a response is found in cache, return it
                if (cachedResponse) {
                    console.log(`[SW] Serving from cache: ${event.request.url}`);
                    return cachedResponse;
                }

                // If not in cache, go to the network
                console.log(`[SW] Fetching from network: ${event.request.url}`);
                return fetch(event.request).then(networkResponse => {
                    // Check if we received a valid response
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // IMPORTANT: Clone the response. A response is a stream
                    // and can only be consumed once. We're consuming it once
                    // to cache it and once to return it.
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(error => {
                    // Network failed, and no cached response was found initially.
                    // For static assets, we might just fail gracefully or show a generic message.
                    console.error(`[SW] Network request failed for ${event.request.url}:`, error);
                    // You could match for specific fallback assets here if needed.
                    return new Response('Offline: Content not available', { status: 503, statusText: 'Service Unavailable' });
                });
            })
    );
});

// MESSAGE EVENT: To handle messages from the client (e.g., to skip waiting)
self.addEventListener('message', (event) => {
    if (!event.data) return;


    if (event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Client sent SKIP_WAITING, activating new worker.');
        self.skipWaiting();
    }
});


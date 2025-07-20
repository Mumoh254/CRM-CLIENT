// service-worker.js

// Install Event (no caching)
self.addEventListener('install', event => {
  console.log('[SW] Service Worker installed.');
  self.skipWaiting();
});

// Activate Event (no cache cleanup needed)
self.addEventListener('activate', event => {
  console.log('[SW] Service Worker activated.');
  self.clients.claim();
});

// Fetch Event (network-only)
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

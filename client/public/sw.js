// Service Worker DISABLED - No caching
// This service worker immediately unregisters itself and clears all caches

self.addEventListener('install', (event) => {
  console.log('Service Worker: Uninstalling and clearing all caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating to unregister...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    }).then(() => {
      // Unregister this service worker
      return self.registration.unregister();
    })
  );
});

// Don't intercept any fetch requests - let them go directly to the network
self.addEventListener('fetch', (event) => {
  // Do nothing - let all requests pass through to network
  return;
});

console.log('Service Worker: Disabled - All caching removed');
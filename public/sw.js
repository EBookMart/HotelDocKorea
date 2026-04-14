const CACHE_NAME = 'hoteldoc-korea-cache-v1';
const DOMAINS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/data/hotels.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't strict cache, just cache what we can to prevent strict install failures
      return cache.addAll(DOMAINS_TO_CACHE).catch(err => console.warn('Cache warning:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Serve from cache if available
      if (response) {
        return response;
      }
      
      // Otherwise fetch from network and dynamically cache json
      return fetch(event.request).then(
        (response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cache only specific API/JSON calls if needed
          if (event.request.url.includes('/data/hotels.json')) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
          }
          return response;
        }
      ).catch(() => {
        // Fallback for failed network requests when offline
        if (event.request.url.includes('/data/hotels.json')) {
            return caches.match('/data/hotels.json');
        }
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

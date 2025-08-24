// Mobile-optimized Service Worker
const CACHE_NAME = 'murata-bjj-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  // 重要なCSSとJSはNext.jsが自動的にキャッシュ
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
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
  self.clients.claim();
});

// Fetch event with mobile-first strategy
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Check if valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Add to cache for offline use
        if (event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      }).catch(() => {
        // Offline fallback
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Handle background sync for better mobile experience
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-sparring-logs') {
    event.waitUntil(syncSparringLogs());
  }
});

async function syncSparringLogs() {
  // Implement background sync for sparring logs
  // This ensures data is saved even on poor connections
}
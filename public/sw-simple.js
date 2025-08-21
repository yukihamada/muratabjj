// Simplified Service Worker for Murata BJJ
// Only caches static assets, no dynamic content

const CACHE_NAME = 'murata-bjj-v1.0.1'
const urlsToCache = [
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.svg'
]

// Install event - cache only essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[SW] Install failed:', err)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - only handle offline fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin navigation requests
  if (request.mode === 'navigate' && url.origin === location.origin) {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // Only return offline page when network fails
          return caches.match('/offline.html')
            .then((response) => {
              if (response) {
                return response
              }
              // Fallback if offline.html is not cached
              return new Response(
                '<!DOCTYPE html><html><head><meta charset="utf-8"><title>オフライン</title></head><body style="font-family: sans-serif; text-align: center; padding: 50px;"><h1>オフライン</h1><p>インターネット接続を確認してください。</p></body></html>',
                {
                  status: 200,
                  headers: { 'Content-Type': 'text/html; charset=utf-8' }
                }
              )
            })
        })
    )
  }
})
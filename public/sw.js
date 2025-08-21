const CACHE_NAME = 'murata-bjj-v1.0.0'
const STATIC_CACHE_NAME = 'murata-bjj-static-v1.0.0'
const DYNAMIC_CACHE_NAME = 'murata-bjj-dynamic-v1.0.0'

// Static resources to cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/flows',
  '/manifest.json',
  // Add critical CSS and JS files
  '/_next/static/css/',
  '/_next/static/chunks/',
  // Offline page
  '/offline.html'
]

// Routes to cache dynamically
const CACHED_ROUTES = [
  '/dashboard',
  '/dashboard/videos',
  '/dashboard/progress', 
  '/dashboard/sparring',
  '/dashboard/review',
  '/flows',
  '/auth/signin',
  '/auth/signup'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/_next/static/css/' && asset !== '/_next/static/chunks/'))
      })
      .then(() => {
        console.log('[SW] Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Claiming clients')
        return self.clients.claim()
      })
  )
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return
  }

  // Skip Next.js RSC requests
  if (url.searchParams.has('_rsc') || request.headers.get('RSC')) {
    return
  }

  // Skip Next.js specific routes
  if (url.pathname.startsWith('/_next/') || 
      url.pathname.includes('__nextjs') ||
      url.pathname.includes('.json')) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses for short time
          if (response.ok && request.method === 'GET') {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
          }
          return response
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request)
        })
    )
    return
  }

  // Handle static assets
  if (url.pathname.includes('/_next/static/') || url.pathname.includes('/static/')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
              return response
            })
        })
    )
    return
  }

  // Handle navigation requests (pages)
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    // Skip auth routes to avoid caching issues
    if (url.pathname.includes('/auth/') || 
        url.pathname === '/signup' || 
        url.pathname === '/login' ||
        url.pathname === '/signin') {
      return
    }

    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigation responses
          if (response.ok) {
            const responseClone = response.clone()
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone)
              })
              .catch((error) => {
                console.error('[SW] Cache put error:', error)
              })
          }
          return response
        })
        .catch((error) => {
          console.error('[SW] Fetch error:', error)
          // Try to return cached page
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse
              }
              
              // Return offline page for navigation requests
              if (request.mode === 'navigate') {
                return caches.match('/offline.html')
                  .then((offlineResponse) => {
                    if (offlineResponse) {
                      return offlineResponse
                    }
                    // Return basic offline response if offline.html not found
                    return new Response(
                      '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>オフライン</h1><p>インターネット接続を確認してください。</p></body></html>',
                      {
                        status: 503,
                        statusText: 'Service Unavailable',
                        headers: {
                          'Content-Type': 'text/html; charset=utf-8'
                        }
                      }
                    )
                  })
              }
              
              // Return a basic offline response
              return new Response('Offline - Content not available', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: {
                  'Content-Type': 'text/html'
                }
              })
            })
        })
    )
    return
  }

  // Handle other requests (images, videos, etc.)
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache but update cache in background
          fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone()
                caches.open(DYNAMIC_CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone)
                  })
              }
            })
            .catch(() => {})
          
          return cachedResponse
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const responseClone = response.clone()
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone)
                })
            }
            return response
          })
          .catch(() => {
            // Return a basic offline response for failed requests
            return new Response('Offline - Content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            })
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sparring-log-sync') {
    event.waitUntil(syncSparringLogs())
  } else if (event.tag === 'progress-sync') {
    event.waitUntil(syncProgress())
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Murata BJJ',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 'notification'
    },
    actions: [
      {
        action: 'open',
        title: '開く',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close', 
        title: '閉じる',
        icon: '/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('Murata BJJ', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event)
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  event.waitUntil(
    clients.openWindow('/dashboard')
  )
})

// Helper functions
async function syncSparringLogs() {
  try {
    // Get pending sparring logs from IndexedDB
    const pendingLogs = await getPendingSparringLogs()
    
    for (const log of pendingLogs) {
      try {
        const response = await fetch('/api/sparring-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(log.data)
        })
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingSparringLog(log.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync sparring log:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error)
  }
}

async function syncProgress() {
  try {
    // Similar to sparring logs sync
    const pendingProgress = await getPendingProgress()
    
    for (const progress of pendingProgress) {
      try {
        const response = await fetch('/api/user-progress', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(progress.data)
        })
        
        if (response.ok) {
          await removePendingProgress(progress.id)
        }
      } catch (error) {
        console.error('[SW] Failed to sync progress:', error)
      }
    }
  } catch (error) {
    console.error('[SW] Progress sync failed:', error)
  }
}

// IndexedDB helpers (simplified - would need full implementation)
async function getPendingSparringLogs() {
  // TODO: Implement IndexedDB access
  return []
}

async function removePendingSparringLog(id) {
  // TODO: Implement IndexedDB removal
}

async function getPendingProgress() {
  // TODO: Implement IndexedDB access
  return []
}

async function removePendingProgress(id) {
  // TODO: Implement IndexedDB removal
}
// Progressive Web App Enhancements
// Advanced PWA features for better mobile experience

import { MetricsCollector } from '@/lib/monitoring/grafana'

// Check if PWA is installed
export function isPWAInstalled(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for display mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches
  const isMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches
  
  // Check iOS specific
  const isIOSStandalone = (window.navigator as any).standalone === true
  
  return isStandalone || isFullscreen || isMinimalUI || isIOSStandalone
}

// Background sync for offline actions
export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready
      await (registration as any).sync.register(tag)
      console.log('Background sync registered:', tag)
    } catch (error) {
      console.error('Failed to register background sync:', error)
    }
  }
}

// Periodic background sync for updates
export async function registerPeriodicSync(
  tag: string,
  minInterval: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<void> {
  if ('serviceWorker' in navigator && 'periodicSync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready
      const status = await navigator.permissions.query({
        name: 'periodic-background-sync' as PermissionName,
      })
      
      if (status.state === 'granted') {
        await (registration as any).periodicSync.register(tag, {
          minInterval,
        })
        console.log('Periodic sync registered:', tag)
      }
    } catch (error) {
      console.error('Failed to register periodic sync:', error)
    }
  }
}

// Push notification subscription
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.ready
    
    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      return subscription
    }
    
    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.warn('Push notification permission denied')
      return null
    }
    
    // Subscribe
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured')
      return null
    }
    
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
    
    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    })
    
    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')
  
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  
  return outputArray
}

// Share Target API handler
export function handleShareTarget(): void {
  if (typeof window === 'undefined') return
  
  // Check if launched from share
  const url = new URL(window.location.href)
  const sharedTitle = url.searchParams.get('title')
  const sharedText = url.searchParams.get('text')
  const sharedUrl = url.searchParams.get('url')
  
  if (sharedTitle || sharedText || sharedUrl) {
    // Handle shared content
    console.log('Received share:', { sharedTitle, sharedText, sharedUrl })
    
    // Store in localStorage for processing
    localStorage.setItem('sharedContent', JSON.stringify({
      title: sharedTitle,
      text: sharedText,
      url: sharedUrl,
      timestamp: Date.now(),
    }))
    
    // Clear URL parameters
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

// App shortcuts handler
export function registerAppShortcuts(): void {
  if ('setAppBadge' in navigator) {
    // Set app badge for notifications
    navigator.setAppBadge(5).catch(console.error)
  }
  
  if ('clearAppBadge' in navigator) {
    // Clear badge when app is opened
    navigator.clearAppBadge().catch(console.error)
  }
}

// Media session for video controls
export function setupMediaSession(video: {
  title: string
  artist?: string
  album?: string
  artwork?: Array<{ src: string; sizes: string; type: string }>
}): void {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: video.title,
      artist: video.artist || 'Murata BJJ',
      album: video.album || 'Training Videos',
      artwork: video.artwork || [
        {
          src: '/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
      ],
    })
    
    // Set up action handlers
    navigator.mediaSession.setActionHandler('play', () => {
      console.log('Media session: play')
    })
    
    navigator.mediaSession.setActionHandler('pause', () => {
      console.log('Media session: pause')
    })
    
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      console.log('Media session: seek backward')
    })
    
    navigator.mediaSession.setActionHandler('seekforward', () => {
      console.log('Media session: seek forward')
    })
  }
}

// Screen wake lock for video playback
export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if ('wakeLock' in navigator) {
    try {
      const wakeLock = await navigator.wakeLock.request('screen')
      console.log('Wake lock acquired')
      
      // Re-acquire on visibility change
      document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
          await navigator.wakeLock.request('screen')
        }
      })
      
      return wakeLock
    } catch (error) {
      console.error('Failed to acquire wake lock:', error)
      return null
    }
  }
  return null
}

// Device capabilities detection
export function getDeviceCapabilities(): {
  hasTouch: boolean
  hasGyroscope: boolean
  hasAccelerometer: boolean
  hasBattery: boolean
  hasVibration: boolean
  hasNFC: boolean
  hasAR: boolean
} {
  return {
    hasTouch: 'ontouchstart' in window,
    hasGyroscope: 'DeviceOrientationEvent' in window,
    hasAccelerometer: 'DeviceMotionEvent' in window,
    hasBattery: 'getBattery' in navigator,
    hasVibration: 'vibrate' in navigator,
    hasNFC: 'nfc' in navigator,
    hasAR: 'xr' in navigator,
  }
}

// Offline data sync queue
class OfflineSyncQueue {
  private queue: Array<{
    url: string
    method: string
    body?: any
    timestamp: number
  }> = []
  
  constructor() {
    // Load queue from localStorage
    const stored = localStorage.getItem('offlineSyncQueue')
    if (stored) {
      this.queue = JSON.parse(stored)
    }
    
    // Listen for online event
    window.addEventListener('online', () => this.processQueue())
  }
  
  add(request: { url: string; method: string; body?: any }): void {
    this.queue.push({
      ...request,
      timestamp: Date.now(),
    })
    this.save()
    
    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue()
    }
  }
  
  private async processQueue(): Promise<void> {
    if (!navigator.onLine || this.queue.length === 0) return
    
    const metrics = MetricsCollector.getInstance()
    const toProcess = [...this.queue]
    this.queue = []
    this.save()
    
    for (const request of toProcess) {
      try {
        await fetch(request.url, {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: request.body ? JSON.stringify(request.body) : undefined,
        })
        
        metrics.incrementCounter('offline_sync_success')
      } catch (error) {
        // Re-add to queue on failure
        this.queue.push(request)
        metrics.incrementCounter('offline_sync_failure')
      }
    }
    
    this.save()
  }
  
  private save(): void {
    localStorage.setItem('offlineSyncQueue', JSON.stringify(this.queue))
  }
}

// Export singleton instance
export const offlineSyncQueue = new OfflineSyncQueue()

// PWA update prompt
export function setupUpdatePrompt(): void {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (!newWorker) return
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is ready
            if (confirm('新しいバージョンが利用可能です。アップデートしますか？')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            }
          }
        })
      })
    })
  }
}

// Initialize all PWA enhancements
export function initializePWAEnhancements(): void {
  if (typeof window === 'undefined') return
  
  // Handle share target
  handleShareTarget()
  
  // Register app shortcuts
  registerAppShortcuts()
  
  // Setup update prompt
  setupUpdatePrompt()
  
  // Register periodic sync for content updates
  registerPeriodicSync('content-update')
  
  // Log PWA metrics
  const metrics = MetricsCollector.getInstance()
  metrics.recordBusinessMetric('pwa_installed', isPWAInstalled() ? 1 : 0)
  
  const capabilities = getDeviceCapabilities()
  Object.entries(capabilities).forEach(([key, value]) => {
    metrics.recordBusinessMetric(`device_capability_${key}`, value ? 1 : 0)
  })
}
// CDN Configuration for video delivery
// Supports multiple CDN providers: Cloudflare, BunnyCDN, or direct Supabase

export interface CDNConfig {
  provider: 'cloudflare' | 'bunny' | 'supabase'
  baseUrl: string
  pullZone?: string
  signedUrls?: boolean
  ttl?: number
}

// Get CDN configuration from environment variables
export function getCDNConfig(): CDNConfig {
  const provider = process.env.NEXT_PUBLIC_CDN_PROVIDER || 'supabase'
  
  switch (provider) {
    case 'cloudflare':
      return {
        provider: 'cloudflare',
        baseUrl: process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL || '',
        signedUrls: true,
        ttl: 3600, // 1 hour
      }
    
    case 'bunny':
      return {
        provider: 'bunny',
        baseUrl: process.env.NEXT_PUBLIC_BUNNY_CDN_URL || '',
        pullZone: process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE || '',
        signedUrls: false,
      }
    
    default:
      return {
        provider: 'supabase',
        baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        signedUrls: true,
        ttl: 3600,
      }
  }
}

// Transform video URL to use CDN
export function getCDNUrl(originalUrl: string, options?: {
  quality?: 'auto' | '1080p' | '720p' | '480p'
  format?: 'mp4' | 'webm' | 'hls'
}): string {
  const config = getCDNConfig()
  
  // If using Supabase directly, return original URL
  if (config.provider === 'supabase') {
    return originalUrl
  }
  
  // Extract path from Supabase URL
  const urlParts = originalUrl.split('/storage/v1/object/public/')
  if (urlParts.length < 2) {
    return originalUrl
  }
  
  const path = urlParts[1]
  
  // Build CDN URL based on provider
  switch (config.provider) {
    case 'cloudflare':
      // Cloudflare Stream URL format
      const quality = options?.quality || 'auto'
      return `${config.baseUrl}/${path}/${quality}.${options?.format || 'mp4'}`
    
    case 'bunny':
      // BunnyCDN URL format
      let bunnyUrl = `${config.baseUrl}/${path}`
      if (options?.quality && options.quality !== 'auto') {
        bunnyUrl += `?height=${options.quality.replace('p', '')}`
      }
      return bunnyUrl
    
    default:
      return originalUrl
  }
}

// Generate thumbnail URL from video URL
export function getCDNThumbnailUrl(videoUrl: string, options?: {
  time?: number // seconds
  width?: number
  height?: number
}): string {
  const config = getCDNConfig()
  
  switch (config.provider) {
    case 'cloudflare':
      // Cloudflare thumbnail format
      const time = options?.time || 0
      return videoUrl.replace(/\.(mp4|webm|hls)$/, `/thumbnail.jpg?time=${time}s`)
    
    case 'bunny':
      // BunnyCDN thumbnail format
      const params = new URLSearchParams()
      if (options?.width) params.append('width', options.width.toString())
      if (options?.height) params.append('height', options.height.toString())
      return `${videoUrl}?thumbnail=1&${params.toString()}`
    
    default:
      // For Supabase, use the stored thumbnail
      return videoUrl.replace(/videos\//, 'thumbnails/').replace(/\.(mp4|mov|avi)$/, '.jpg')
  }
}

// Preload video for better performance
export function preloadVideo(url: string): void {
  if (typeof window === 'undefined') return
  
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'video'
  link.href = url
  document.head.appendChild(link)
}

// Get adaptive bitrate streaming URL (HLS/DASH)
export function getStreamingUrl(videoUrl: string): string {
  const config = getCDNConfig()
  
  switch (config.provider) {
    case 'cloudflare':
      // Cloudflare supports HLS
      return videoUrl.replace(/\.mp4$/, '.m3u8')
    
    case 'bunny':
      // BunnyCDN supports HLS
      return videoUrl.replace(/\.mp4$/, '/playlist.m3u8')
    
    default:
      // Fallback to regular MP4
      return videoUrl
  }
}
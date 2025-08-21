// Cookie configuration for Supabase Auth
// This file helps debug and configure cookie settings for different environments

interface CookieConfig {
  name: string
  domain?: string
  path: string
  sameSite: 'strict' | 'lax' | 'none'
  secure: boolean
  maxAge: number
}

export function getCookieConfig(): CookieConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  // Log current environment
  if (typeof window !== 'undefined') {
    console.log('[Cookie Config] Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      isProduction,
      isDevelopment,
    })
  }
  
  // Production configuration
  if (isProduction) {
    return {
      name: 'sb-auth-token',
      domain: '.muratabjj.com', // Allow cookies across subdomains
      path: '/',
      sameSite: 'lax', // 'lax' for same-site, 'none' if using external auth providers
      secure: true, // Always use secure in production
      maxAge: 60 * 60 * 24 * 7, // 7 days
    }
  }
  
  // Development configuration
  return {
    name: 'sb-auth-token',
    domain: undefined, // Let browser handle domain in development
    path: '/',
    sameSite: 'lax',
    secure: false, // Allow non-HTTPS in development
    maxAge: 60 * 60 * 24 * 7, // 7 days
  }
}

// Debug helper to check cookie issues
export function debugCookieIssues() {
  if (typeof window === 'undefined') return
  
  console.group('[Cookie Debug]')
  
  // Check if third-party cookies are blocked
  const testCookieName = 'test-third-party'
  document.cookie = `${testCookieName}=1; SameSite=None; Secure`
  const cookieSet = document.cookie.includes(testCookieName)
  
  if (!cookieSet && window.location.protocol === 'https:') {
    console.warn('Third-party cookies might be blocked by the browser')
  }
  
  // Clear test cookie
  document.cookie = `${testCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  
  // List all cookies
  console.log('Current cookies:', document.cookie)
  
  // Check for Supabase auth cookies
  const authCookies = document.cookie
    .split(';')
    .filter(c => c.includes('sb-') || c.includes('supabase'))
  
  if (authCookies.length === 0) {
    console.warn('No Supabase auth cookies found')
  } else {
    console.log('Supabase cookies found:', authCookies)
  }
  
  console.groupEnd()
}
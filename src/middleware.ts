import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { MetricsCollector, logToGrafana } from '@/lib/monitoring/grafana'
import { rateLimitMiddleware } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const start = Date.now()
  const metrics = MetricsCollector.getInstance()
  
  try {
    // Apply rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitResponse = await rateLimitMiddleware(request)
      if (rateLimitResponse) {
        const duration = Date.now() - start
        metrics.recordResponseTime(pathname, request.method, 429, duration)
        await logToGrafana('warn', 'Rate limit exceeded', {
          ip: request.ip || 'unknown',
          path: pathname,
          method: request.method,
        })
        return rateLimitResponse
      }
    }
    
    // Check for all supported locales except ja (ja is at root)
    const pathnameHasLocale = /^\/(en|pt|es|fr|ko|ru)(\/|$)/.test(pathname)
    
    if (pathnameHasLocale) {
      const response = NextResponse.next()
      const duration = Date.now() - start
      metrics.recordResponseTime(pathname, request.method, 200, duration)
      response.headers.set('X-Response-Time', `${duration}ms`)
      return response
    }
    
    // Skip API routes, static files, and other system paths
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('/favicon.ico') ||
      pathname.includes('.') // has a file extension
    ) {
      const response = NextResponse.next()
      const duration = Date.now() - start
      metrics.recordResponseTime(pathname, request.method, 200, duration)
      return response
    }
    
    // For all other routes, serve from root (Japanese default)
    const response = NextResponse.next()
    const duration = Date.now() - start
    metrics.recordResponseTime(pathname, request.method, 200, duration)
    response.headers.set('X-Response-Time', `${duration}ms`)
    
    return response
  } catch (error) {
    const duration = Date.now() - start
    metrics.recordResponseTime(pathname, request.method, 500, duration)
    
    await logToGrafana('error', 'Middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: pathname,
      method: request.method,
    })
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
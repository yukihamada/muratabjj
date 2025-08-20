import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Only check for en and pt locales (ja is at root)
  const pathnameHasLocale = /^\/(en|pt)(\/|$)/.test(pathname)
  
  if (pathnameHasLocale) {
    return NextResponse.next()
  }
  
  // Skip API routes, static files, and other system paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('.') // has a file extension
  ) {
    return NextResponse.next()
  }
  
  // For all other routes, serve from root (Japanese default)
  return NextResponse.next()
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
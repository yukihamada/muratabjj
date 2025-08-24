import { NextRequest, NextResponse } from 'next/server'
import { apiRateLimit, authRateLimit, uploadRateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

// Define which paths need which rate limits
const rateLimitRules = [
  { pattern: /^\/api\/auth\/(login|signup)/, limiter: authRateLimit },
  { pattern: /^\/api\/.*\/upload/, limiter: uploadRateLimit },
  { pattern: /^\/api\/ai\//, limiter: apiRateLimit },
  { pattern: /^\/api\//, limiter: apiRateLimit }, // Default for all API routes
]

export async function apiMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Find matching rate limit rule
  for (const rule of rateLimitRules) {
    if (rule.pattern.test(pathname)) {
      const identifier = getClientIdentifier(request)
      const result = await rule.limiter(request, identifier)
      
      if (!result.success) {
        return rateLimitResponse(result)
      }
      
      // Add rate limit headers to successful responses
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Limit', result.limit.toString())
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
      response.headers.set('X-RateLimit-Reset', result.reset.toISOString())
      
      return response
    }
  }
  
  return NextResponse.next()
}
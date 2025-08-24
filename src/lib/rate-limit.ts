import { NextRequest } from 'next/server'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max requests per interval
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: Date
}

const ratelimitCache = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(config: RateLimitConfig) {
  return async function (
    request: NextRequest,
    identifier: string
  ): Promise<RateLimitResult> {
    const now = Date.now()
    const resetTime = now + config.interval

    // Clean up expired entries
    for (const [key, value] of ratelimitCache.entries()) {
      if (value.resetTime < now) {
        ratelimitCache.delete(key)
      }
    }

    const tokenData = ratelimitCache.get(identifier) || { count: 0, resetTime }

    if (tokenData.resetTime < now) {
      tokenData.count = 0
      tokenData.resetTime = resetTime
    }

    tokenData.count++
    ratelimitCache.set(identifier, tokenData)

    const remaining = Math.max(0, config.uniqueTokenPerInterval - tokenData.count)
    const success = tokenData.count <= config.uniqueTokenPerInterval

    return {
      success,
      limit: config.uniqueTokenPerInterval,
      remaining,
      reset: new Date(tokenData.resetTime),
    }
  }
}

// Pre-configured rate limiters
export const apiRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 30, // 30 requests per minute
})

// Export middleware function for compatibility
export const rateLimitMiddleware = apiRateLimit

export const authRateLimit = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 5, // 5 requests per 15 minutes
})

export const uploadRateLimit = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 10, // 10 uploads per hour
})

// Helper to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get authenticated user ID from headers
  const userId = request.headers.get('x-user-id')
  if (userId) return `user:${userId}`

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'
  
  return `ip:${ip}`
}

// Helper to create rate limit response
export function rateLimitResponse(result: RateLimitResult) {
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toISOString(),
  }

  if (!result.success) {
    return new Response('Too Many Requests', {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
      },
    })
  }

  return { headers }
}
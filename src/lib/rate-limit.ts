/**
 * Rate Limiting Utility
 *
 * Implements in-memory rate limiting for API routes.
 * For production with multiple instances, consider using Redis or Upstash.
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  uniqueTokenPerInterval: number // Max number of unique tokens
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

class RateLimiter {
  private tokenCache: Map<string, number[]>
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.tokenCache = new Map()
    this.config = config
  }

  check(token: string, limit: number): RateLimitResult {
    const now = Date.now()
    const tokenKey = token

    // Get existing requests for this token
    const timestamps = this.tokenCache.get(tokenKey) || []

    // Remove old timestamps outside the window
    const validTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < this.config.interval
    )

    // Check if limit exceeded
    const success = validTimestamps.length < limit

    if (success) {
      // Add current request
      validTimestamps.push(now)
      this.tokenCache.set(tokenKey, validTimestamps)
    }

    // Clean up old tokens (prevent memory leak)
    if (this.tokenCache.size > this.config.uniqueTokenPerInterval) {
      this.cleanup()
    }

    const reset = now + this.config.interval

    return {
      success,
      limit,
      remaining: Math.max(0, limit - validTimestamps.length),
      reset,
    }
  }

  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.tokenCache.forEach((timestamps, key) => {
      const validTimestamps = timestamps.filter(
        (timestamp) => now - timestamp < this.config.interval
      )

      if (validTimestamps.length === 0) {
        keysToDelete.push(key)
      } else {
        this.tokenCache.set(key, validTimestamps)
      }
    })

    keysToDelete.forEach((key) => this.tokenCache.delete(key))
  }
}

// Rate limiters for different endpoints
export const globalLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Max 500 unique IPs per minute
})

export const scrapeLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export const authLimiter = new RateLimiter({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

/**
 * Rate limit middleware helper
 *
 * Usage in API route:
 * const result = await rateLimit(request, 'user-123', 10)
 * if (!result.success) {
 *   return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 * }
 */
export async function rateLimit(
  request: Request,
  identifier: string,
  limit: number,
  limiter: RateLimiter = globalLimiter
): Promise<RateLimitResult> {
  // Use IP address as fallback identifier
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'anonymous'

  const token = `${identifier}:${ip}`

  return limiter.check(token, limit)
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return userId

  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'anonymous'

  return ip
}

/**
 * Rate limit response headers
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  }
}

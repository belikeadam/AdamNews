import { redis } from './redis'

interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  retryAfterSeconds: number
}

/**
 * Sliding-window rate limiter using Upstash Redis.
 *
 * Algorithm: Token Bucket via Redis INCR + TTL.
 * - Each key represents a window (IP:route:windowId).
 * - INCR counts requests in the current window.
 * - TTL auto-expires the key after the window passes.
 *
 * Falls back to "allow" if Redis is unavailable (fail-open).
 */
export async function rateLimit(
  identifier: string,
  { limit = 60, windowSeconds = 60 }: { limit?: number; windowSeconds?: number } = {}
): Promise<RateLimitResult> {
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `rl:${identifier}:${windowId}`

  try {
    const count = await redis.incr(key)

    // Set TTL on first request in this window
    if (count === 1) {
      await redis.expire(key, windowSeconds)
    }

    const remaining = Math.max(0, limit - count)
    const allowed = count <= limit

    return {
      allowed,
      remaining,
      limit,
      retryAfterSeconds: allowed ? 0 : windowSeconds,
    }
  } catch {
    // Redis unavailable — fail open (allow the request)
    return { allowed: true, remaining: limit, limit, retryAfterSeconds: 0 }
  }
}

/**
 * Extract client IP from request headers.
 * Works with Vercel, Cloudflare, and standard proxies.
 */
export function getClientIp(request: Request): string {
  const headers = request.headers
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') ||
    '127.0.0.1'
  )
}

/** Standard rate-limit response headers. */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    ...(result.retryAfterSeconds > 0
      ? { 'Retry-After': String(result.retryAfterSeconds) }
      : {}),
  }
}

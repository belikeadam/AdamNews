import { Redis } from '@upstash/redis'

// In production, use Upstash Redis REST API
// In development with Docker, you can set these env vars to point to a local Redis REST proxy
// or use Upstash for development as well
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'http://localhost:8079',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'dev_token',
})

// Cache helpers
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = 60
): Promise<{ data: T; cached: boolean; ttl: number }> {
  try {
    const cached = await redis.get<T>(key)
    if (cached !== null) {
      const ttl = await redis.ttl(key)
      return { data: cached, cached: true, ttl }
    }
  } catch {
    // Redis unavailable — fall through to fetcher
  }

  const fresh = await fetcher()

  try {
    await redis.set(key, fresh, { ex: ttlSeconds })
  } catch {
    // Redis unavailable — continue without caching
  }

  return { data: fresh, cached: false, ttl: ttlSeconds }
}

// Cache key patterns
export const CacheKeys = {
  articles: (page: number) => `articles:page:${page}`,
  article: (slug: string) => `article:${slug}`,
  categories: () => 'categories',
  trending: () => 'articles:trending',
} as const

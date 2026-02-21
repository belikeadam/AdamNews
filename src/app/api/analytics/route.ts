import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { AnalyticsSchema, parseBody } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  const ip = getClientIp(request)

  // Rate limit: 30 analytics events per minute per IP
  const rl = await rateLimit(`analytics:${ip}`, { limit: 30, windowSeconds: 60 })
  if (!rl.allowed) {
    // Silently accept but don't process
    return NextResponse.json({ received: true }, { headers: rateLimitHeaders(rl) })
  }

  // Validate input with Zod
  const parsed = await parseBody(request, AnalyticsSchema)
  if (parsed.error !== null) {
    // Don't expose validation errors for analytics — just accept
    return NextResponse.json({ received: true })
  }
  const data = parsed.data

  // Structured log for analytics pipeline (ELK, BigQuery, PostHog, etc.)
  logger.info('Analytics event', {
    type: data.type,
    slug: data.slug,
    readSeconds: data.readSeconds,
    maxScrollDepth: data.maxScrollDepth,
    referrer: data.referrer,
    ip: ip.slice(0, -3) + 'xxx', // Partially anonymize IP
  })

  return NextResponse.json({ received: true }, { headers: rateLimitHeaders(rl) })
}

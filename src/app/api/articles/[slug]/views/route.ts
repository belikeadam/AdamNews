import { NextResponse } from 'next/server'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL!
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const start = Date.now()
  const { slug } = await params
  const ip = getClientIp(request)

  // Validate slug format
  if (!slug || slug.length > 200 || !/^[a-z0-9]/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  // Rate limit: 5 view increments per slug per IP per minute (prevent inflation)
  const rl = await rateLimit(`views:${ip}:${slug}`, { limit: 5, windowSeconds: 60 })
  if (!rl.allowed) {
    // Silently return current views without incrementing
    return NextResponse.json({ views: 0, rateLimited: true }, { headers: rateLimitHeaders(rl) })
  }

  try {
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`

    const findRes = await fetch(
      `${STRAPI_URL}/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=views`,
      { headers, cache: 'no-store' }
    )

    if (!findRes.ok) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const findData = await findRes.json()
    const article = findData.data?.[0]
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const currentViews = article.attributes?.views || 0
    const updateRes = await fetch(`${STRAPI_URL}/api/articles/${article.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data: { views: currentViews + 1 } }),
    })

    if (!updateRes.ok) {
      logger.warn('Failed to update views', { slug, status: updateRes.status })
      return NextResponse.json({ views: currentViews })
    }

    logger.request('POST', `/api/articles/${slug}/views`, 200, Date.now() - start, {
      slug, views: currentViews + 1,
    })

    return NextResponse.json({ views: currentViews + 1 }, { headers: rateLimitHeaders(rl) })
  } catch (error) {
    logger.error('View tracking error', { slug, error: (error as Error).message })
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}

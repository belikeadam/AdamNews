import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { RevalidateSchema, parseBody } from '@/lib/validations'
import { logger } from '@/lib/logger'

const WEBHOOK_SECRET =
  process.env.STRAPI_WEBHOOK_SECRET || process.env.STRAPI_API_TOKEN

export async function POST(request: Request) {
  const start = Date.now()
  const ip = getClientIp(request)

  // Rate limit: 30 revalidations per minute
  const rl = await rateLimit(`revalidate:${ip}`, { limit: 30, windowSeconds: 60 })
  if (!rl.allowed) {
    logger.warn('Rate limit exceeded on revalidate', { ip })
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== WEBHOOK_SECRET) {
    logger.warn('Invalid webhook secret on revalidate', { ip })
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  // Validate body with Zod
  const parsed = await parseBody(request, RevalidateSchema)
  if (parsed.error !== null) {
    logger.warn('Invalid revalidate input', { ip, error: parsed.error })
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const body = parsed.data

  try {
    let slug: string | null = null
    let tag: string | null = null

    if (body.slug) {
      slug = body.slug
      tag = body.tag || null
    } else if (body.entry?.slug) {
      slug = body.entry.slug
    } else if (body.model === 'category' || body.model === 'author') {
      tag = body.model === 'category' ? 'categories' : 'authors'
    }

    if (slug) {
      revalidatePath(`/articles/${slug}`, 'page')
      revalidateTag(`article-${slug}`, 'default')
    }

    if (tag) {
      revalidateTag(tag, 'default')
    }

    // Always revalidate the home page and articles list
    revalidatePath('/', 'page')
    revalidateTag('articles', 'default')

    logger.request('POST', '/api/revalidate', 200, Date.now() - start, {
      slug: slug || null,
      tag: tag || null,
      event: body.event || 'manual',
    })

    return NextResponse.json({
      revalidated: true,
      slug: slug || null,
      tag: tag || null,
      timestamp: new Date().toISOString(),
    }, { headers: rateLimitHeaders(rl) })
  } catch (error) {
    logger.error('Revalidation failed', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}

import { NextResponse } from 'next/server'
import { callGeminiCached, parseGeminiJSON, RateLimitError } from '@/lib/ai/gemini'
import { parseBody, AIDigestSchema } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { AIDigest } from '@/types/ai'

const CACHE_TTL = 60 * 60 * 6 // 6 hours

export async function POST(request: Request) {
  const start = Date.now()

  const ip = getClientIp(request)
  const rl = await rateLimit(`ai-digest:${ip}`, { limit: 5, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const parsed = await parseBody(request, AIDigestSchema)
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { categories, topArticles } = parsed.data

  // Shared cache key: similar readers get the same digest
  const dateHour = new Date().toISOString().slice(0, 13)
  const catKey = categories.slice(0, 3).sort().join('-')
  const cacheKey = `ai:digest:${catKey}:${dateHour}`

  try {
    const articlesText = topArticles.slice(0, 8).map((a: { category: string; title: string; excerpt: string }, i: number) =>
      `${i + 1}. [${a.category}] ${a.title}: ${a.excerpt.slice(0, 150)}`
    ).join('\n')

    const prompt = `You are a Malaysian news briefing editor. Create a morning digest for a reader who follows: ${categories.join(', ')}.

Today's top articles:
${articlesText}

Respond ONLY with valid JSON (no markdown, no code fences):
{
  "headline": "Punchy 8-word briefing headline for today",
  "intro": "2 sentence personalised morning intro with Malaysian context",
  "stories": [
    {
      "title": "Article title",
      "summary": "Why it matters in 20 words",
      "category": "category name",
      "urgency": "high|medium|low"
    }
  ],
  "closingNote": "1 uplifting or thought-provoking sentence to end the briefing"
}`

    const result = await callGeminiCached<AIDigest>(
      cacheKey,
      prompt,
      CACHE_TTL,
      (text) => parseGeminiJSON<AIDigest>(text)
    )

    logger.request('POST', '/api/ai/digest', 200, Date.now() - start, {
      categories: catKey,
      cached: result.cached,
    })

    return NextResponse.json(
      { data: result.data, cached: result.cached },
      { headers: rateLimitHeaders(rl) }
    )
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', retryAfter: err.retryAfter },
        { status: 429, headers: { 'Retry-After': String(err.retryAfter) } }
      )
    }

    logger.error('AI digest failed', { error: String(err) })
    return NextResponse.json(
      { error: 'Digest generation failed' },
      { status: 500, headers: rateLimitHeaders(rl) }
    )
  }
}

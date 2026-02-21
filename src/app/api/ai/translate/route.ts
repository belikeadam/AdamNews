import { NextResponse } from 'next/server'
import { callAICached, parseGeminiJSON, RateLimitError } from '@/lib/ai/router'
import { parseBody, AITranslateSchema } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { AITranslation } from '@/types/ai'

const CACHE_TTL = 60 * 60 * 24 * 30 // 30 days

export async function POST(request: Request) {
  const start = Date.now()

  const ip = getClientIp(request)
  const rl = await rateLimit(`ai-translate:${ip}`, { limit: 10, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const parsed = await parseBody(request, AITranslateSchema)
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { slug, title, content, targetLang } = parsed.data

  try {
    const langName = targetLang === 'ms' ? 'Bahasa Malaysia' : 'English'

    const prompt = `Translate this news article to ${langName}. Maintain professional journalistic tone. Respond ONLY with valid JSON (no markdown, no code fences):

{"title": "translated title", "content": "translated article content (preserve paragraph structure with \\n\\n between paragraphs)"}

Title: ${title}
Content: ${content.slice(0, 8000)}`

    const result = await callAICached<AITranslation>(
      'translate',
      `ai:translate:${slug}:${targetLang}`,
      prompt,
      CACHE_TTL,
      (text) => {
        const parsed = parseGeminiJSON<{ title: string; content: string }>(text)
        return { ...parsed, lang: targetLang }
      }
    )

    logger.request('POST', '/api/ai/translate', 200, Date.now() - start, {
      slug,
      targetLang,
      cached: result.cached,
      provider: result.provider,
    })

    return NextResponse.json(
      { data: result.data, cached: result.cached, provider: result.provider },
      { headers: rateLimitHeaders(rl) }
    )
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: 'AI rate limit exceeded', retryAfter: err.retryAfter },
        { status: 429, headers: { 'Retry-After': String(err.retryAfter) } }
      )
    }

    logger.error('AI translate failed', { slug, targetLang, error: String(err) })
    // Return fallback so the UI doesn't silently freeze
    return NextResponse.json(
      { data: { title, content, lang: targetLang }, cached: false, fallback: true },
      { status: 200, headers: rateLimitHeaders(rl) }
    )
  }
}

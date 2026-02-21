import { NextResponse } from 'next/server'
import { callGeminiCached, parseGeminiJSON, RateLimitError } from '@/lib/ai/gemini'
import { parseBody, AISuggestSchema } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { AIEditorSuggestion } from '@/types/ai'

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

const FALLBACK: AIEditorSuggestion = {
  headlines: [
    { text: 'Headline suggestions temporarily unavailable', score: 0, reasoning: 'AI analysis could not be completed' },
  ],
  seoSuggestions: ['Try again in a moment'],
  autoTags: [],
  excerptSuggestion: '',
}

export async function POST(request: Request) {
  const start = Date.now()

  const ip = getClientIp(request)
  const rl = await rateLimit(`ai-suggest:${ip}`, { limit: 10, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const parsed = await parseBody(request, AISuggestSchema)
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { slug, title, content, excerpt } = parsed.data

  try {
    const prompt = `You are a senior digital editor at a Malaysian news outlet. Analyze this article and suggest improvements. Respond ONLY with valid JSON (no markdown, no code fences):

{
  "headlines": [
    {"text": "Alternative headline 1 (engaging, SEO-friendly)", "score": 92, "reasoning": "Why this headline works better"},
    {"text": "Alternative headline 2", "score": 85, "reasoning": "Why this works"},
    {"text": "Alternative headline 3", "score": 78, "reasoning": "Why this works"}
  ],
  "seoSuggestions": [
    "Specific SEO improvement suggestion 1",
    "Specific SEO improvement suggestion 2",
    "Specific SEO improvement suggestion 3"
  ],
  "autoTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "excerptSuggestion": "A compelling 1-2 sentence excerpt that would drive clicks (max 160 chars)"
}

Current Title: ${title}
Current Excerpt: ${excerpt || 'None'}
Article Content: ${content.slice(0, 5000)}`

    const result = await callGeminiCached<AIEditorSuggestion>(
      `ai:suggest:${slug}`,
      prompt,
      CACHE_TTL,
      (text) => parseGeminiJSON<AIEditorSuggestion>(text)
    )

    logger.request('POST', '/api/ai/suggest', 200, Date.now() - start, {
      slug,
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

    logger.error('AI suggest failed', { slug, error: String(err) })
    return NextResponse.json(
      { data: FALLBACK, cached: false, fallback: true },
      { status: 200, headers: rateLimitHeaders(rl) }
    )
  }
}

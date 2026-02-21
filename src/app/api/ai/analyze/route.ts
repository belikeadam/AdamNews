import { NextResponse } from 'next/server'
import { callAICached, parseGeminiJSON, RateLimitError } from '@/lib/ai/router'
import { parseBody, AIAnalyzeSchema } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { AIAnalysis } from '@/types/ai'

const CACHE_TTL = 60 * 60 * 24 * 7 // 7 days

const FALLBACK: AIAnalysis = {
  tldr: 'Analysis temporarily unavailable.',
  keyTakeaways: [],
  sentiment: { label: 'neutral', score: 0.5, explanation: 'Unable to analyze' },
  readingLevel: { grade: 8, label: 'Moderate' },
  factCheck: { status: 'unverified', note: 'Automated verification unavailable' },
  entities: { people: [], organizations: [], locations: [] },
  topics: [],
  readTimeSaved: '2 min',
}

export async function POST(request: Request) {
  const start = Date.now()

  // IP rate limit
  const ip = getClientIp(request)
  const rl = await rateLimit(`ai-analyze:${ip}`, { limit: 20, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  // Validate body
  const parsed = await parseBody(request, AIAnalyzeSchema)
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { slug, title, content } = parsed.data

  try {
    const prompt = `You are a senior news analyst. Analyze this article and respond ONLY with valid JSON matching this exact structure (no markdown, no code fences):

{
  "tldr": "One-sentence summary under 30 words",
  "keyTakeaways": ["takeaway 1 (max 15 words)", "takeaway 2", "takeaway 3"],
  "sentiment": {
    "label": "positive|neutral|negative|mixed",
    "score": 0.75,
    "explanation": "Brief reason for this sentiment assessment"
  },
  "readingLevel": {
    "grade": 8,
    "label": "Easy Read|Moderate|Advanced|Expert"
  },
  "factCheck": {
    "status": "verified|unverified|mixed",
    "note": "Brief assessment of source quality and claim verifiability (max 25 words)"
  },
  "entities": {
    "people": ["Person Name"],
    "organizations": ["Org Name"],
    "locations": ["Place Name"]
  },
  "topics": ["topic1", "topic2", "topic3"],
  "readTimeSaved": "3 min"
}

Title: ${title}
Article: ${content.slice(0, 6000)}`

    const result = await callAICached<AIAnalysis>(
      'analyze',
      `ai:analysis:${slug}`,
      prompt,
      CACHE_TTL,
      (text) => parseGeminiJSON<AIAnalysis>(text)
    )

    logger.request('POST', '/api/ai/analyze', 200, Date.now() - start, {
      slug,
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

    logger.error('AI analyze failed', { slug, error: String(err) })
    return NextResponse.json(
      { data: FALLBACK, cached: false, fallback: true },
      { status: 200, headers: rateLimitHeaders(rl) }
    )
  }
}

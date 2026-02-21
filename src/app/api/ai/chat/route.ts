import { NextResponse } from 'next/server'
import { callGeminiCached, parseGeminiJSON, RateLimitError } from '@/lib/ai/gemini'
import { parseBody, AIChatSchema } from '@/lib/validations'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { AIChatResponse } from '@/types/ai'

const CACHE_TTL = 60 * 60 * 24 // 24 hours

function hashQuestion(q: string): string {
  let hash = 0
  for (let i = 0; i < q.length; i++) {
    const char = q.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export async function POST(request: Request) {
  const start = Date.now()

  const ip = getClientIp(request)
  const rl = await rateLimit(`ai-chat:${ip}`, { limit: 15, windowSeconds: 60 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const parsed = await parseBody(request, AIChatSchema)
  if (!parsed.data) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }

  const { slug, title, content, question } = parsed.data
  const qHash = hashQuestion(question.toLowerCase().trim())

  try {
    const prompt = `You are a helpful news assistant. Answer the user's question using ONLY the article content below. Do NOT use any outside knowledge. If the article doesn't contain enough information to answer, say so honestly.

Respond ONLY with valid JSON (no markdown, no code fences):
{"answer": "Your answer here (concise, 2-4 sentences)", "sourceReference": "Which part of the article this comes from"}

Article Title: ${title}
Article Content: ${content.slice(0, 6000)}

User Question: ${question}`

    const result = await callGeminiCached<AIChatResponse>(
      `ai:chat:${slug}:${qHash}`,
      prompt,
      CACHE_TTL,
      (text) => parseGeminiJSON<AIChatResponse>(text)
    )

    logger.request('POST', '/api/ai/chat', 200, Date.now() - start, {
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

    logger.error('AI chat failed', { slug, error: String(err) })
    return NextResponse.json(
      { data: { answer: 'I was unable to process your question. Please try again.', sourceReference: '' }, cached: false },
      { status: 200, headers: rateLimitHeaders(rl) }
    )
  }
}

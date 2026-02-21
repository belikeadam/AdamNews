import { GoogleGenAI } from '@google/genai'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

// Singleton Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })

const MODEL = 'gemini-2.5-flash'
const RATE_LIMIT_MAX = 8 // Self-imposed cap (free tier allows 10 RPM)

/**
 * Check Gemini-specific rate limit (shared across all AI routes).
 * Uses a per-minute sliding window in Redis.
 */
export async function checkGeminiRateLimit(): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    const minute = Math.floor(Date.now() / 60000)
    const key = `rl:gemini:${minute}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 65)
    return { allowed: count <= RATE_LIMIT_MAX, retryAfter: count > RATE_LIMIT_MAX ? 15 : 0 }
  } catch {
    // Redis down — fail open
    return { allowed: true, retryAfter: 0 }
  }
}

/**
 * Call Gemini with caching.
 * Checks Redis cache first, calls Gemini on miss, stores result.
 */
export async function callGeminiCached<T>(
  cacheKey: string,
  prompt: string,
  ttlSeconds: number,
  parseResponse: (text: string) => T
): Promise<{ data: T; cached: boolean }> {
  // Check cache first
  try {
    const cached = await redis.get<T>(cacheKey)
    if (cached !== null) {
      return { data: cached, cached: true }
    }
  } catch {
    // Redis unavailable — continue to Gemini
  }

  // Check rate limit
  const rl = await checkGeminiRateLimit()
  if (!rl.allowed) {
    throw new RateLimitError(rl.retryAfter)
  }

  // Call Gemini
  const start = Date.now()
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
    },
  })

  const duration = Date.now() - start
  const text = response.text || ''

  logger.info('Gemini API call', { cacheKey, durationMs: duration, responseLength: text.length })

  // Parse the response
  const data = parseResponse(text)

  // Cache the result
  try {
    await redis.set(cacheKey, data, { ex: ttlSeconds })
  } catch {
    // Redis unavailable — continue without caching
  }

  return { data, cached: false }
}

/**
 * Call Gemini for streaming responses (used by chat).
 */
export async function callGeminiStream(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const rl = await checkGeminiRateLimit()
  if (!rl.allowed) {
    throw new RateLimitError(rl.retryAfter)
  }

  const response = await ai.models.generateContentStream({
    model: MODEL,
    contents: prompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 800,
    },
  })

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.text || ''
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch (err) {
        logger.error('Gemini stream error', { error: String(err) })
      } finally {
        controller.close()
      }
    },
  })
}

/**
 * Parse JSON from Gemini response text.
 * Handles markdown code fences and other formatting.
 */
export function parseGeminiJSON<T>(text: string): T {
  const cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()
  return JSON.parse(cleaned)
}

/** Custom error for rate limiting */
export class RateLimitError extends Error {
  retryAfter: number
  constructor(retryAfter: number) {
    super('Gemini rate limit exceeded')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

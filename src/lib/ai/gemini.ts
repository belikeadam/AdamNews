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
 * Parse JSON from AI response text.
 * Handles markdown code fences, truncated responses, and unescaped characters.
 */
export function parseGeminiJSON<T>(text: string): T {
  // Strip markdown code fences
  let cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim()

  // Try direct parse first
  try {
    return JSON.parse(cleaned)
  } catch {
    // Continue to fallback strategies
  }

  // Strategy 2: Extract the first complete JSON object using brace matching
  const jsonStart = cleaned.indexOf('{')
  if (jsonStart !== -1) {
    let depth = 0
    let inString = false
    let escape = false
    let jsonEnd = -1

    for (let i = jsonStart; i < cleaned.length; i++) {
      const ch = cleaned[i]
      if (escape) { escape = false; continue }
      if (ch === '\\' && inString) { escape = true; continue }
      if (ch === '"' && !escape) { inString = !inString; continue }
      if (inString) continue
      if (ch === '{') depth++
      else if (ch === '}') { depth--; if (depth === 0) { jsonEnd = i; break } }
    }

    if (jsonEnd !== -1) {
      try {
        return JSON.parse(cleaned.slice(jsonStart, jsonEnd + 1))
      } catch {
        // Continue to next strategy
      }
    }
  }

  // Strategy 3: Fix truncated JSON (AI hit token limit)
  // Add closing braces/brackets as needed
  if (jsonStart !== -1) {
    let partial = cleaned.slice(jsonStart)
    // Close any open strings, arrays, objects
    const openBraces = (partial.match(/{/g) || []).length
    const closeBraces = (partial.match(/}/g) || []).length
    const openBrackets = (partial.match(/\[/g) || []).length
    const closeBrackets = (partial.match(/\]/g) || []).length

    // Trim to last complete value (before any trailing incomplete string)
    partial = partial.replace(/,\s*"[^"]*$/, '')  // remove trailing incomplete key-value
    partial = partial.replace(/,\s*$/, '')         // remove trailing comma

    // Close open structures
    for (let i = 0; i < openBrackets - closeBrackets; i++) partial += ']'
    for (let i = 0; i < openBraces - closeBraces; i++) partial += '}'

    try {
      return JSON.parse(partial)
    } catch {
      // Continue to final strategy
    }
  }

  // Strategy 4: For translation-like responses, try regex extraction
  const titleMatch = cleaned.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/)
  const contentMatch = cleaned.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/)

  if (titleMatch && contentMatch) {
    return { title: titleMatch[1], content: contentMatch[1] } as T
  }

  throw new Error(`Failed to parse AI JSON response: ${cleaned.slice(0, 200)}`)
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

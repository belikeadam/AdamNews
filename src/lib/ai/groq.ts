import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const RATE_LIMIT_MAX = 25 // Self-imposed cap (Groq free tier allows 30 RPM)

/**
 * Check Groq-specific rate limit (shared across all AI routes).
 * Uses a per-minute sliding window in Redis.
 */
export async function checkGroqRateLimit(): Promise<{ allowed: boolean; retryAfter: number }> {
  try {
    const minute = Math.floor(Date.now() / 60000)
    const key = `rl:groq:${minute}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, 65)
    return { allowed: count <= RATE_LIMIT_MAX, retryAfter: count > RATE_LIMIT_MAX ? 10 : 0 }
  } catch {
    return { allowed: true, retryAfter: 0 }
  }
}

/**
 * Call Groq LLaMA 3.3 70B (OpenAI-compatible API, no extra dependency).
 */
export async function callGroq(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not configured')

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.2,
      max_tokens: options?.maxTokens ?? 2048,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    logger.error('Groq API error', { status: res.status, body: body.slice(0, 200) })
    throw new Error(`Groq API returned ${res.status}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Call Groq with streaming for real-time responses.
 */
export async function callGroqStream(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not configured')

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 800,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) {
    throw new Error(`Groq stream failed: ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        let buffer = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue
            const payload = trimmed.slice(6)
            if (payload === '[DONE]') continue

            try {
              const json = JSON.parse(payload)
              const text = json.choices?.[0]?.delta?.content || ''
              if (text) controller.enqueue(encoder.encode(text))
            } catch {
              // skip malformed SSE chunks
            }
          }
        }
      } catch (err) {
        logger.error('Groq stream error', { error: String(err) })
      } finally {
        controller.close()
      }
    },
  })
}

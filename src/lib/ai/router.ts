import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'
import { callGroq, checkGroqRateLimit, callGroqStream } from './groq'
import { checkGeminiRateLimit, RateLimitError, parseGeminiJSON } from './gemini'
import { GoogleGenAI } from '@google/genai'

// ── Types ──────────────────────────────────────────────────────

export type AITask = 'analyze' | 'chat' | 'translate' | 'digest' | 'suggest'
export type Provider = 'groq' | 'gemini'

interface RouteConfig {
  primary: Provider
  fallback: Provider
  reason: string
}

// ── Task-based routing table ───────────────────────────────────

const TASK_ROUTING: Record<AITask, RouteConfig> = {
  analyze:   { primary: 'groq',   fallback: 'gemini', reason: 'Strong summarization + reasoning' },
  chat:      { primary: 'groq',   fallback: 'gemini', reason: 'Fast + accurate Q&A' },
  translate: { primary: 'gemini', fallback: 'groq',   reason: 'Strong multilingual support' },
  digest:    { primary: 'groq',   fallback: 'gemini', reason: 'Cost optimization' },
  suggest:   { primary: 'groq',   fallback: 'gemini', reason: 'Creative headline generation' },
}

// ── Gemini raw call (extracted for router use) ─────────────────

const geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' })
const GEMINI_MODEL = 'gemini-2.5-flash'

async function callGeminiRaw(prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  const response = await geminiClient.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      temperature: options?.temperature ?? 0.2,
      maxOutputTokens: options?.maxTokens ?? 2048,
    },
  })
  return response.text || ''
}

// ── Provider dispatcher ────────────────────────────────────────

async function checkRateLimit(provider: Provider): Promise<{ allowed: boolean; retryAfter: number }> {
  return provider === 'groq' ? checkGroqRateLimit() : checkGeminiRateLimit()
}

async function callProvider(provider: Provider, prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<string> {
  if (provider === 'groq') return callGroq(prompt, options)
  return callGeminiRaw(prompt, options)
}

// ── Main cached router ─────────────────────────────────────────

/**
 * Provider-agnostic AI call with cache, rate limiting, and automatic failover.
 *
 * Flow: Cache check → Primary provider → Fallback provider → Error
 */
export async function callAICached<T>(
  task: AITask,
  cacheKey: string,
  prompt: string,
  ttlSeconds: number,
  parseResponse: (text: string) => T
): Promise<{ data: T; cached: boolean; provider: Provider }> {
  const route = TASK_ROUTING[task]

  // 1. Check Redis cache (provider-agnostic)
  try {
    const cached = await redis.get<T>(cacheKey)
    if (cached !== null) {
      return { data: cached, cached: true, provider: route.primary }
    }
  } catch {
    // Redis unavailable — continue
  }

  // 2. Try primary provider
  const primaryRL = await checkRateLimit(route.primary)
  if (primaryRL.allowed) {
    try {
      const start = Date.now()
      const text = await callProvider(route.primary, prompt)
      const duration = Date.now() - start
      const data = parseResponse(text)

      logger.info('AI router call', {
        task,
        provider: route.primary,
        role: 'primary',
        durationMs: duration,
        responseLength: text.length,
      })

      // Cache the result
      try { await redis.set(cacheKey, data, { ex: ttlSeconds }) } catch { /* */ }

      return { data, cached: false, provider: route.primary }
    } catch (err) {
      logger.warn('AI primary provider failed, trying fallback', {
        task,
        primary: route.primary,
        fallback: route.fallback,
        error: String(err),
      })
    }
  }

  // 3. Try fallback provider
  const fallbackRL = await checkRateLimit(route.fallback)
  if (!fallbackRL.allowed) {
    throw new RateLimitError(Math.max(primaryRL.retryAfter, fallbackRL.retryAfter) || 15)
  }

  const start = Date.now()
  const text = await callProvider(route.fallback, prompt)
  const duration = Date.now() - start
  const data = parseResponse(text)

  logger.info('AI router call', {
    task,
    provider: route.fallback,
    role: 'fallback',
    durationMs: duration,
    responseLength: text.length,
  })

  // Cache the result
  try { await redis.set(cacheKey, data, { ex: ttlSeconds }) } catch { /* */ }

  return { data, cached: false, provider: route.fallback }
}

// ── Streaming router (for chat) ────────────────────────────────

/**
 * Streaming AI call with automatic failover.
 * Tries primary provider first, falls back on failure.
 */
export async function callAIStream(
  task: AITask,
  prompt: string
): Promise<{ stream: ReadableStream<Uint8Array>; provider: Provider }> {
  const route = TASK_ROUTING[task]

  // Try primary
  const primaryRL = await checkRateLimit(route.primary)
  if (primaryRL.allowed) {
    try {
      const stream = route.primary === 'groq'
        ? await callGroqStream(prompt)
        : await callGeminiStreamRaw(prompt)
      return { stream, provider: route.primary }
    } catch (err) {
      logger.warn('AI stream primary failed, trying fallback', {
        task,
        primary: route.primary,
        error: String(err),
      })
    }
  }

  // Fallback
  const fallbackRL = await checkRateLimit(route.fallback)
  if (!fallbackRL.allowed) {
    throw new RateLimitError(15)
  }

  const stream = route.fallback === 'groq'
    ? await callGroqStream(prompt)
    : await callGeminiStreamRaw(prompt)
  return { stream, provider: route.fallback }
}

// Gemini stream helper
async function callGeminiStreamRaw(prompt: string): Promise<ReadableStream<Uint8Array>> {
  const response = await geminiClient.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: prompt,
    config: { temperature: 0.3, maxOutputTokens: 800 },
  })

  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const text = chunk.text || ''
          if (text) controller.enqueue(encoder.encode(text))
        }
      } catch (err) {
        logger.error('Gemini stream error', { error: String(err) })
      } finally {
        controller.close()
      }
    },
  })
}

// ── Re-export for convenience ──────────────────────────────────

export { parseGeminiJSON, RateLimitError } from './gemini'

/** Get routing info for a task (for logging / response metadata) */
export function getRouteInfo(task: AITask) {
  return TASK_ROUTING[task]
}

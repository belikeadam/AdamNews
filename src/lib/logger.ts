/**
 * Structured JSON logger for production monitoring.
 *
 * Outputs structured JSON in production (parseable by ELK, Datadog, CloudWatch).
 * Outputs human-readable format in development.
 *
 * Usage:
 *   logger.info('Article viewed', { slug: 'my-article', views: 42 })
 *   logger.error('Stripe webhook failed', { error: err.message, eventId: '...' })
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  service: string
  [key: string]: unknown
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LEVEL = process.env.NODE_ENV === 'production' ? 'info' : 'debug'
const SERVICE_NAME = 'adamnews'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LEVEL]
}

function formatEntry(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: SERVICE_NAME,
    ...meta,
  }
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  if (!shouldLog(level)) return

  const entry = formatEntry(level, message, meta)

  if (process.env.NODE_ENV === 'production') {
    // Structured JSON for log aggregation (ELK, Datadog, CloudWatch)
    const output = JSON.stringify(entry)
    if (level === 'error') console.error(output)
    else if (level === 'warn') console.warn(output)
    else console.log(output)
  } else {
    // Human-readable for development
    const prefix = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌' }[level]
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : ''
    if (level === 'error') console.error(`${prefix} [${level.toUpperCase()}] ${message}${metaStr}`)
    else if (level === 'warn') console.warn(`${prefix} [${level.toUpperCase()}] ${message}${metaStr}`)
    else console.log(`${prefix} [${level.toUpperCase()}] ${message}${metaStr}`)
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),

  /** Log an API request with timing, status, and metadata. */
  request: (method: string, path: string, status: number, durationMs: number, meta?: Record<string, unknown>) => {
    const level: LogLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
    emit(level, `${method} ${path} ${status}`, { durationMs, status, method, path, ...meta })
  },
}

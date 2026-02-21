import { NextResponse } from 'next/server'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL!

interface ServiceStatus {
  status: 'healthy' | 'degraded' | 'down'
  latencyMs: number
  error?: string
}

async function checkStrapi(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const res = await fetch(`${STRAPI_URL}/api/categories?pagination[pageSize]=1`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    return { status: res.ok ? 'healthy' : 'degraded', latencyMs: Date.now() - start }
  } catch (err) {
    return { status: 'down', latencyMs: Date.now() - start, error: (err as Error).message }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    await redis.ping()
    return { status: 'healthy', latencyMs: Date.now() - start }
  } catch (err) {
    return { status: 'down', latencyMs: Date.now() - start, error: (err as Error).message }
  }
}

export async function GET() {
  const start = Date.now()
  const [strapi, redisStatus] = await Promise.all([checkStrapi(), checkRedis()])

  const overall =
    strapi.status === 'down' ? 'degraded' :
    redisStatus.status === 'down' ? 'degraded' :
    'healthy'

  const result = {
    status: overall,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: { strapi, redis: redisStatus },
    totalLatencyMs: Date.now() - start,
  }

  logger.info('Health check', { status: overall, totalLatencyMs: result.totalLatencyMs })

  return NextResponse.json(result, {
    status: overall === 'healthy' ? 200 : 503,
  })
}

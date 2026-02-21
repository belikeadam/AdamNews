import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Log analytics events — in production, forward to your analytics service
    // (e.g., Posthog, Mixpanel, BigQuery, or your own database)
    console.log(`[Analytics] ${data.type}: slug=${data.slug}, read=${data.readSeconds}s, scroll=${data.maxScrollDepth}%`)

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ received: true })
  }
}

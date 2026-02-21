import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/api/stripe'

const PRICE_IDS: Record<string, Record<string, string | undefined>> = {
  standard: {
    monthly: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID || process.env.STRIPE_STANDARD_PRICE_ID,
    annual: process.env.STRIPE_STANDARD_ANNUAL_PRICE_ID || process.env.STRIPE_STANDARD_PRICE_ID,
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || process.env.STRIPE_PREMIUM_PRICE_ID,
    annual: process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID || process.env.STRIPE_PREMIUM_PRICE_ID,
  },
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { planId, billing } = await request.json()
  if (!planId || !billing) {
    return NextResponse.json(
      { error: 'planId and billing are required' },
      { status: 400 }
    )
  }

  const priceId = PRICE_IDS[planId]?.[billing]
  if (!priceId) {
    return NextResponse.json(
      { error: 'Stripe not configured. Set price IDs in environment variables.' },
      { status: 400 }
    )
  }

  try {
    const origin = new URL(request.url).origin
    const url = await createCheckoutSession({
      priceId,
      userId: session.user.id,
      userEmail: session.user.email || '',
      origin,
    })

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

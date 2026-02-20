import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/api/stripe'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { priceId } = await request.json()
  if (!priceId) {
    return NextResponse.json(
      { error: 'priceId is required' },
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

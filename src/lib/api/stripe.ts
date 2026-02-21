import Stripe from 'stripe'

// Lazy initialization — prevents build-time crash when STRIPE_SECRET_KEY is not set
function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set. Add it to your .env file.')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    typescript: true,
  })
}

export async function createCheckoutSession(params: {
  priceId: string
  userId: string
  userEmail: string
  origin: string
  planId?: string
}): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: `${params.origin}/account?checkout=success&plan=${params.planId || 'standard'}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/plans`,
    customer_email: params.userEmail,
    metadata: {
      userId: params.userId,
    },
    subscription_data: {
      metadata: { userId: params.userId },
    },
  })

  return session.url!
}

export function constructWebhookEvent(
  body: string,
  signature: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

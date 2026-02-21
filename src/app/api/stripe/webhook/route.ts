import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/api/stripe'
import { rateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type Stripe from 'stripe'

/**
 * Map Stripe Price IDs → plan names.
 * Reads from the same env vars used by the checkout route.
 */
function getPlanFromPriceId(priceId: string): 'standard' | 'premium' | null {
  const standardIds = [
    process.env.STRIPE_STANDARD_PRICE_ID,
    process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID,
    process.env.STRIPE_STANDARD_ANNUAL_PRICE_ID,
  ].filter(Boolean)

  const premiumIds = [
    process.env.STRIPE_PREMIUM_PRICE_ID,
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID,
  ].filter(Boolean)

  if (standardIds.includes(priceId)) return 'standard'
  if (premiumIds.includes(priceId)) return 'premium'
  return null
}

export async function POST(request: Request) {
  const start = Date.now()
  const ip = getClientIp(request)

  // Rate limit: 100 webhook calls per minute (Stripe can batch)
  const rl = await rateLimit(`webhook:${ip}`, { limit: 100, windowSeconds: 60 })
  if (!rl.allowed) {
    logger.warn('Rate limit exceeded on Stripe webhook', { ip })
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  // CRITICAL: use text() not json() for signature verification
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    logger.warn('Missing stripe-signature header', { ip })
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (error) {
    logger.error('Webhook signature verification failed', { error: (error as Error).message, ip })
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription as string

        logger.info('Checkout completed', { userId, subscriptionId, eventId: event.id })

        if (session.line_items?.data?.[0]?.price?.id) {
          const plan = getPlanFromPriceId(session.line_items.data[0].price.id)
          logger.info('User subscribed', { userId, plan })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        const status = subscription.status
        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceId ? getPlanFromPriceId(priceId) : null

        logger.info('Subscription updated', { userId, status, plan, eventId: event.id })

        if (status === 'past_due' || status === 'unpaid') {
          logger.warn('Subscription payment issue', { subscriptionId: subscription.id, status })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        logger.info('Subscription cancelled', { userId, eventId: event.id })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription
        const customerEmail = invoice.customer_email
        logger.warn('Payment failed', { subscriptionId, customerEmail, eventId: event.id })
        break
      }

      default:
        logger.info('Unhandled Stripe event', { type: event.type, eventId: event.id })
    }
  } catch (error) {
    logger.error('Webhook handler error', { error: (error as Error).message, eventType: event.type })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  logger.request('POST', '/api/stripe/webhook', 200, Date.now() - start, { eventType: event.type })

  return NextResponse.json({ received: true })
}

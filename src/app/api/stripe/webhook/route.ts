import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/api/stripe'
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
  // CRITICAL: use text() not json() for signature verification
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(body, signature)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
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

        console.log(
          `[Stripe] Checkout completed — user: ${userId}, subscription: ${subscriptionId}`
        )

        // Resolve which plan was purchased from the line items
        if (session.line_items?.data?.[0]?.price?.id) {
          const plan = getPlanFromPriceId(session.line_items.data[0].price.id)
          console.log(`[Stripe] User ${userId} subscribed to: ${plan}`)

          // In production, update the user record in your database:
          // await db.user.update({ where: { id: userId }, data: { plan, stripeSubscriptionId: subscriptionId } })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        const status = subscription.status
        const priceId = subscription.items.data[0]?.price?.id
        const plan = priceId ? getPlanFromPriceId(priceId) : null

        console.log(
          `[Stripe] Subscription updated — user: ${userId}, status: ${status}, plan: ${plan}`
        )

        if (status === 'active' && plan) {
          // User upgraded/changed plan
          // await db.user.update({ where: { id: userId }, data: { plan } })
        } else if (status === 'past_due' || status === 'unpaid') {
          // Payment issue — optionally restrict access
          console.warn(`[Stripe] Subscription ${subscription.id} is ${status}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        console.log(`[Stripe] Subscription cancelled — user: ${userId}`)

        // Downgrade user to free plan
        // await db.user.update({ where: { id: userId }, data: { plan: 'free', stripeSubscriptionId: null } })
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice as Stripe.Invoice & { subscription?: string }).subscription
        const customerEmail = invoice.customer_email

        console.warn(
          `[Stripe] Payment failed — subscription: ${subscriptionId}, email: ${customerEmail}`
        )

        // Notify user via email or in-app notification
        // await sendPaymentFailedEmail(customerEmail)
        break
      }

      default:
        console.log(`[Stripe] Unhandled event: ${event.type}`)
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent } from '@/lib/api/stripe'
import type Stripe from 'stripe'

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
        console.log(
          `Checkout completed for user ${userId}, subscription: ${session.subscription}`
        )
        // TODO: Update user plan in database
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(
          `Subscription ${subscription.id} updated: ${subscription.status}`
        )
        // TODO: Update user plan
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`Subscription ${subscription.id} cancelled`)
        // TODO: Downgrade user to free plan
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log(
          `Payment failed for subscription ${(invoice as Stripe.Invoice & { subscription?: string }).subscription}`
        )
        // TODO: Notify user
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
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

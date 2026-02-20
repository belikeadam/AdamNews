'use client'

import { useState } from 'react'
import TechBar from '@/components/layout/TechBar'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ArchCallout from '@/components/shared/ArchCallout'
import { PLANS } from '@/constants/plans'
import { cn } from '@/lib/utils'

export default function PlansPage() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')

  const handleSubscribe = async (planId: string) => {
    const plan = PLANS.find((p) => p.id === planId)
    if (!plan || planId === 'free') {
      window.location.href = '/login'
      return
    }

    const priceId = plan.stripePriceId[billing]
    if (!priceId) {
      alert('Stripe not configured. Set price IDs in .env')
      return
    }

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId }),
    })

    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <>
      <TechBar
        badges={[
          { label: 'SSR', tooltip: 'Server-side rendered', variant: 'success' },
          { label: 'Stripe Checkout', tooltip: 'Payments handled by Stripe hosted checkout' },
          { label: 'JWT Claims', tooltip: 'Plan stored in JWT token claims' },
        ]}
      />

      <div className="max-w-5xl mx-auto px-4 py-12 pb-20 md:pb-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            Choose your plan
          </h1>
          <p className="text-[var(--muted)] mb-6">
            Unlock premium content and exclusive features
          </p>

          {/* Monthly / Annual toggle */}
          <div className="inline-flex items-center bg-[var(--surface)] rounded-lg p-1 border border-[var(--border)]">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-4 h-9 rounded text-sm font-medium transition-colors',
                billing === 'monthly'
                  ? 'bg-[var(--bg)] shadow-sm text-[var(--text)]'
                  : 'text-[var(--muted)]'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'px-4 h-9 rounded text-sm font-medium transition-colors',
                billing === 'annual'
                  ? 'bg-[var(--bg)] shadow-sm text-[var(--text)]'
                  : 'text-[var(--muted)]'
              )}
            >
              Annual{' '}
              <Badge variant="success" className="ml-1">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative',
                plan.highlight && 'ring-2 ring-[var(--accent)]'
              )}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="accent" size="md">
                    Most popular
                  </Badge>
                </div>
              )}
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-[var(--text)]">
                    RM{plan.price[billing]}
                  </span>
                  {plan.price[billing] > 0 && (
                    <span className="text-[var(--muted)]">/mo</span>
                  )}
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-[var(--muted)]"
                    >
                      <span className="text-[var(--success)]">&#10003;</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.highlight ? 'primary' : 'outline'}
                  className="w-full"
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tech note */}
        <p className="text-center text-xs text-[var(--muted)] mt-8">
          Payments via Stripe &middot; FPX via Billplz &middot; JWT subscriber
          claims &middot; Redis session TTL 24h
        </p>

        <ArchCallout
          apiCall="POST /api/stripe/checkout — creates Stripe Checkout Session"
          caching="No caching — real-time payment flow"
          auth="Requires authenticated session"
          rationale="Stripe Checkout handles PCI compliance. Webhook provisions access on payment success."
          className="mt-6"
        />
      </div>
    </>
  )
}

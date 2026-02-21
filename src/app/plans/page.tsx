'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PLANS } from '@/constants/plans'
import { cn } from '@/lib/utils'

const cardStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const cardItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 200, damping: 25 } },
}

export default function PlansPage() {
  const { data: session, status } = useSession()
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const currentPlan = session?.user?.plan || 'free'

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/login'
      return
    }

    // Redirect unauthenticated users to login first
    if (status !== 'authenticated') {
      window.location.href = `/login?callbackUrl=/plans`
      return
    }

    setLoading(planId)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, billing }),
      })

      const data = await res.json()
      if (data.error) {
        alert(data.error)
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } finally {
      setLoading(null)
    }
  }

  const isCurrentPlan = (planId: string) => {
    if (status !== 'authenticated') return false
    return planId === currentPlan
  }

  return (
    <>
      {/* Gradient header section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-gradient-to-b from-[var(--surface)] to-[var(--bg)] border-b border-[var(--border)]"
      >
        <div className="max-w-5xl mx-auto px-4 py-8 pb-12 sm:py-12 sm:pb-16 md:py-16 md:pb-20 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-[var(--text)] mb-2 sm:mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
            Choose your plan
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-[var(--muted)] mb-5 sm:mb-8 max-w-md mx-auto leading-relaxed">
            Unlock premium content and exclusive features with a plan that fits you.
          </p>

          {/* Monthly / Annual toggle */}
          <div className="relative inline-grid grid-cols-2 bg-[var(--surface)] rounded-full p-1 border border-[var(--border)] min-w-[260px] sm:min-w-[280px]">
            {/* Animated slider — always 50% width */}
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-[var(--bg)] shadow-sm"
              style={{ width: 'calc(50% - 4px)' }}
              animate={{ x: billing === 'monthly' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'relative z-10 h-9 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-colors',
                billing === 'monthly'
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'relative z-10 h-9 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-colors',
                billing === 'annual'
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
            >
              Annual
            </button>
          </div>
          {/* Save badge — outside the toggle for clean layout */}
          <p className="mt-2 text-xs font-medium text-green-600 dark:text-green-400">
            Save 20% with annual billing
          </p>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-4 sm:-mt-8 md:-mt-10 pb-12">
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-8"
        >
          {PLANS.map((plan) => {
            const isCurrent = isCurrentPlan(plan.id)
            return (
              <motion.div key={plan.id} variants={cardItem}>
                <Card
                  hover
                  className={cn(
                    'relative',
                    isCurrent
                      ? 'ring-2 ring-green-500 dark:ring-green-400'
                      : plan.highlight
                      ? 'ring-2 ring-[var(--accent)] shadow-lg sm:scale-[1.02]'
                      : ''
                  )}
                >
                  {isCurrent ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge variant="success" size="md" pill>
                        Your plan
                      </Badge>
                    </div>
                  ) : plan.highlight ? (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge variant="accent" size="md" pill>
                        Most popular
                      </Badge>
                    </div>
                  ) : null}
                  <CardContent className="pt-7 sm:pt-8 pb-5 sm:pb-6 px-4 sm:px-6">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1">
                      {plan.name}
                    </h3>
                    <div className="mb-5 sm:mb-6">
                      <span className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text)]">
                        RM{plan.price[billing]}
                      </span>
                      {plan.price[billing] > 0 && (
                        <span className="text-[var(--muted)] ml-1 text-sm">/mo</span>
                      )}
                    </div>

                    <ul className="space-y-2.5 sm:space-y-3 mb-6 sm:mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-[var(--muted)]"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <Button variant="outline" className="w-full" size="lg" disabled>
                        Current plan
                      </Button>
                    ) : (
                      <Button
                        variant={plan.highlight ? 'primary' : 'outline'}
                        className="w-full"
                        size="lg"
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={loading !== null}
                      >
                        {loading === plan.id ? 'Redirecting…' : plan.cta}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Stripe test card hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 sm:mt-8 bg-[var(--surface)] border border-[var(--border)] p-3 sm:p-4 max-w-lg mx-auto text-center rounded-lg"
        >
          <p className="text-[0.65rem] sm:text-xs font-semibold text-[var(--accent)] uppercase tracking-wider mb-1">
            Stripe Test Mode
          </p>
          <p className="text-xs sm:text-sm text-[var(--text)]">
            Use card <code className="font-mono bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text)] text-[0.7rem] sm:text-sm">4242 4242 4242 4242</code>
          </p>
          <p className="text-[0.65rem] sm:text-xs text-[var(--muted)] mt-1">
            Any future expiry &middot; Any CVC &middot; Any name
          </p>
        </motion.div>

        <p className="text-center text-[0.65rem] sm:text-xs text-[var(--muted)] mt-5 sm:mt-6">
          Secure payments via Stripe &middot; Cancel anytime &middot; 30-day money-back guarantee
        </p>
      </div>
    </>
  )
}

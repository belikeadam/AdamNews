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
        <div className="max-w-5xl mx-auto px-4 py-10 pb-14 sm:py-16 sm:pb-20 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[var(--text)] mb-3 sm:mb-4" style={{ fontFamily: 'var(--font-headline)' }}>
            Choose your plan
          </h1>
          <p className="text-base sm:text-lg text-[var(--muted)] mb-6 sm:mb-8 max-w-md mx-auto">
            Unlock premium content and exclusive features with a plan that fits you.
          </p>

          {/* Monthly / Annual toggle with animated slider */}
          <div className="relative inline-flex items-center bg-[var(--surface)] rounded-full p-1 border border-[var(--border)]">
            <motion.div
              className="absolute top-1 bottom-1 rounded-full bg-[var(--bg)] shadow-sm"
              layoutId="billing-toggle"
              animate={{
                left: billing === 'monthly' ? '4px' : '50%',
                right: billing === 'annual' ? '4px' : '50%',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'relative z-10 px-5 h-10 rounded-full text-sm font-medium transition-colors',
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
                'relative z-10 px-5 h-10 rounded-full text-sm font-medium transition-colors',
                billing === 'annual'
                  ? 'text-[var(--text)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
            >
              Annual{' '}
              <Badge variant="success" className="ml-1">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="max-w-5xl mx-auto px-4 -mt-6 sm:-mt-10 pb-12">
        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
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
                      ? 'ring-2 ring-[var(--accent)] shadow-lg scale-[1.02]'
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
                  <CardContent className="pt-8 pb-6">
                    <h3 className="text-lg font-semibold text-[var(--text)] mb-1">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-4xl font-bold tracking-tight text-[var(--text)]">
                        RM{plan.price[billing]}
                      </span>
                      {plan.price[billing] > 0 && (
                        <span className="text-[var(--muted)] ml-1">/mo</span>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-[var(--muted)]"
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
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 max-w-lg mx-auto text-center"
        >
          <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">
            Stripe Test Mode
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            Use card <code className="font-mono bg-blue-100 dark:bg-blue-800/40 px-1.5 py-0.5 rounded text-blue-900 dark:text-blue-200">4242 4242 4242 4242</code>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
            Any future expiry (e.g. 12/29) &middot; Any 3-digit CVC &middot; Any name
          </p>
        </motion.div>

        <p className="text-center text-xs text-[var(--muted)] mt-6">
          Secure payments via Stripe &middot; Cancel anytime &middot; 30-day money-back guarantee
        </p>
      </div>
    </>
  )
}

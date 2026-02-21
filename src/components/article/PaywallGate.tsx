'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PLANS } from '@/constants/plans'

export default function PaywallGate() {
  const paidPlans = PLANS.filter((p) => p.id !== 'free')

  return (
    <div className="my-8 border-t-2 border-[var(--accent)] bg-[var(--surface)] rounded-lg p-6 sm:p-8 text-center">
      {/* Lock icon */}
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--accent)]/10 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-[var(--text)] mb-2">
        Continue reading with a subscription
      </h3>
      <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
        This is a premium article. Subscribe to unlock full access to all premium content, exclusive reports, and more.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
        {paidPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-lg border p-4 text-left transition-all ${
              plan.highlight
                ? 'border-[var(--accent)] bg-[var(--bg)] shadow-sm'
                : 'border-[var(--border)] bg-[var(--bg)]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-[var(--text)]">
                {plan.name}
              </h4>
              {plan.highlight && <Badge variant="accent">Popular</Badge>}
            </div>
            <p className="text-2xl font-bold text-[var(--text)] mb-2">
              RM{plan.price.monthly}
              <span className="text-sm font-normal text-[var(--muted)]">
                /mo
              </span>
            </p>
            <ul className="text-sm text-[var(--muted)] space-y-1 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-1.5">
                  <span className="text-[var(--success)]">&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/plans">
              <Button
                variant={plan.highlight ? 'primary' : 'outline'}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--muted)]">
        Already a subscriber?{' '}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>{' '}
        to access this article.
      </p>
    </div>
  )
}

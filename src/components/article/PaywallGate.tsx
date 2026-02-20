'use client'

import Link from 'next/link'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PLANS } from '@/constants/plans'

export default function PaywallGate() {
  const paidPlans = PLANS.filter((p) => p.id !== 'free')

  return (
    <div className="py-8 text-center">
      <h3 className="text-xl font-bold text-[var(--text)] mb-2">
        This is a premium article
      </h3>
      <p className="text-[var(--muted)] mb-6">
        Subscribe to unlock full access to all premium content.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {paidPlans.map((plan) => (
          <Card key={plan.id} hover className={plan.highlight ? 'ring-2 ring-[var(--accent)]' : ''}>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[var(--text)]">
                  {plan.name}
                </h4>
                {plan.highlight && <Badge variant="accent">Popular</Badge>}
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mb-1">
                RM{plan.price.monthly}
                <span className="text-sm font-normal text-[var(--muted)]">
                  /mo
                </span>
              </p>
              <ul className="text-sm text-[var(--muted)] space-y-1 mb-4 text-left">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

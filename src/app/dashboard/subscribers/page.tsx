'use client'

import MetricCard from '@/components/dashboard/MetricCard'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ArchCallout from '@/components/shared/ArchCallout'
import { formatDate } from '@/lib/utils'

const DEMO_SUBSCRIBERS = [
  { email: 'alex@example.com', plan: 'premium', mrr: 35, status: 'active', joined: '2024-01-05T10:00:00Z', sessions: 42 },
  { email: 'bella@example.com', plan: 'standard', mrr: 15, status: 'active', joined: '2024-01-08T14:30:00Z', sessions: 28 },
  { email: 'charlie@example.com', plan: 'premium', mrr: 35, status: 'active', joined: '2023-12-20T09:00:00Z', sessions: 67 },
  { email: 'diana@example.com', plan: 'standard', mrr: 15, status: 'churned', joined: '2023-11-15T11:00:00Z', sessions: 12 },
  { email: 'evan@example.com', plan: 'standard', mrr: 15, status: 'active', joined: '2024-01-12T16:00:00Z', sessions: 8 },
  { email: 'fiona@example.com', plan: 'premium', mrr: 35, status: 'active', joined: '2023-12-28T13:00:00Z', sessions: 55 },
]

const PLAN_VARIANT = {
  premium: 'warning' as const,
  standard: 'accent' as const,
  free: 'default' as const,
}

export default function SubscribersPage() {
  const handleExport = () => {
    const csv = [
      'Email,Plan,MRR,Status,Joined,Sessions',
      ...DEMO_SUBSCRIBERS.map(
        (s) =>
          `${s.email},${s.plan},${s.mrr},${s.status},${s.joined},${s.sessions}`
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">Subscribers</h1>
        <Button variant="outline" onClick={handleExport}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Subscribers"
          value="1,247"
          change="+8.3%"
          trend="up"
        />
        <MetricCard
          title="MRR"
          value="RM 12,450"
          change="+15.2%"
          trend="up"
        />
        <MetricCard
          title="Churn Rate"
          value="2.1%"
          change="-0.3%"
          trend="down"
        />
        <MetricCard
          title="ARPU"
          value="RM 9.98"
          change="+6.1%"
          trend="up"
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text)]">
            Subscriber List
          </h2>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left">
                  <th className="pb-3 font-medium text-[var(--muted)]">
                    Email
                  </th>
                  <th className="pb-3 font-medium text-[var(--muted)]">
                    Plan
                  </th>
                  <th className="pb-3 font-medium text-[var(--muted)]">MRR</th>
                  <th className="pb-3 font-medium text-[var(--muted)]">
                    Status
                  </th>
                  <th className="pb-3 font-medium text-[var(--muted)] hidden md:table-cell">
                    Joined
                  </th>
                  <th className="pb-3 font-medium text-[var(--muted)] hidden lg:table-cell">
                    Sessions
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEMO_SUBSCRIBERS.map((sub) => (
                  <tr
                    key={sub.email}
                    className="border-b border-[var(--border)] hover:bg-[var(--surface)]"
                  >
                    <td className="py-3 text-[var(--text)]">{sub.email}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          PLAN_VARIANT[sub.plan as keyof typeof PLAN_VARIANT]
                        }
                      >
                        {sub.plan}
                      </Badge>
                    </td>
                    <td className="py-3 text-[var(--muted)]">RM{sub.mrr}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          sub.status === 'active' ? 'success' : 'danger'
                        }
                      >
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-[var(--muted)] hidden md:table-cell">
                      {formatDate(sub.joined)}
                    </td>
                    <td className="py-3 text-[var(--muted)] hidden lg:table-cell">
                      {sub.sessions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-[var(--muted)] text-center">
        Stripe integration &middot; JWT sessions &middot; Redis cache
      </p>

      <ArchCallout
        apiCall="Stripe API for subscription data, local DB for session counts"
        caching="No server cache — real-time subscriber data"
        auth="Admin dashboard — requires admin JWT claim"
        rationale="Subscriber data is sensitive and must be fresh. No caching."
      />
    </div>
  )
}

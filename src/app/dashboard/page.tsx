'use client'

import MetricCard from '@/components/dashboard/MetricCard'
import BarChart from '@/components/dashboard/Chart'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ArchCallout from '@/components/shared/ArchCallout'

// Demo data
const PAGEVIEWS_DATA = Array.from({ length: 14 }, (_, i) => ({
  label: `Day ${i + 1}`,
  value: Math.floor(Math.random() * 800 + 200),
}))

const TOP_PAGES = [
  { path: '/', views: 2847, bounce: '32%' },
  { path: '/articles/nextjs-ssr-guide', views: 1923, bounce: '28%' },
  { path: '/plans', views: 892, bounce: '45%' },
  { path: '/articles/stripe-webhooks', views: 756, bounce: '35%' },
  { path: '/api-docs', views: 634, bounce: '22%' },
]

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Overview</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Articles"
          value="48"
          change="+12% this month"
          trend="up"
          sparkline={[20, 25, 30, 28, 35, 42, 48]}
        />
        <MetricCard
          title="Subscribers"
          value="1,247"
          change="+8.3% this month"
          trend="up"
          sparkline={[900, 950, 1020, 1080, 1150, 1200, 1247]}
        />
        <MetricCard
          title="MRR (RM)"
          value="RM 12,450"
          change="+15.2% this month"
          trend="up"
          sparkline={[8000, 8500, 9200, 10100, 11000, 12000, 12450]}
        />
        <MetricCard
          title="Churn Rate"
          value="2.1%"
          change="-0.3% vs last month"
          trend="down"
          sparkline={[3.2, 2.9, 2.8, 2.5, 2.4, 2.3, 2.1]}
        />
      </div>

      {/* Pageviews chart */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-[var(--text)]">
            Pageviews (14 days)
          </h2>
        </CardHeader>
        <CardContent>
          <BarChart data={PAGEVIEWS_DATA} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text)]">
              Top Performing Pages
            </h2>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-2 text-left font-medium text-[var(--muted)]">
                    Path
                  </th>
                  <th className="pb-2 text-right font-medium text-[var(--muted)]">
                    Views
                  </th>
                  <th className="pb-2 text-right font-medium text-[var(--muted)]">
                    Bounce
                  </th>
                </tr>
              </thead>
              <tbody>
                {TOP_PAGES.map((page) => (
                  <tr
                    key={page.path}
                    className="border-b border-[var(--border)]"
                  >
                    <td className="py-2 text-[var(--text)] font-mono text-xs">
                      {page.path}
                    </td>
                    <td className="py-2 text-right text-[var(--muted)]">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="py-2 text-right text-[var(--muted)]">
                      {page.bounce}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Core Web Vitals */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text)]">
              Core Web Vitals
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { metric: 'LCP', value: '1.2s', target: '<2.5s', status: 'success' as const },
                { metric: 'CLS', value: '0.05', target: '<0.1', status: 'success' as const },
                { metric: 'INP', value: '85ms', target: '<200ms', status: 'success' as const },
                { metric: 'FCP', value: '0.8s', target: '<1.8s', status: 'success' as const },
              ].map((item) => (
                <div
                  key={item.metric}
                  className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
                >
                  <div>
                    <span className="font-mono font-medium text-[var(--text)]">
                      {item.metric}
                    </span>
                    <span className="text-xs text-[var(--muted)] ml-2">
                      Target: {item.target}
                    </span>
                  </div>
                  <Badge variant={item.status}>{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ArchCallout
        apiCall="Dashboard data from Strapi REST + Redis cache + Vercel Analytics"
        caching="Client-side fetching with SWR (no ISR for admin pages)"
        auth="Admin role required (JWT claim: role=admin)"
        rationale="Dashboard is CSR because it shows real-time, user-specific data that should not be cached."
      />
    </div>
  )
}

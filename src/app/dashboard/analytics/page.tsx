'use client'

import MetricCard from '@/components/dashboard/MetricCard'
import BarChart from '@/components/dashboard/Chart'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import ArchCallout from '@/components/shared/ArchCallout'

const TRAFFIC_SOURCES = [
  { label: 'Organic', value: 4520 },
  { label: 'Social', value: 2340 },
  { label: 'Direct', value: 1890 },
  { label: 'Referral', value: 980 },
]

const GEO_DATA = [
  { label: 'Malaysia', value: 3200 },
  { label: 'Singapore', value: 1800 },
  { label: 'Indonesia', value: 1200 },
  { label: 'US', value: 890 },
  { label: 'India', value: 650 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Pageviews"
          value="24,580"
          change="+18% vs last month"
          trend="up"
          sparkline={[15000, 17200, 19800, 21000, 22500, 24000, 24580]}
        />
        <MetricCard
          title="Unique Readers"
          value="8,432"
          change="+12% vs last month"
          trend="up"
          sparkline={[5800, 6200, 7000, 7400, 7800, 8100, 8432]}
        />
        <MetricCard
          title="Avg Time on Page"
          value="3m 42s"
          change="+8% vs last month"
          trend="up"
        />
        <MetricCard
          title="Scroll Depth"
          value="72%"
          change="+3% vs last month"
          trend="up"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text)]">
              Traffic by Source
            </h2>
          </CardHeader>
          <CardContent>
            <BarChart data={TRAFFIC_SOURCES} horizontal />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-[var(--text)]">
              Audience Geography
            </h2>
          </CardHeader>
          <CardContent>
            <BarChart data={GEO_DATA} horizontal color="var(--success)" />
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-[var(--muted)] text-center">
        GA4 + Chartbeat integration &middot; Real-time data
      </p>

      <ArchCallout
        apiCall="Google Analytics 4 API + Vercel Web Analytics"
        caching="Client-side fetching, no server cache"
        auth="Admin dashboard — requires authenticated admin session"
        rationale="Analytics data is real-time and user-specific. CSR is appropriate here."
      />
    </div>
  )
}

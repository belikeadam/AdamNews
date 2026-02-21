'use client'

import Link from 'next/link'
import MetricCard from '@/components/dashboard/MetricCard'
import BarChart from '@/components/dashboard/Chart'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ArchCallout from '@/components/shared/ArchCallout'
import AIEditorTools from '@/components/dashboard/AIEditorTools'

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
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Overview</h1>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/dashboard/posts/new/edit"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] transition-colors text-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-[var(--text)]">Write Article</span>
            </Link>
            <Link
              href="/dashboard/posts"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] transition-colors text-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-[var(--text)]">Manage Posts</span>
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] transition-colors text-center"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="text-xs sm:text-sm font-medium text-[var(--text)]">View Site</span>
            </a>
          </div>
        </CardContent>
      </Card>

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
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">
                      Path
                    </th>
                    <th className="pb-2 text-right font-medium text-[var(--muted)] whitespace-nowrap">
                      Views
                    </th>
                    <th className="pb-2 text-right font-medium text-[var(--muted)] whitespace-nowrap">
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
                      <td className="py-2 text-[var(--text)] font-mono text-xs max-w-[200px] truncate">
                        {page.path}
                      </td>
                      <td className="py-2 text-right text-[var(--muted)] whitespace-nowrap">
                        {page.views.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-[var(--muted)] whitespace-nowrap">
                        {page.bounce}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* AI Routing Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-sm font-bold">
              ◆
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text)]">AI Model Routing</h2>
              <p className="text-xs text-[var(--muted)]">
                Multi-provider routing with automatic failover
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { task: 'Analyze', model: 'Groq LLaMA 3.3', fallback: 'Gemini Flash' },
              { task: 'Chat', model: 'Groq LLaMA 3.3', fallback: 'Gemini Flash' },
              { task: 'Translate', model: 'Groq LLaMA 3.3', fallback: 'Gemini Flash' },
              { task: 'Digest', model: 'Groq LLaMA 3.3', fallback: 'Gemini Flash' },
              { task: 'Suggest', model: 'Groq LLaMA 3.3', fallback: 'Gemini Flash' },
            ].map((r) => (
              <div key={r.task} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                <div className="text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-wide">{r.task}</div>
                <div className="text-xs font-semibold text-[var(--text)] mt-1">{r.model}</div>
                <div className="text-[0.6rem] text-[var(--muted)] mt-0.5">Fallback: {r.fallback}</div>
                <Badge variant="success" size="sm" className="mt-1.5">Active</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Editor Tools */}
      <AIEditorTools />

      <ArchCallout
        apiCall="Dashboard data from Strapi REST + Redis cache + Vercel Analytics"
        caching="Client-side fetching with SWR (no ISR for admin pages)"
        auth="Admin role required (JWT claim: role=admin)"
        rationale="Dashboard is CSR because it shows real-time, user-specific data that should not be cached."
      />
    </div>
  )
}

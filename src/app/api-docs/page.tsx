'use client'

import { useState } from 'react'
import TechBar from '@/components/layout/TechBar'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ArchCallout from '@/components/shared/ArchCallout'
import { cn } from '@/lib/utils'

const STRAPI_BASE = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

const ENDPOINTS = [
  {
    id: 'articles',
    method: 'GET',
    path: '/api/articles',
    description: 'List all published articles. Supports Strapi query parameters for filtering, sorting, and pagination.',
    auth: 'Public',
    params: [
      { name: 'populate', type: 'string', required: false, description: 'Include relations: * for all, or specific fields' },
      { name: 'pagination[page]', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'pagination[pageSize]', type: 'number', required: false, description: 'Items per page (default: 25)' },
      { name: 'filters[category][slug][$eq]', type: 'string', required: false, description: 'Filter by category slug' },
      { name: 'sort', type: 'string', required: false, description: 'Sort order, e.g. publishedAt:desc' },
    ],
    curl: `curl "${STRAPI_BASE}/api/articles?populate=*&sort=publishedAt:desc&pagination[pageSize]=5"`,
    tryUrl: `${STRAPI_BASE}/api/articles?populate=*&sort=publishedAt:desc&pagination[pageSize]=3`,
  },
  {
    id: 'categories',
    method: 'GET',
    path: '/api/categories',
    description: 'List all article categories sorted alphabetically.',
    auth: 'Public',
    params: [
      { name: 'sort', type: 'string', required: false, description: 'Sort field, e.g. name:asc' },
    ],
    curl: `curl "${STRAPI_BASE}/api/categories?sort=name:asc"`,
    tryUrl: `${STRAPI_BASE}/api/categories?sort=name:asc`,
  },
  {
    id: 'authors',
    method: 'GET',
    path: '/api/authors',
    description: 'List all authors with their profile information.',
    auth: 'Public',
    params: [
      { name: 'populate', type: 'string', required: false, description: 'Include relations (e.g. avatar)' },
    ],
    curl: `curl "${STRAPI_BASE}/api/authors?populate=*"`,
    tryUrl: `${STRAPI_BASE}/api/authors?populate=*`,
  },
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    description: 'System health check. Returns status of all service dependencies (Strapi CMS, Upstash Redis) with latency measurements. Returns 200 when healthy, 503 when degraded.',
    auth: 'Public',
    params: [],
    curl: `curl "/api/health"`,
    tryUrl: '/api/health',
  },
  {
    id: 'checkout',
    method: 'POST',
    path: '/api/stripe/checkout',
    description: 'Create a Stripe Checkout session for subscription plans. Requires an active NextAuth session.',
    auth: 'Authenticated (NextAuth session)',
    params: [
      { name: 'planId', type: 'string', required: true, description: 'Plan identifier: "standard" or "premium"' },
      { name: 'billing', type: 'string', required: true, description: 'Billing period: "monthly" or "annual"' },
    ],
    curl: `curl -X POST "/api/stripe/checkout" \\
  -H "Content-Type: application/json" \\
  -H "Cookie: next-auth.session-token=..." \\
  -d '{"planId":"standard","billing":"monthly"}'`,
    tryUrl: null,
  },
  {
    id: 'revalidate',
    method: 'POST',
    path: '/api/revalidate',
    description: 'Trigger ISR revalidation when content changes in Strapi. Used as a webhook endpoint.',
    auth: 'Webhook secret (x-webhook-secret header)',
    params: [
      { name: 'model', type: 'string', required: false, description: 'Strapi content type that changed' },
      { name: 'entry', type: 'object', required: false, description: 'The entry data from Strapi webhook' },
    ],
    curl: `curl -X POST "/api/revalidate" \\
  -H "x-webhook-secret: your_secret" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"article","entry":{"slug":"my-article"}}'`,
    tryUrl: null,
  },
  {
    id: 'views',
    method: 'POST',
    path: '/api/articles/:slug/views',
    description: 'Increment the view counter for an article. Called automatically when a reader opens an article.',
    auth: 'Public',
    params: [
      { name: 'slug', type: 'string', required: true, description: 'Article slug (URL parameter)' },
    ],
    curl: `curl -X POST "/api/articles/my-article-slug/views"`,
    tryUrl: null,
  },
  {
    id: 'analytics',
    method: 'POST',
    path: '/api/analytics',
    description: 'Track reader engagement metrics (scroll depth, read time). Fires as a beacon when the user leaves the article page.',
    auth: 'Public',
    params: [
      { name: 'type', type: 'string', required: true, description: 'Event type: "pageview" | "scroll" | "read_complete" | "engagement"' },
      { name: 'slug', type: 'string', required: true, description: 'Article slug' },
      { name: 'readSeconds', type: 'number', required: false, description: 'Time spent reading in seconds' },
      { name: 'maxScrollDepth', type: 'number', required: false, description: 'Maximum scroll percentage (0–100)' },
    ],
    curl: `curl -X POST "/api/analytics" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"article_read","slug":"my-article","readSeconds":45,"maxScrollDepth":82}'`,
    tryUrl: null,
  },
  {
    id: 'stripe-webhook',
    method: 'POST',
    path: '/api/stripe/webhook',
    description: 'Stripe webhook endpoint. Handles checkout.session.completed, subscription.updated, subscription.deleted, and invoice.payment_failed events.',
    auth: 'Stripe signature (stripe-signature header)',
    params: [
      { name: 'body', type: 'string', required: true, description: 'Raw request body (verified via Stripe signature)' },
    ],
    curl: `# Called by Stripe — not invoked manually
stripe trigger checkout.session.completed \\
  --webhook-endpoint="/api/stripe/webhook"`,
    tryUrl: null,
  },
  // ── AI Intelligence Endpoints (Groq LLaMA 3.3 70B + Gemini 2.5 Flash) ──
  {
    id: 'ai-analyze',
    method: 'POST',
    path: '/api/ai/analyze',
    description: 'AI-powered article analysis. Returns TL;DR summary, key takeaways, sentiment, fact-check score, reading level, entities, and topics. Results cached in Redis for 30 days.',
    auth: 'Public',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Article title' },
      { name: 'content', type: 'string', required: true, description: 'Article body (HTML or plain text)' },
      { name: 'slug', type: 'string', required: true, description: 'Article slug (used as cache key)' },
    ],
    curl: `curl -X POST "/api/ai/analyze" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Article Title","content":"<p>Article body...</p>","slug":"my-article"}'`,
    tryUrl: null,
  },
  {
    id: 'ai-translate',
    method: 'POST',
    path: '/api/ai/translate',
    description: 'Translate article content between English and Bahasa Malaysia using Gemini. Translates both title and body. Cached in Redis for 30 days.',
    auth: 'Public',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Article title to translate' },
      { name: 'content', type: 'string', required: true, description: 'Article body to translate' },
      { name: 'slug', type: 'string', required: true, description: 'Article slug (cache key)' },
      { name: 'targetLang', type: 'string', required: true, description: 'Target language: "ms" (Malay) or "en" (English)' },
    ],
    curl: `curl -X POST "/api/ai/translate" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Hello World","content":"<p>Article body</p>","slug":"my-article","targetLang":"ms"}'`,
    tryUrl: null,
  },
  {
    id: 'ai-chat',
    method: 'POST',
    path: '/api/ai/chat',
    description: 'Ask questions about a specific article. AI responses are grounded to article content only — no hallucination. Streams response via ReadableStream.',
    auth: 'Public',
    params: [
      { name: 'question', type: 'string', required: true, description: 'User question about the article' },
      { name: 'content', type: 'string', required: true, description: 'Article body for grounding' },
      { name: 'title', type: 'string', required: true, description: 'Article title for context' },
    ],
    curl: `curl -X POST "/api/ai/chat" \\
  -H "Content-Type: application/json" \\
  -d '{"question":"What is the main point?","content":"<p>Article body</p>","title":"Article Title"}'`,
    tryUrl: null,
  },
  {
    id: 'ai-digest',
    method: 'POST',
    path: '/api/ai/digest',
    description: 'Generate a personalized AI morning digest based on reader interests and recent articles. Cached by interest profile for 7 days.',
    auth: 'Public',
    params: [
      { name: 'interests', type: 'string[]', required: true, description: 'Array of reader interest categories' },
      { name: 'articles', type: 'object[]', required: true, description: 'Array of recent articles with title, excerpt, category, slug' },
    ],
    curl: `curl -X POST "/api/ai/digest" \\
  -H "Content-Type: application/json" \\
  -d '{"interests":["technology","science"],"articles":[{"title":"...","excerpt":"...","category":"tech","slug":"..."}]}'`,
    tryUrl: null,
  },
  {
    id: 'ai-suggest',
    method: 'POST',
    path: '/api/ai/suggest',
    description: 'AI editor tools for article optimization. Returns alternative headlines with engagement scores, SEO suggestions, auto-generated tags, and excerpt suggestion. For editorial dashboards.',
    auth: 'Public',
    params: [
      { name: 'title', type: 'string', required: true, description: 'Current article headline' },
      { name: 'content', type: 'string', required: true, description: 'Article body content' },
      { name: 'slug', type: 'string', required: true, description: 'Article slug (cache key)' },
    ],
    curl: `curl -X POST "/api/ai/suggest" \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Original Headline","content":"<p>Article body</p>","slug":"my-article"}'`,
    tryUrl: null,
  },
]

const METHOD_COLORS = {
  GET: 'success' as const,
  POST: 'accent' as const,
  PUT: 'warning' as const,
  DELETE: 'danger' as const,
}

export default function ApiDocsPage() {
  const [selected, setSelected] = useState(ENDPOINTS[0].id)
  const [response, setResponse] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)

  const endpoint = ENDPOINTS.find((e) => e.id === selected)!

  const handleTryIt = async () => {
    if (!endpoint.tryUrl) {
      setResponse(JSON.stringify({ message: 'This endpoint requires authentication. Use the curl example.' }, null, 2))
      return
    }

    setLoading(true)
    const start = performance.now()

    try {
      const res = await fetch(endpoint.tryUrl)
      const data = await res.json()
      setLatency(Math.round(performance.now() - start))
      setResponse(JSON.stringify(data, null, 2))
    } catch {
      setLatency(null)
      setResponse(JSON.stringify({ error: 'Request failed. Is the API running?' }, null, 2))
    }

    setLoading(false)
  }

  return (
    <>
      <TechBar
        badges={[
          { label: 'SSG', tooltip: 'Static Site Generated at build time', variant: 'accent' },
          { label: 'REST + GraphQL', tooltip: 'Both REST and GraphQL APIs available' },
          { label: 'Live playground', tooltip: 'Try real API calls from this page' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
          API Reference
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] mb-6">
          Interactive documentation for The Adam News API — 14 endpoints including 5 AI-powered routes. Multi-model AI with Groq LLaMA 3.3 70B + Gemini 2.5 Flash, automatic failover, and Redis caching.
        </p>

        {/* Mobile endpoint selector */}
        <div className="lg:hidden mb-4">
          <div className="flex flex-wrap gap-2">
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  setSelected(ep.id)
                  setResponse(null)
                }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-xs border transition-colors',
                  selected === ep.id
                    ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                    : 'text-[var(--muted)] border-[var(--border)] hover:bg-[var(--surface)]'
                )}
              >
                <Badge
                  variant={METHOD_COLORS[ep.method as keyof typeof METHOD_COLORS]}
                  size="sm"
                >
                  {ep.method}
                </Badge>
                <span>{ep.path.split('/').pop()}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[200px,1fr,1fr] gap-6">
          {/* Left nav — desktop only */}
          <nav className="hidden lg:block space-y-1">
            {ENDPOINTS.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  setSelected(ep.id)
                  setResponse(null)
                }}
                className={cn(
                  'flex items-center gap-2 w-full px-3 h-10 rounded text-sm text-left transition-colors',
                  selected === ep.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'text-[var(--muted)] hover:bg-[var(--surface)]'
                )}
              >
                <Badge
                  variant={METHOD_COLORS[ep.method as keyof typeof METHOD_COLORS]}
                  size="sm"
                >
                  {ep.method}
                </Badge>
                <span className="truncate">{ep.path.split('/').pop()}</span>
              </button>
            ))}
          </nav>

          {/* Center: endpoint detail */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge
                variant={METHOD_COLORS[endpoint.method as keyof typeof METHOD_COLORS]}
                size="md"
              >
                {endpoint.method}
              </Badge>
              <code className="text-sm font-mono text-[var(--text)] break-all">
                {endpoint.path}
              </code>
            </div>

            <p className="text-sm text-[var(--muted)]">{endpoint.description}</p>

            <div className="text-sm">
              <span className="font-medium text-[var(--text)]">Auth: </span>
              <span className="text-[var(--muted)]">{endpoint.auth}</span>
            </div>

            {/* Parameters — card list on mobile, table on desktop */}
            <Card>
              <CardContent>
                <h3 className="font-semibold text-[var(--text)] mb-3 text-sm">
                  Parameters
                </h3>

                {/* Desktop table */}
                <div className="hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="pb-2 text-left font-medium text-[var(--muted)]">Name</th>
                        <th className="pb-2 text-left font-medium text-[var(--muted)]">Type</th>
                        <th className="pb-2 text-left font-medium text-[var(--muted)]">Required</th>
                        <th className="pb-2 text-left font-medium text-[var(--muted)]">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.params.map((param) => (
                        <tr key={param.name} className="border-b border-[var(--border)]">
                          <td className="py-2 font-mono text-xs text-[var(--text)]">{param.name}</td>
                          <td className="py-2 text-[var(--muted)]">{param.type}</td>
                          <td className="py-2">
                            {param.required ? <Badge variant="danger" size="sm">Yes</Badge> : <Badge size="sm">No</Badge>}
                          </td>
                          <td className="py-2 text-[var(--muted)]">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile stacked cards */}
                <div className="sm:hidden space-y-3">
                  {endpoint.params.map((param) => (
                    <div key={param.name} className="border-b border-[var(--border)] pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-xs font-mono text-[var(--text)] break-all">{param.name}</code>
                        <span className="text-xs text-[var(--muted)]">({param.type})</span>
                        {param.required && <Badge variant="danger" size="sm">Required</Badge>}
                      </div>
                      <p className="text-xs text-[var(--muted)]">{param.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Curl example */}
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-2 text-sm">Example</h3>
              <pre className="bg-[var(--surface-2)] rounded p-3 text-[0.65rem] sm:text-xs font-mono text-[var(--text)] overflow-x-auto whitespace-pre-wrap break-all">
                {endpoint.curl}
              </pre>
            </div>

            <Button onClick={handleTryIt} loading={loading}>
              &#9654; Try it
            </Button>
          </div>

          {/* Right: response panel */}
          <div>
            <Card className="lg:sticky lg:top-20">
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text)] text-sm">Response</h3>
                  {latency !== null && (
                    <Badge variant="success">200 OK &middot; {latency}ms</Badge>
                  )}
                </div>
                <pre className="bg-[var(--surface-2)] rounded p-3 text-[0.65rem] sm:text-xs font-mono text-[var(--text)] overflow-auto max-h-[400px] lg:max-h-[500px] whitespace-pre-wrap break-all">
                  {response || '// Click "Try it" to see the response'}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        <ArchCallout
          apiCall="Strapi REST API + Next.js API Routes + Multi-Model AI (Groq + Gemini)"
          caching="GET endpoints: Redis cache-aside. AI endpoints: Redis cache (7-30 day TTL). Mutations: no cache."
          auth="Public (read + AI), Bearer token (write), Webhook secret (revalidate), Stripe signature (webhooks)"
          rationale="API Docs page is SSG — built once at deploy. Live playground makes real HTTP requests. AI routes include self-imposed rate limiting (8 req/min)."
          className="mt-8"
        />
      </div>
    </>
  )
}

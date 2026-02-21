'use client'

import { useState } from 'react'
import TechBar from '@/components/layout/TechBar'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ArchCallout from '@/components/shared/ArchCallout'
import { cn } from '@/lib/utils'

const STRAPI_BASE = 'http://localhost:1337'

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
    id: 'checkout',
    method: 'POST',
    path: '/api/stripe/checkout',
    description: 'Create a Stripe Checkout session for subscription plans. Requires an active NextAuth session.',
    auth: 'Authenticated (NextAuth session)',
    params: [
      { name: 'priceId', type: 'string', required: true, description: 'Stripe Price ID from plan configuration' },
    ],
    curl: `curl -X POST "http://localhost:3000/api/stripe/checkout" \\
  -H "Content-Type: application/json" \\
  -H "Cookie: next-auth.session-token=..." \\
  -d '{"priceId":"price_standard_monthly"}'`,
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
    curl: `curl -X POST "http://localhost:3000/api/revalidate" \\
  -H "x-webhook-secret: your_secret" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"article","entry":{"slug":"my-article"}}'`,
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
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
          API Reference
        </h1>
        <p className="text-[var(--muted)] mb-6">
          Interactive documentation for The Adam News API. Powered by Strapi CMS and Next.js.
        </p>

        <div className="grid lg:grid-cols-[200px,1fr,1fr] gap-6">
          {/* Left nav */}
          <nav className="space-y-1">
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
                  variant={
                    METHOD_COLORS[ep.method as keyof typeof METHOD_COLORS]
                  }
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
            <div className="flex items-center gap-3">
              <Badge
                variant={
                  METHOD_COLORS[
                    endpoint.method as keyof typeof METHOD_COLORS
                  ]
                }
                size="md"
              >
                {endpoint.method}
              </Badge>
              <code className="text-sm font-mono text-[var(--text)]">
                {endpoint.path}
              </code>
            </div>

            <p className="text-[var(--muted)]">{endpoint.description}</p>

            <div className="text-sm">
              <span className="font-medium text-[var(--text)]">Auth: </span>
              <span className="text-[var(--muted)]">{endpoint.auth}</span>
            </div>

            {/* Parameters table */}
            <Card>
              <CardContent>
                <h3 className="font-semibold text-[var(--text)] mb-3 text-sm">
                  Parameters
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="pb-2 text-left font-medium text-[var(--muted)]">
                        Name
                      </th>
                      <th className="pb-2 text-left font-medium text-[var(--muted)]">
                        Type
                      </th>
                      <th className="pb-2 text-left font-medium text-[var(--muted)]">
                        Required
                      </th>
                      <th className="pb-2 text-left font-medium text-[var(--muted)]">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((param) => (
                      <tr
                        key={param.name}
                        className="border-b border-[var(--border)]"
                      >
                        <td className="py-2 font-mono text-[var(--text)]">
                          {param.name}
                        </td>
                        <td className="py-2 text-[var(--muted)]">
                          {param.type}
                        </td>
                        <td className="py-2">
                          {param.required ? (
                            <Badge variant="danger">Yes</Badge>
                          ) : (
                            <Badge>No</Badge>
                          )}
                        </td>
                        <td className="py-2 text-[var(--muted)]">
                          {param.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Curl example */}
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-2 text-sm">
                Example
              </h3>
              <pre className="bg-[var(--surface-2)] rounded p-3 text-xs font-mono text-[var(--text)] overflow-x-auto">
                {endpoint.curl}
              </pre>
            </div>

            <Button onClick={handleTryIt} loading={loading}>
              &#9654; Try it
            </Button>
          </div>

          {/* Right: response panel */}
          <div>
            <Card className="sticky top-20">
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text)] text-sm">
                    Response
                  </h3>
                  {latency !== null && (
                    <Badge variant="success">
                      200 OK &middot; {latency}ms
                    </Badge>
                  )}
                </div>
                <pre className="bg-[var(--surface-2)] rounded p-3 text-xs font-mono text-[var(--text)] overflow-auto max-h-[500px]">
                  {response || '// Click "Try it" to see the response'}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>

        <ArchCallout
          apiCall="Strapi REST API + Next.js API Routes"
          caching="GET endpoints: Redis cache-aside. Mutations: no cache."
          auth="Public (read), Bearer token (write), Webhook secret (revalidate)"
          rationale="API Docs page is SSG — built once at deploy. Live playground makes real HTTP requests."
          className="mt-8"
        />
      </div>
    </>
  )
}

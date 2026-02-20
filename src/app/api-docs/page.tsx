'use client'

import { useState } from 'react'
import TechBar from '@/components/layout/TechBar'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ArchCallout from '@/components/shared/ArchCallout'
import { cn } from '@/lib/utils'

const ENDPOINTS = [
  {
    id: 'articles',
    method: 'GET',
    path: '/api/v1/articles',
    description: 'List all published articles with pagination. Redis cached.',
    auth: 'Public',
    params: [
      { name: 'page', type: 'number', required: false, description: 'Page number (default: 1)' },
      { name: 'pageSize', type: 'number', required: false, description: 'Items per page (default: 10)' },
      { name: 'category', type: 'string', required: false, description: 'Filter by category slug' },
    ],
    curl: `curl -X GET "http://localhost:3000/api/v1/articles?page=1&pageSize=10"`,
    tryUrl: '/api/v1/articles?page=1&pageSize=5',
  },
  {
    id: 'auth',
    method: 'POST',
    path: '/api/v1/auth/login',
    description: 'Authenticate user and receive JWT token.',
    auth: 'Public',
    params: [
      { name: 'email', type: 'string', required: true, description: 'User email address' },
      { name: 'password', type: 'string', required: true, description: 'User password' },
    ],
    curl: `curl -X POST "http://localhost:3000/api/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@AdamNews.com","password":"demo1234"}'`,
    tryUrl: null,
  },
  {
    id: 'subscribe',
    method: 'POST',
    path: '/api/v1/subscribe',
    description: 'Create Stripe Checkout session for subscription.',
    auth: 'Bearer token',
    params: [
      { name: 'priceId', type: 'string', required: true, description: 'Stripe Price ID' },
    ],
    curl: `curl -X POST "http://localhost:3000/api/v1/subscribe" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"priceId":"price_standard_monthly"}'`,
    tryUrl: null,
  },
  {
    id: 'graphql',
    method: 'POST',
    path: '/graphql',
    description: 'GraphQL endpoint for complex queries (Strapi).',
    auth: 'Public / Bearer token',
    params: [
      { name: 'query', type: 'string', required: true, description: 'GraphQL query string' },
      { name: 'variables', type: 'object', required: false, description: 'Query variables' },
    ],
    curl: `curl -X POST "http://localhost:1337/graphql" \\
  -H "Content-Type: application/json" \\
  -d '{"query":"{ articles { data { id attributes { title slug } } } }"}'`,
    tryUrl: null,
  },
  {
    id: 'revalidate',
    method: 'POST',
    path: '/api/v1/cache/revalidate',
    description: 'Trigger ISR revalidation for a specific path or tag.',
    auth: 'Webhook secret',
    params: [
      { name: 'slug', type: 'string', required: false, description: 'Article slug to revalidate' },
      { name: 'tag', type: 'string', required: false, description: 'Cache tag to invalidate' },
    ],
    curl: `curl -X POST "http://localhost:3000/api/v1/cache/revalidate" \\
  -H "x-webhook-secret: your_secret" \\
  -d '{"slug":"my-article"}'`,
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
        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
          API Reference
        </h1>
        <p className="text-[var(--muted)] mb-6">
          Interactive documentation for the AdamNews API.
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

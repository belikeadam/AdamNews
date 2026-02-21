import { Metadata } from 'next'
import Link from 'next/link'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'Technical architecture and stack overview of The Adam News platform.',
}

/* ─── data ────────────────────────────────────────────────────────── */

const STACK = [
  {
    layer: 'Frontend',
    tech: 'Next.js 16',
    detail: 'App Router, React 19, TypeScript 5, Turbopack',
    badge: 'SSR / ISR',
    badgeVariant: 'accent' as const,
  },
  {
    layer: 'Styling',
    tech: 'Tailwind CSS v4',
    detail: 'CSS variables, dark mode, Playfair Display + Inter fonts',
    badge: 'Utility-first',
    badgeVariant: 'success' as const,
  },
  {
    layer: 'CMS',
    tech: 'Strapi v4',
    detail: 'Headless CMS, REST API, webhook lifecycle events',
    badge: 'Headless',
    badgeVariant: 'warning' as const,
  },
  {
    layer: 'Auth',
    tech: 'NextAuth v5',
    detail: 'JWT sessions, Credentials + Google OAuth providers',
    badge: 'JWT',
    badgeVariant: 'accent' as const,
  },
  {
    layer: 'Payments',
    tech: 'Stripe',
    detail: 'Checkout Sessions, subscriptions, webhook signature verification',
    badge: 'Subscriptions',
    badgeVariant: 'success' as const,
  },
  {
    layer: 'Cache',
    tech: 'Upstash Redis',
    detail: 'Cache-aside pattern for API responses, rate limiting',
    badge: 'Serverless',
    badgeVariant: 'warning' as const,
  },
  {
    layer: 'AI',
    tech: 'Groq LLaMA 3.3 70B + Gemini Flash',
    detail: 'Multi-model router with task-based selection, auto-failover, and Redis caching',
    badge: 'RM 0 cost',
    badgeVariant: 'success' as const,
  },
  {
    layer: 'Testing',
    tech: 'Vitest + Playwright',
    detail: '63 tests — 41 unit + 22 E2E (Desktop + Mobile Chrome)',
    badge: '63 passing',
    badgeVariant: 'success' as const,
  },
  {
    layer: 'Hosting',
    tech: 'Vercel + Railway',
    detail: 'Vercel (frontend, edge), Railway (Strapi, PostgreSQL)',
    badge: 'Cloud',
    badgeVariant: 'accent' as const,
  },
]

const DATA_FLOW = [
  { step: '1', label: 'Strapi CMS', desc: 'Author creates/edits article in admin panel' },
  { step: '2', label: 'Webhook', desc: 'Strapi fires lifecycle event to Next.js /api/revalidate' },
  { step: '3', label: 'ISR', desc: 'Next.js revalidates cached pages via revalidateTag()' },
  { step: '4', label: 'CDN', desc: 'Vercel serves updated page from edge, globally in ~50ms' },
]

const PAGES = [
  { route: '/', description: 'Homepage — hero carousel, category grid, trending', rendering: 'ISR' },
  { route: '/articles/[slug]', description: 'Article detail — SEO meta, JSON-LD, paywall', rendering: 'ISR' },
  { route: '/search', description: 'Full-text search with category filters', rendering: 'CSR' },
  { route: '/plans', description: 'Subscription plans with Stripe checkout', rendering: 'SSG' },
  { route: '/account', description: 'User profile, plan status, post-checkout', rendering: 'CSR' },
  { route: '/dashboard', description: 'Admin — analytics, posts, AI editor tools', rendering: 'CSR' },
  { route: '/digest', description: 'AI morning briefing — personalised by reading history', rendering: 'CSR' },
  { route: '/api-docs', description: 'Interactive API playground', rendering: 'SSG' },
  { route: '/login', description: 'Auth — demo buttons, OAuth, credentials', rendering: 'SSG' },
]

const API_ROUTES = [
  { method: 'GET', path: '/api/articles', auth: 'Public', purpose: 'Proxied Strapi article list' },
  { method: 'GET', path: '/api/categories', auth: 'Public', purpose: 'Category list' },
  { method: 'GET', path: '/api/authors', auth: 'Public', purpose: 'Author list' },
  { method: 'POST', path: '/api/revalidate', auth: 'Webhook secret', purpose: 'ISR cache invalidation' },
  { method: 'POST', path: '/api/stripe/checkout', auth: 'NextAuth session', purpose: 'Create Stripe Checkout' },
  { method: 'POST', path: '/api/stripe/webhook', auth: 'Stripe signature', purpose: 'Subscription lifecycle' },
  { method: 'POST', path: '/api/articles/[slug]/views', auth: 'Public', purpose: 'View counter increment' },
  { method: 'POST', path: '/api/analytics', auth: 'Public', purpose: 'Scroll depth / read time beacon' },
  { method: 'GET', path: '/api/health', auth: 'Public', purpose: 'System health + dependency checks' },
  { method: 'POST', path: '/api/ai/analyze', auth: 'Rate-limited', purpose: 'AI article analysis (summary, sentiment, entities)' },
  { method: 'POST', path: '/api/ai/translate', auth: 'Rate-limited', purpose: 'Translate article (EN ↔ BM)' },
  { method: 'POST', path: '/api/ai/chat', auth: 'Rate-limited', purpose: 'Ask questions about an article' },
  { method: 'POST', path: '/api/ai/digest', auth: 'Rate-limited', purpose: 'Personalised morning digest' },
  { method: 'POST', path: '/api/ai/suggest', auth: 'Rate-limited', purpose: 'AI editor tools (headlines, SEO, tags)' },
]

const KEY_PATTERNS = [
  {
    title: 'Incremental Static Regeneration',
    desc: 'Pages are statically generated at build time and revalidated on-demand when content changes in Strapi. Tag-based invalidation ensures only affected pages are refreshed.',
    code: 'revalidateTag("articles", "default")',
  },
  {
    title: 'JWT Session + Plan Gating',
    desc: 'NextAuth JWT stores user role and plan. Premium articles check session.user.plan server-side. Plan upgrades via session.update() without re-login.',
    code: 'const hasAccess = !article.premium || plan !== "free"',
  },
  {
    title: 'Stripe Webhook Verification',
    desc: 'Webhook handler reads raw body via request.text() (not .json()) to preserve the payload for Stripe signature verification. Handles checkout, subscription changes, and payment failures.',
    code: 'stripe.webhooks.constructEvent(body, signature, secret)',
  },
  {
    title: 'Cache-Aside with Upstash Redis',
    desc: 'API responses are cached in Redis with TTL. Cache miss → fetch from Strapi → store in Redis. Webhook-triggered revalidation also invalidates Redis keys.',
    code: 'const cached = await redis.get(key) ?? await fetchAndCache(key)',
  },
  {
    title: 'Rate Limiting (Token Bucket)',
    desc: 'All API routes are rate-limited via Upstash Redis using a sliding-window token bucket. Fails open on Redis unavailability. Returns standard rate limit headers.',
    code: 'const rl = await rateLimit(`checkout:${ip}`, { limit: 10, windowSeconds: 60 })',
  },
  {
    title: 'Input Validation with Zod',
    desc: 'All API request bodies are validated against Zod schemas. Type-safe parsing with descriptive error messages. Schemas: CheckoutSchema, RevalidateSchema, AnalyticsSchema, AIAnalyzeSchema.',
    code: 'const { data, error } = await parseBody(request, CheckoutSchema)',
  },
  {
    title: 'Multi-Model AI Router',
    desc: 'Provider-agnostic AI router selects the best model per task (Groq for analysis/chat, Gemini for translation). Automatic failover, per-provider rate limits, and Redis caching (7-30d TTL).',
    code: 'const result = await callAICached("analyze", cacheKey, prompt, TTL, parseJSON)',
  },
]

/* ─── component ───────────────────────────────────────────────────── */

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 pb-20 md:pb-10">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-3"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Architecture
        </h1>
        <p className="text-[var(--muted)] max-w-2xl">
          A full-stack news platform built with modern web technologies.
          Server-rendered pages, headless CMS, real-time revalidation,
          subscription payments, AI-powered intelligence, and role-based access control.
        </p>
      </div>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[var(--accent)] text-white rounded-sm flex items-center justify-center text-xs font-bold">1</span>
          Tech Stack
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {STACK.map((item) => (
            <Card key={item.layer}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                    {item.layer}
                  </span>
                  <Badge variant={item.badgeVariant} size="sm">
                    {item.badge}
                  </Badge>
                </div>
                <p className="text-sm font-bold text-[var(--text)]">{item.tech}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Data Flow */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[var(--accent)] text-white rounded-sm flex items-center justify-center text-xs font-bold">2</span>
          Content Pipeline
        </h2>
        <Card>
          <CardContent className="py-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
              {DATA_FLOW.map((item, i) => (
                <div key={item.step} className="flex items-center gap-3 sm:flex-1">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text)]">{item.label}</p>
                      <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                    </div>
                  </div>
                  {i < DATA_FLOW.length - 1 && (
                    <span className="hidden sm:block text-[var(--muted)] mx-2 flex-shrink-0">&#8594;</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Pages & Rendering */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[var(--accent)] text-white rounded-sm flex items-center justify-center text-xs font-bold">3</span>
          Pages &amp; Rendering Strategy
        </h2>
        <Card>
          <CardContent>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Route</th>
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Description</th>
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Rendering</th>
                  </tr>
                </thead>
                <tbody>
                  {PAGES.map((p) => (
                    <tr key={p.route} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 font-mono text-xs text-[var(--text)]">{p.route}</td>
                      <td className="py-2.5 text-[var(--muted)]">{p.description}</td>
                      <td className="py-2.5">
                        <Badge
                          variant={p.rendering === 'ISR' ? 'accent' : p.rendering === 'SSG' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {p.rendering}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile stacked */}
            <div className="sm:hidden space-y-3">
              {PAGES.map((p) => (
                <div key={p.route} className="border-b border-[var(--border)] pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-xs font-mono text-[var(--text)]">{p.route}</code>
                    <Badge
                      variant={p.rendering === 'ISR' ? 'accent' : p.rendering === 'SSG' ? 'success' : 'warning'}
                      size="sm"
                    >
                      {p.rendering}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{p.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* API Routes */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[var(--accent)] text-white rounded-sm flex items-center justify-center text-xs font-bold">4</span>
          API Routes
        </h2>
        <Card>
          <CardContent>
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Method</th>
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Path</th>
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Auth</th>
                    <th className="pb-2 text-left font-medium text-[var(--muted)]">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {API_ROUTES.map((r) => (
                    <tr key={r.path} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5">
                        <Badge variant={r.method === 'GET' ? 'success' : 'accent'} size="sm">
                          {r.method}
                        </Badge>
                      </td>
                      <td className="py-2.5 font-mono text-xs text-[var(--text)]">{r.path}</td>
                      <td className="py-2.5 text-xs text-[var(--muted)]">{r.auth}</td>
                      <td className="py-2.5 text-xs text-[var(--muted)]">{r.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-3">
              {API_ROUTES.map((r) => (
                <div key={r.path} className="border-b border-[var(--border)] pb-3 last:border-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={r.method === 'GET' ? 'success' : 'accent'} size="sm">
                      {r.method}
                    </Badge>
                    <code className="text-xs font-mono text-[var(--text)]">{r.path}</code>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{r.auth} — {r.purpose}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Key Patterns */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[var(--accent)] text-white rounded-sm flex items-center justify-center text-xs font-bold">5</span>
          Key Implementation Patterns
        </h2>
        <div className="space-y-3">
          {KEY_PATTERNS.map((p) => (
            <Card key={p.title}>
              <CardContent className="py-4">
                <p className="text-sm font-bold text-[var(--text)] mb-1">{p.title}</p>
                <p className="text-xs text-[var(--muted)] mb-2">{p.desc}</p>
                <pre className="bg-[var(--surface-2)] rounded px-3 py-2 text-xs font-mono text-[var(--text)] overflow-x-auto">
                  {p.code}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Project Structure */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-[var(--accent)] text-white rounded-sm flex items-center justify-center text-xs font-bold">6</span>
          Project Structure
        </h2>
        <Card>
          <CardContent>
            <pre className="text-xs font-mono text-[var(--muted)] leading-relaxed overflow-x-auto whitespace-pre">
{`src/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes (revalidate, stripe, analytics, ai)
│   │   └── ai/           # AI endpoints (analyze, translate, chat, digest, suggest)
│   ├── articles/[slug]/  # Article detail (ISR + SEO + AI features)
│   ├── dashboard/        # Admin panel (auth-gated + AI editor tools)
│   ├── digest/           # AI morning briefing (personalised)
│   ├── account/          # User profile + subscription
│   ├── plans/            # Pricing + Stripe checkout
│   ├── search/           # Full-text search
│   └── architecture/     # This page
├── components/
│   ├── layout/           # Navbar, Footer, MobileNav, TechBar
│   ├── reader/           # HeroCarousel, ArticleCard, CategoryFilter
│   ├── article/          # AI: InsightsPanel, LanguageToggle, AudioMode, Chat
│   ├── auth/             # LoginStepper, OAuthButton, DemoLoginButtons
│   ├── ui/               # Card, Badge, Button, Input (design system)
│   └── shared/           # ArchCallout, DemoBanner, ScrollToTop
├── lib/
│   ├── api/              # Strapi client, Stripe helpers
│   ├── ai/               # router.ts (AI Router), groq.ts, gemini.ts
│   ├── auth.ts           # NextAuth config + demo users
│   └── utils.ts          # cn(), formatDate, readTime, slugify
├── constants/            # meta, plans, nav
├── hooks/                # useAuth, useBookmarks, usePersonalization
├── types/                # Strapi, auth, AI types
└── __tests__/            # Vitest (41 unit) + Playwright (22 E2E)`}
            </pre>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/api-docs"
          className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          API Playground &#8594;
        </Link>
        <Link
          href="/login"
          className="px-5 py-2.5 border border-[var(--border)] text-[var(--text)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
        >
          Try the Demo &#8594;
        </Link>
        <a
          href="https://github.com/belikeadam/AdamNews"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 border border-[var(--border)] text-[var(--text)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
        >
          View Source &#8594;
        </a>
      </div>
    </div>
  )
}

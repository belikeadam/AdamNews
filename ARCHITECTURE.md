# The Adam News — Full Architecture Document

> A production-grade, full-stack news platform built as a Senior Full-Stack Developer portfolio project.
> This document serves as a complete technical and business reference — readable by developers, AI agents, and non-technical stakeholders.

**Live:** https://adam-news.vercel.app
**Source:** https://github.com/belikeadam/AdamNews
**CMS:** https://adamnews-production.up.railway.app/admin

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Frontend (Next.js)](#4-frontend-nextjs)
5. [Content Management (Strapi)](#5-content-management-strapi)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Payment System (Stripe)](#7-payment-system-stripe)
8. [Caching & Performance](#8-caching--performance)
9. [API Reference](#9-api-reference)
10. [Data Models](#10-data-models)
11. [Pages & Rendering Strategies](#11-pages--rendering-strategies)
12. [Component Library](#12-component-library)
13. [Design System](#13-design-system)
14. [Testing](#14-testing)
15. [CI/CD & Deployment](#15-cicd--deployment)
16. [Environment Variables](#16-environment-variables)
17. [Project Structure](#17-project-structure)
18. [Security](#18-security)
19. [Business Features](#19-business-features)
20. [Known Limitations & Production Roadmap](#20-known-limitations--production-roadmap)
21. [AI Intelligence Layer](#21-ai-intelligence-layer)

---

## 1. Executive Summary

### What It Is

The Adam News is a full-stack digital newspaper platform that demonstrates end-to-end proficiency in modern web development. It replicates the editorial experience of publications like The New York Times or The Guardian — with a headless CMS, subscription payments, role-based access control, and real-time content updates.

### What It Demonstrates

| Competency | Implementation |
|-----------|---------------|
| **Frontend Architecture** | Next.js 16 App Router, React 19, TypeScript, Server Components, ISR |
| **Backend / API Design** | RESTful API routes, webhook handlers, Strapi CMS integration |
| **Authentication** | NextAuth v5 with JWT sessions, OAuth (Google), credentials provider |
| **Payments** | Stripe Checkout, subscriptions, webhook lifecycle management |
| **Database / CMS** | Strapi v4 with PostgreSQL, structured content types, media handling |
| **Caching** | Redis (Upstash), ISR tag-based revalidation, cache-aside pattern |
| **DevOps** | Docker Compose (4 services), GitHub Actions CI, Vercel + Railway deploy |
| **AI Intelligence** | Google Gemini 2.5 Flash — article analysis, translation, chat, digest, editor tools |
| **Testing** | Vitest (41 unit tests) + Playwright (65 E2E tests across 5 suites) covering utils, API routes, rendering, AI features, navigation, mobile, and dashboard |
| **SEO** | Dynamic sitemap, robots.txt, OpenGraph, Twitter Cards, JSON-LD schema |
| **Design** | Tailwind CSS v4, dark mode, responsive, editorial typography (Playfair Display) |

### Key Metrics

- **67 articles** seeded with real tech news content (via Dev.to API)
- **6 categories** (Technology, Business, Finance, Lifestyle, Science, General)
- **40+ authors** with profiles and avatars
- **106 tests** passing (41 unit tests + 65 E2E tests) across 8 test suites
- **73+ URLs** in sitemap (6 static + 67 dynamic)
- **14 API routes** (4 GET, 10 POST) — including 5 AI endpoints and health check
- **6 AI features** powered by Google Gemini 2.5 Flash (free tier, RM 0 cost)
- **3 subscription plans** (Free, Standard RM9.99/mo, Premium RM19.99/mo)
- **Rate limiting** on all API routes via Upstash Redis (token bucket)
- **Input validation** on all API routes via Zod schemas
- **Structured logging** for production monitoring (JSON format)

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│                                                                  │
│  Next.js App (React 19)     ◄───── Tailwind CSS v4              │
│  ├── Server Components (ISR)       Dark mode, CSS variables      │
│  ├── Client Components (CSR)       Playfair Display + Inter      │
│  ├── Static Pages (SSG)                                          │
│  └── AI Components:                                              │
│      ├── AIInsightsPanel (article intelligence)                  │
│      ├── LanguageToggle (BM ↔ EN translation)                   │
│      ├── AudioMode (Web Speech API TTS)                          │
│      └── ArticleChat (ask article questions)                     │
└──────────┬──────────────────────────────────────────┬────────────┘
           │ fetch / API calls                        │ Stripe.js
           ▼                                          ▼
┌─────────────────────┐               ┌──────────────────────────┐
│   Vercel Edge CDN   │               │    Stripe                │
│   ├── SSR runtime   │               │    ├── Checkout Sessions │
│   ├── API routes    │               │    ├── Subscriptions     │
│   ├── ISR cache     │               │    └── Webhooks          │
│   ├── Static assets │               └──────────────────────────┘
│   └── AI API routes │
│       ├── /api/ai/analyze           ┌──────────────────────────┐
│       ├── /api/ai/translate         │   Google Gemini API      │
│       ├── /api/ai/chat      ◄──────►│   (Free Tier)            │
│       ├── /api/ai/digest            │   ├── gemini-2.5-flash   │
│       └── /api/ai/suggest           │   ├── 10 RPM, 250 RPD   │
│                                     │   └── Structured JSON    │
│                                     └──────────────────────────┘
└──────────┬──────────┘
           │ REST API
           ▼
┌─────────────────────┐       ┌──────────────────────┐
│   Strapi v4         │       │   Upstash Redis      │
│   (Railway)         │       │   (Serverless)       │
│   ├── Articles      │       │   ├── Cache-aside    │
│   ├── Categories    │       │   ├── TTL-based      │
│   ├── Authors       │       │   └── AI cache keys  │
│   ├── Media uploads │       └──────────────────────┘
│   └── Webhooks ─────┼──► POST /api/revalidate ──► ISR invalidation
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   PostgreSQL        │
│   (Railway)         │
└─────────────────────┘
```

### Content Pipeline (How an article goes from author to reader)

```
1. Author creates article in Strapi admin panel
                    │
2. Strapi fires webhook (entry.create / entry.publish)
                    │
3. POST /api/revalidate receives webhook with secret verification
                    │
4. Next.js calls revalidateTag('articles') + revalidatePath('/')
                    │
5. Next request to page → Vercel re-renders from fresh Strapi data
                    │
6. Updated page served from Vercel Edge CDN globally (~50ms)
```

---

## 3. Tech Stack

### Core Framework

| Technology | Version | Role |
|-----------|---------|------|
| **Next.js** | 16.1.6 | Full-stack React framework (App Router) |
| **React** | 19.2.3 | UI runtime with Server Components |
| **TypeScript** | 5.x | Type safety across entire codebase |
| **Tailwind CSS** | 4.x | Utility-first styling with CSS variables |
| **Turbopack** | Built-in | Dev server bundler (Next.js 16) |

### Backend Services

| Technology | Version | Role |
|-----------|---------|------|
| **Strapi** | 4.x | Headless CMS — content types, REST API, webhooks |
| **PostgreSQL** | 16 | Strapi database (via Railway) |
| **NextAuth** | 5.0.0-beta.30 | Authentication — JWT, OAuth, credentials |
| **Stripe** | 20.3.1 | Payment processing — subscriptions, webhooks |
| **Upstash Redis** | 1.36.2 | Serverless Redis — API caching, rate limiting |
| **Google Gemini** | 2.5 Flash | AI content analysis, translation, chat, digest, editor tools |
| **@google/genai** | latest | Official Google Generative AI SDK |
| **Web Speech API** | Browser-native | Text-to-speech for audio mode (zero cost) |

### Development & Testing

| Technology | Version | Role |
|-----------|---------|------|
| **Vitest** | 4.0.18 | Unit test runner |
| **Testing Library** | 16.3.2 | React component testing utilities |
| **jsdom** | 28.1.0 | Browser environment for tests |
| **ESLint** | 9.x | Code linting (Next.js config) |
| **Docker Compose** | — | Local development (4-service stack) |
| **GitHub Actions** | — | CI pipeline (type check, lint, test) |

### Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| **Frontend hosting** | Vercel | SSR, ISR, Edge CDN, auto-deploy from GitHub |
| **CMS hosting** | Railway | Strapi server + PostgreSQL |
| **Redis** | Upstash | Serverless Redis REST API |
| **Payments** | Stripe | Test mode subscriptions |
| **DNS / Domain** | Vercel | `adam-news.vercel.app` |

---

## 4. Frontend (Next.js)

### Rendering Strategies Used

| Strategy | Pages | How It Works |
|----------|-------|-------------|
| **ISR** (Incremental Static Regeneration) | Homepage, Article detail | Pre-rendered at build, revalidated every 60s OR on-demand via webhook |
| **SSG** (Static Site Generation) | Plans, Login, Architecture, Privacy, Terms, Contact, API Docs | Built once at deploy time, no server-side data |
| **CSR** (Client-Side Rendering) | Search, Account, Saved, Dashboard | `'use client'` — renders in browser, fetches data client-side |

### App Router Structure

Next.js 16 App Router uses file-system routing:

- `src/app/page.tsx` → `/`
- `src/app/articles/[slug]/page.tsx` → `/articles/any-slug`
- `src/app/api/revalidate/route.ts` → `POST /api/revalidate`
- `src/app/layout.tsx` → Wraps all pages (fonts, providers, navbar, footer)

### Key Frontend Patterns

**Server Components (default):** Pages like homepage and article detail fetch data server-side using `async` functions. Data never leaves the server. No client-side JavaScript bundle for data fetching.

**Client Components (`'use client'`):** Interactive pages (search, dashboard, account) use React hooks (`useState`, `useEffect`, `useSession`). Marked with `'use client'` directive at file top.

**Streaming with Suspense:** Navbar wrapped in `<Suspense>` to avoid blocking page render while categories load from Strapi.

**Image Optimization:** All images use `next/image` with `fill` layout and responsive `sizes` prop. Remote patterns configured for any HTTPS hostname (news article images come from various sources).

### Fonts

| Font | Use | Source |
|------|-----|--------|
| **Playfair Display** | Headlines, masthead, section titles | Google Fonts via `next/font` |
| **Inter** | Body text, UI elements, navigation | Google Fonts via `next/font` |

Both loaded with `display: 'swap'` for zero layout shift.

---

## 5. Content Management (Strapi)

### Content Types

**Article** — the core content type:

| Field | Type | Notes |
|-------|------|-------|
| `title` | Text | Required |
| `slug` | UID (from title) | URL-friendly, unique |
| `excerpt` | Text | Short summary for cards |
| `body` | Rich Text / Blocks | Full article content |
| `cover` | Media (single) | Cover image |
| `coverUrl` | Text | External cover URL (fallback) |
| `category` | Relation (→ Category) | Many-to-one |
| `author` | Relation (→ Author) | Many-to-one |
| `tags` | JSON | String array |
| `premium` | Boolean | Paywall flag |
| `trending` | Boolean | Featured in carousel |
| `views` | Integer | View counter (incremented via API) |
| `readTime` | Text | "5 min read" |
| `publishedAt` | DateTime | Publish date |

**Category:**

| Field | Type |
|-------|------|
| `name` | Text |
| `slug` | UID |
| `color` | Text (hex) |
| `description` | Text |

**Author:**

| Field | Type |
|-------|------|
| `name` | Text |
| `role` | Text |
| `bio` | Text |
| `avatar` | Media (single) |
| `email` | Email |

### Strapi REST API Client

Located at `src/lib/api/strapi.ts`. Core `fetchStrapi<T>()` function:

1. Constructs URL from `STRAPI_URL` (server) or `NEXT_PUBLIC_STRAPI_URL` (client)
2. Attaches `Authorization: Bearer {STRAPI_API_TOKEN}` header
3. Uses Next.js `fetch` with `next.revalidate` (ISR TTL) and `next.tags` (tag-based invalidation)
4. On 401/403 with token: retries without token (graceful fallback)
5. Throws on other non-OK responses

**Exported functions:**

| Function | Cache Tags | TTL | Purpose |
|----------|-----------|-----|---------|
| `getArticles(params?)` | `['articles']` | 60s | Paginated list, supports category/premium filters |
| `getArticleBySlug(slug)` | `['article-{slug}']` | 60s | Single article with all relations |
| `getTrendingArticles()` | `['articles', 'trending']` | 60s | Top 5 trending for carousel |
| `getCategories()` | `['categories']` | 3600s | All categories sorted A-Z |
| `getAuthors()` | `['authors']` | 3600s | All authors with avatars |
| `getRelatedArticles(cat, exclude)` | `['articles']` | 60s | 3 articles from same category |

### Webhook Integration

Strapi fires lifecycle events (`entry.create`, `entry.update`, `entry.delete`, `entry.publish`, `entry.unpublish`) to `POST /api/revalidate`. The endpoint:

1. Verifies `x-webhook-secret` header
2. Extracts `slug` from webhook payload
3. Calls `revalidatePath('/articles/{slug}')` for the specific article
4. Calls `revalidateTag('articles')` to refresh listing pages
5. Always revalidates homepage (`revalidatePath('/')`)

---

## 6. Authentication & Authorization

### Architecture

```
NextAuth v5 (Auth.js)
├── Providers
│   ├── Credentials (email/password — demo users)
│   └── Google OAuth
├── Session Strategy: JWT (stateless)
├── Middleware: protects /dashboard/* and /api/stripe/checkout
└── Callbacks: jwt → session (propagates role + plan)
```

### Demo Users (Credentials Provider)

| Email | Password | Role | Plan | Access |
|-------|----------|------|------|--------|
| `admin@AdamNews.com` | `demo1234` | `admin` | `premium` | Dashboard, CMS editor, all content |
| `reader@AdamNews.com` | `demo1234` | `user` | `free` | 5 articles/month, can upgrade via Stripe |

Passwords stored as bcrypt hashes. Authentication via `bcrypt.compare()`.

### JWT Token Structure

```typescript
{
  id: string       // user ID
  email: string    // user email
  name: string     // display name
  role: 'admin' | 'user'
  plan: 'free' | 'standard' | 'premium'
  iat: number      // issued at
  exp: number      // expiration
}
```

### Authorization Matrix

| Resource | Free | Standard | Premium | Admin |
|----------|------|----------|---------|-------|
| Browse articles | 5/month | Unlimited | Unlimited | Unlimited |
| Premium articles | Blocked (paywall) | Full access | Full access | Full access |
| AI on free articles | Yes | Yes | Yes | Yes |
| AI on premium articles | Locked (upgrade CTA) | Full access | Full access | Full access |
| Bookmarks | Yes | Yes | Yes | Yes |
| Dashboard | No | No | No | Yes |
| CMS Editor | No | No | No | Yes |
| Stripe Checkout | Yes (upgrade) | Yes (change) | Yes (change) | Yes |

### Plan Upgrade Flow

```
1. User clicks "Start Standard" on /plans
2. POST /api/stripe/checkout → creates Stripe Checkout Session
3. User completes payment on Stripe hosted page
4. Stripe redirects to /account?checkout=success&plan=standard
5. Account page calls session.update({ plan: 'standard' })
6. JWT callback detects trigger === 'update', sets token.plan
7. All subsequent requests see upgraded plan — no re-login needed
```

### Middleware

File: `src/proxy.ts` (registered as Next.js middleware)

```typescript
matcher: ['/dashboard/:path*', '/api/stripe/checkout']
```

- `/dashboard/*` — requires `role === 'admin'`, else redirect to `/`
- `/api/stripe/checkout` — requires authenticated session (any role)
- All other routes — public (no middleware intercept)

---

## 7. Payment System (Stripe)

### Subscription Plans

| Plan | Monthly | Annual | Stripe Price IDs |
|------|---------|--------|-----------------|
| **Reader** | RM0 | RM0 | No Stripe integration (free tier) |
| **Standard** | RM9.99 | RM7.99/mo | `STRIPE_STANDARD_PRICE_ID` |
| **Premium** | RM19.99 | RM15.99/mo | `STRIPE_PREMIUM_PRICE_ID` |

Currency: Malaysian Ringgit (MYR). Currently in Stripe **test mode**.

### Checkout Flow

```
Browser                    Next.js API              Stripe
  │                           │                       │
  │ POST /api/stripe/checkout │                       │
  │ {planId, billing}         │                       │
  │──────────────────────────►│                       │
  │                           │ stripe.checkout.      │
  │                           │ sessions.create()     │
  │                           │──────────────────────►│
  │                           │     session.url       │
  │                           │◄──────────────────────│
  │    { url }                │                       │
  │◄──────────────────────────│                       │
  │                           │                       │
  │ redirect to Stripe        │                       │
  │──────────────────────────────────────────────────►│
  │                           │                       │
  │ User pays (test card 4242...)                     │
  │                           │                       │
  │◄────── redirect to /account?checkout=success      │
  │                           │                       │
  │                           │ POST /api/stripe/     │
  │                           │ webhook               │
  │                           │◄──────────────────────│
  │                           │ verify signature      │
  │                           │ log subscription      │
  │                           │ {received: true}      │
  │                           │──────────────────────►│
```

### Webhook Events Handled

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Log user + subscription ID, resolve plan from price ID |
| `customer.subscription.updated` | Log status change (active, past_due, unpaid) |
| `customer.subscription.deleted` | Log cancellation (stub: downgrade to free) |
| `invoice.payment_failed` | Log failure + customer email (stub: send notification) |

**Critical implementation detail:** Webhook handler reads body with `request.text()` (not `.json()`) to preserve raw bytes for HMAC signature verification.

### Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | 3D Secure authentication required |

---

## 8. Caching & Performance

### Three-Layer Caching Strategy

```
Layer 1: Vercel Edge CDN (ISR)
├── Static pages cached globally
├── Tag-based invalidation via revalidateTag()
└── TTL: 60s articles, 3600s categories

Layer 2: Upstash Redis (API cache)
├── Cache-aside pattern
├── TTL: configurable per key
└── Graceful fallback on Redis failure

Layer 3: Next.js fetch() cache (built-in)
├── Automatic deduplication within request
├── next.revalidate option
└── next.tags for invalidation
```

### Redis Cache-Aside Pattern

```typescript
// src/lib/redis.ts
async function getCached<T>(key, fetcher, ttlSeconds = 60) {
  const cached = await redis.get(key)    // Try cache first
  if (cached) return { data: cached, cached: true }

  const data = await fetcher()           // Cache miss → fetch
  await redis.set(key, data, { ex: ttlSeconds })  // Store in cache
  return { data, cached: false }
}
```

On Redis failure: silently falls through to direct Strapi fetch. No error thrown.

### Rate Limiting (Token Bucket via Redis)

```typescript
// src/lib/rate-limit.ts
async function rateLimit(identifier, { limit = 60, windowSeconds = 60 }) {
  const windowId = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `rl:${identifier}:${windowId}`
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, windowSeconds)
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}
```

| Endpoint | Limit | Window | Strategy |
|----------|-------|--------|----------|
| `/api/stripe/checkout` | 10 req | 60s | Per IP — prevents checkout abuse |
| `/api/stripe/webhook` | 100 req | 60s | Per IP — accommodates Stripe batching |
| `/api/articles/[slug]/views` | 5 req | 60s | Per IP+slug — prevents view inflation |
| `/api/revalidate` | 30 req | 60s | Per IP — protects cache invalidation |
| `/api/analytics` | 30 req | 60s | Per IP — prevents event flooding |

On Redis failure: **fail-open** (allows request through). Rate limit headers included in all responses:
`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` (on 429).

### Cache Key Structure

| Key Pattern | TTL | Data |
|------------|-----|------|
| `articles:page:{n}` | 60s | Paginated article list |
| `article:{slug}` | 60s | Single article |
| `categories` | 3600s | Category list |
| `articles:trending` | 60s | Trending articles |
| `ai:analysis:{slug}` | 604,800s (7d) | AI article intelligence JSON |
| `ai:translate:{slug}:{lang}` | 2,592,000s (30d) | Translated title + content |
| `ai:chat:{slug}:{questionHash}` | 86,400s (24h) | Chat response |
| `ai:digest:{categories}:{dateHour}` | 21,600s (6h) | Shared morning digest |
| `ai:suggest:{slug}` | 604,800s (7d) | Editor suggestions |
| `rl:gemini:{minute}` | 65s | Gemini rate limit counter |

### ISR Revalidation Triggers

| Trigger | What Happens |
|---------|-------------|
| TTL expiry (60s) | Next request triggers background re-render |
| Strapi webhook | `revalidateTag()` + `revalidatePath()` → immediate invalidation |
| Manual (dashboard editor) | POST to `/api/revalidate` with slug → targeted invalidation |

---

## 9. API Reference

### Strapi CMS Endpoints (Proxied)

These are Strapi REST endpoints exposed through the CMS:

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/articles` | Public | Paginated articles with filters and sorting |
| `GET` | `/api/categories` | Public | All categories sorted alphabetically |
| `GET` | `/api/authors` | Public | All authors with avatar media |

**Query parameters** (Strapi v4 syntax):
- `populate=*` — include all relations
- `pagination[page]=1&pagination[pageSize]=25`
- `filters[category][slug][$eq]=technology`
- `filters[premium][$eq]=true`
- `sort=publishedAt:desc`

### Next.js API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/revalidate` | `x-webhook-secret` header | ISR cache invalidation (Strapi webhook target) |
| `POST` | `/api/stripe/checkout` | NextAuth session | Create Stripe Checkout Session |
| `POST` | `/api/stripe/webhook` | Stripe signature | Handle subscription lifecycle events |
| `POST` | `/api/articles/[slug]/views` | Public | Increment article view counter |
| `POST` | `/api/analytics` | Public | Track scroll depth and read time |
| `GET` | `/api/health` | Public | System health check (Strapi + Redis status) |
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth | Authentication endpoints (CSRF, session, callback, signout) |
| `POST` | `/api/ai/analyze` | Content-gated + rate-limited | AI article analysis — summary, sentiment, entities, fact-check |
| `POST` | `/api/ai/translate` | Content-gated + rate-limited | Translate article between English and Bahasa Malaysia |
| `POST` | `/api/ai/chat` | Content-gated + rate-limited | Ask questions about an article (grounded, no hallucination) |
| `POST` | `/api/ai/digest` | Public (rate-limited) | Generate personalized morning digest from reading interests |
| `POST` | `/api/ai/suggest` | Admin (rate-limited) | AI editor tools — headline alternatives, SEO tips, auto-tags |

**All POST routes** include:
- **Rate limiting** via Upstash Redis (token bucket algorithm, fail-open)
- **Input validation** via Zod schemas (type-safe request parsing)
- **Structured logging** via JSON logger (production-ready for ELK/Datadog/CloudWatch)
- **Rate limit headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

### GraphQL (Available but not primary)

Strapi also exposes a GraphQL endpoint at `/graphql`. A client exists at `src/lib/api/graphql.ts` with pre-built queries for articles and article-by-slug. Not used in production pages (REST is primary).

---

## 10. Data Models

### TypeScript Type Definitions

```typescript
// User types
type UserRole = 'admin' | 'user'
type UserPlan = 'free' | 'standard' | 'premium'

// Strapi generic wrappers
interface StrapiEntry<T> { id: number; attributes: T }
interface StrapiCollectionResponse<T> {
  data: StrapiEntry<T>[]
  meta: { pagination: { page, pageSize, pageCount, total } }
}

// Article
interface ArticleAttributes {
  title: string
  slug: string
  excerpt: string | null
  body: unknown                    // Rich text blocks or markdown
  cover: StrapiMediaField          // { data: { id, attributes: { url, formats } } }
  category: { data: StrapiEntry<CategoryAttributes> | null }
  author: { data: StrapiEntry<AuthorAttributes> | null }
  tags: string[] | null
  premium: boolean                 // Paywall flag
  trending: boolean                // Carousel flag
  views: number                    // View counter
  readTime: string | null          // "5 min read"
  coverUrl: string | null          // External cover URL
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

// Category
interface CategoryAttributes {
  name: string; slug: string; color: string | null; description: string | null
}

// Author
interface AuthorAttributes {
  name: string; role: string | null; bio: string | null
  avatar: StrapiMediaField; email: string | null
}

// Convenience aliases
type Article = StrapiEntry<ArticleAttributes>
type ArticlesResponse = StrapiCollectionResponse<ArticleAttributes>
```

---

## 11. Pages & Rendering Strategies

| Route | Rendering | Data Source | Features |
|-------|-----------|------------|----------|
| `/` | ISR (60s) | Strapi (articles, trending, categories) | Hero carousel, category grid, newsletter signup |
| `/articles/[slug]` | ISR (60s) | Strapi (article, related) + auth session | SEO meta, JSON-LD, paywall, view tracking, sharing |
| `/search` | CSR | Strapi REST (client-side fetch) | Full-text search, category filter, sort options |
| `/plans` | SSG + CSR | Static plans data + Stripe checkout | Monthly/annual toggle, current plan indicator, test card hint |
| `/account` | CSR | NextAuth session | Profile, plan status, post-checkout success |
| `/saved` | CSR | localStorage | Bookmarked articles (client-side only) |
| `/login` | SSG + CSR | None | Demo login buttons, Google OAuth, credential stepper |
| `/dashboard` | CSR (admin) | Demo data (hardcoded) | KPI cards, sparkline charts |
| `/dashboard/posts` | CSR (admin) | Demo data | Post table with status tabs |
| `/dashboard/posts/[id]/edit` | CSR (admin) | Strapi REST (article by ID) | Rich text editor, save → revalidate |
| `/dashboard/analytics` | CSR (admin) | Demo data | Traffic sources, geography |
| `/dashboard/subscribers` | CSR (admin) | Demo data | Subscriber table, CSV export |
| `/digest` | CSR | Strapi + Gemini + localStorage | AI-generated personalized daily briefing based on reading interests |
| `/api-docs` | SSG + CSR | Live Strapi API (playground) | Interactive "Try it" with latency |
| `/architecture` | SSG | Static data | This architecture overview |
| `/contact` | SSG | None | Contact form (stub) |
| `/privacy` | SSG | None | Privacy policy |
| `/terms` | SSG | None | Terms of service |
| `/sitemap.xml` | Dynamic | Strapi (all articles) | 18 URLs (6 static + 12 articles) |
| `/robots.txt` | Static | None | Allow `/`, disallow `/dashboard/`, `/api/`, `/login` |

---

## 12. Component Library

### Layout Components (`src/components/layout/`)

| Component | Description |
|-----------|-------------|
| `Navbar` | 3-part newspaper masthead: utility bar (date, theme, auth), centered title, sticky section nav. Mobile hamburger drawer with slide animation. |
| `Footer` | Centered masthead repeat, section links, copyright bar |
| `MobileNav` | Fixed bottom tab bar (Home, Plans, API, Login) |
| `Sidebar` | Dashboard sidebar navigation |
| `TechBar` | Developer info bar showing page rendering strategy |

### Reader Components (`src/components/reader/`)

| Component | Description |
|-----------|-------------|
| `HeroCarousel` | Auto-advancing (5s), pause-on-hover, keyboard/dot/arrow nav. Full-bleed image + gradient overlay |
| `ArticleCard` | 3 variants: `default` (image card), `compact` (text-only), `horizontal` (thumbnail left). Bookmark button, trending badge, view count |
| `CategoryFilter` | Pill-style filter buttons for homepage |
| `HeroArticle` | Single featured article layout |

### Article Components (`src/components/article/`)

| Component | Description |
|-----------|-------------|
| `ArticleBody` | Renders rich text (HTML, Markdown, or Strapi blocks). Handles paywall truncation with gradient fade |
| `ArticleAnalytics` | Invisible component. Tracks: view count (POST on mount), scroll depth milestones, read time (beacon on unmount) |
| `ArticleToolbar` | Sticky: font size cycler, bookmark toggle, copy link, native share (Web Share API) |
| `ReadingProgress` | Fixed top progress bar — width = scroll percentage |
| `AuthorBio` | Author card with name, role, bio, avatar |
| `PaywallGate` | Upgrade prompt when free user hits premium article |
| `AIInsightsPanel` | Expandable panel showing AI article intelligence (summary, sentiment, entities, fact-check). Powered by Gemini with Redis caching. |
| `LanguageToggle` | BM ↔ EN toggle that translates article content via Gemini. Cached for 30 days. |
| `AudioMode` | Text-to-speech reader using Web Speech API. Supports English and Malay voices. Zero API cost. |
| `ArticleChat` | Compact chat widget for asking questions about the current article. Grounded responses (no hallucination). |
| `AIArticleFeatures` | Client wrapper component that composes all AI features on the article page. Gates premium articles based on user plan. |
| `AIFeaturesLocked` | Upgrade CTA panel shown when unauthenticated/free users view premium articles. Shows 2x2 feature preview grid at 50% opacity with "Upgrade Plan" button. |

### Auth Components (`src/components/auth/`)

| Component | Description |
|-----------|-------------|
| `DemoLoginButtons` | One-click sign-in buttons (Admin Demo, Reader Demo) |
| `LoginStepper` | 2-step: email → password, with error handling |
| `OAuthButton` | Google sign-in button |

### Dashboard Components (`src/components/dashboard/`)

| Component | Description |
|-----------|-------------|
| `Chart` | CSS-drawn bar chart (no library dependency) |
| `Editor` | Rich text editor for article creation/editing |
| `MetricCard` | KPI card with trend indicator and sparkline |
| `PostsTable` | Article management table with status badges |
| `AIEditorTools` | AI-powered editor assistant — headline alternatives, SEO suggestions, auto-tags. Powered by Gemini. |

### UI Design System (`src/components/ui/`)

| Component | Variants |
|-----------|----------|
| `Badge` | default, accent, success, warning, danger, purple / sizes: sm, md / pill option |
| `Button` | primary, secondary, outline, ghost, danger / sizes: sm, md, lg / loading spinner |
| `Card` | Card, CardHeader, CardContent / hover effect option |
| `Input` | Labeled input with error state display |
| `Modal` | Dialog overlay with backdrop |
| `Skeleton` | Loading placeholder blocks |

### Shared Components (`src/components/shared/`)

| Component | Description |
|-----------|-------------|
| `DemoBanner` | Global banner for unauthenticated users — "Click here to try the demo" |
| `ArchCallout` | Collapsible "How this works" box explaining API call, caching, and auth strategy per page |
| `NewsletterSignup` | Email subscription form (simulated) |
| `ScrollToTop` | Floating button appears after 300px scroll |
| `AdSlot` | Advertisement placeholder (3 positions) |
| `Toast` | Notification popup system |

---

## 13. Design System

### Color Palette

**Light mode (editorial newspaper aesthetic):**

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#faf9f6` | Warm off-white background (newspaper stock) |
| `--surface` | `#f2f0eb` | Card backgrounds, input fills |
| `--text` | `#1a1a1a` | Primary text (near-black) |
| `--muted` | `#6b6b6b` | Secondary text, captions |
| `--accent` | `#8b0000` | Dark burgundy — links, buttons, highlights |
| `--rule` | `#1a1a1a` | Section divider lines |
| `--success` | `#16a34a` | Positive indicators |
| `--warning` | `#d97706` | Caution indicators |
| `--danger` | `#dc2626` | Error states |

**Dark mode:**

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#1a1a17` | Warm off-black |
| `--text` | `#e8e4dc` | Cream text |
| `--accent` | `#c45050` | Lighter red for contrast |

### Typography Scale

| Class | Size | Font | Use |
|-------|------|------|-----|
| `.headline-xl` | 2.5rem (40px) | Playfair Display, bold | Page titles |
| `.headline-lg` | 1.75rem (28px) | Playfair Display, semibold | Section headings |
| `.headline-md` | 1.25rem (20px) | Playfair Display, semibold | Card titles |
| `.section-label` | 0.7rem (11.2px) | Inter, 600, uppercase | Category labels |
| `.byline` | 0.8125rem (13px) | Inter, normal | Author attribution |
| Prose `p` | 1.125rem (18px) | Inter, 1.8 line-height | Article body |

### Animations

- `animate-fade-in` (0.3s) — opacity 0→1
- `animate-slide-up` (0.4s) — translate + fade
- `animate-slide-right` (0.3s) — drawer entrance
- `animate-scale-in` (0.2s) — scale 0.95→1
- `animate-stagger` — children fade in with 80ms delay increment
- `.img-zoom` — scale(1.03) on hover with 0.5s ease

---

## 14. Testing

### Framework

- **Vitest** 4.0.18 — test runner (Vite-native, Jest-compatible API)
- **jsdom** 28.1.0 — browser environment simulation
- **@testing-library/react** 16.3.2 — React component testing
- **@testing-library/jest-dom** 6.9.1 — DOM matchers

### Test Suites (106 tests total: 41 unit + 65 E2E)

**`src/__tests__/utils.test.ts`** — 26 tests
- `cn()` — class merging, conditional classes, Tailwind conflict resolution
- `formatDate()` — ISO string → "Jan 15, 2026" (UTC)
- `readTime()` — word count / 200 wpm → "N min read"
- `truncate()` — boundary conditions, short strings
- `relativeTime()` — "Just now", "3h ago", "Yesterday", "3 days ago", old date fallback
- `slugify()` — lowercase, special chars, dash collapsing, empty string
- `getStrapiMediaUrl()` — null → placeholder, absolute pass-through, relative prepend
- `getArticleCoverUrl()` — priority: external > Strapi > Picsum fallback

**`src/__tests__/revalidate.test.ts`** — 5 tests
- Rejects requests without valid webhook secret (401)
- Revalidates article by slug (direct call format)
- Handles Strapi webhook format (`entry.update` with nested entry)
- Revalidates category tag on category model changes
- Always revalidates homepage and `articles` tag regardless of input

Uses `vi.resetModules()` + dynamic import to handle module-level constant caching of environment variables.

**`src/__tests__/article-body.test.ts`** — 10 tests
- Headings (h1, h2, h3) with proper ID generation
- Bold/italic/bold+italic inline formatting
- Inline code spans
- Fenced code blocks with language class and HTML escaping
- Links with `target="_blank"` and `rel="noopener noreferrer"`
- Images with `loading="lazy"`
- Blockquotes
- Unordered lists
- Horizontal rules
- HTML entity escaping in code blocks

**`e2e/ai-features.spec.ts`** — 18 tests
- Article page AI Intelligence panel on free articles (expand, loading, cached state)
- Language toggle (EN/BM buttons visible, translation trigger, cached result)
- Audio Mode (listen button visible on free articles)
- Article Chat widget (suggested questions on free articles)
- **Premium article locked panel** (unauthenticated users see `AIFeaturesLocked` with upgrade CTA)
- **Premium article AI unlocked** (admin login → full AI features on premium articles)
- AI API endpoints (analyze, translate, chat, suggest — valid responses, caching, long content)
- Zod validation (empty body returns 400)
- Digest page (loads briefing or "no articles available" state)
- Dashboard AI Editor Tools (heading visible, analyze button)
- Homepage AI showcase (upgrade CTA visible)
- Plans page (AI features listed in plan tiers)

**`e2e/dashboard.spec.ts`** — 16 tests
- Admin login and dashboard access
- KPI cards, sparkline charts, analytics
- Article management table with status tabs
- AI Editor Tools section

**`e2e/navigation.spec.ts`** — 10 tests
- Navbar links, category navigation
- Breadcrumb navigation, footer links
- Mobile navigation drawer

**`e2e/demo-mode.spec.ts`** — 8 tests
- Demo banner visibility and dismissal
- Demo login buttons and descriptions
- Login form stepper flow

**`e2e/mobile.spec.ts`** — 13 tests
- Mobile-specific responsive layout
- Touch interactions, mobile nav
- Mobile article reading experience

### Running Tests

```bash
npm test                    # Unit tests (Vitest, single run)
npm run test:watch          # Unit tests (Vitest, watch mode)
npx playwright test         # E2E tests (all specs)
npx playwright test e2e/ai-features.spec.ts  # AI E2E tests only
npx playwright test e2e/dashboard.spec.ts    # Dashboard E2E tests
npx playwright test e2e/navigation.spec.ts   # Navigation E2E tests
```

---

## 15. CI/CD & Deployment

### CI Pipeline (GitHub Actions)

File: `.github/workflows/deploy.yml`

Triggers: push to `main`, pull requests to `main`.

```
1. Checkout code
2. Setup Node.js 20 (npm cache)
3. npm ci (install dependencies)
4. npx tsc --noEmit (TypeScript type check)
5. npm run lint (ESLint)
6. npm test (Vitest — 41 tests)
```

Vercel auto-deploys from `main` branch when CI passes.

### Deployment Architecture

```
GitHub (main branch)
    │
    ├──► GitHub Actions CI (type check, lint, test)
    │
    └──► Vercel (auto-deploy)
         ├── Build: next build (Turbopack)
         ├── Output: standalone (Docker-ready)
         └── Edge CDN: global distribution

Railway (separate deploy)
    ├── Strapi v4 server
    └── PostgreSQL 16
```

### Docker (Local Development)

`docker-compose.yml` runs 4 services:

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:16-alpine | 5433 | Strapi database |
| `redis` | redis:7-alpine | 6379 | API caching |
| `strapi` | ./cms (custom build) | 1337 | CMS server |
| `web` | . (Next.js) | 3000 | Frontend |

Hot reload enabled for Next.js via volume mounts.

### Production Dockerfiles

- `Dockerfile` (Next.js) — 3-stage build: deps → builder → runner. Node 20 Alpine, non-root user, standalone output.
- `cms/Dockerfile` (Strapi) — 2-stage build with `vips-dev` for image processing. Node 20 Alpine.

---

## 16. Environment Variables

### Required (Production)

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_STRAPI_URL` | Public Strapi URL (e.g., `https://adamnews-production.up.railway.app`) |
| `STRAPI_API_TOKEN` | Strapi API token for server-side requests |
| `STRAPI_WEBHOOK_SECRET` | Secret for verifying Strapi webhook calls |
| `NEXTAUTH_SECRET` | JWT signing secret for NextAuth |
| `NEXTAUTH_URL` | App URL for NextAuth callbacks |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Stripe server-side API key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe client-side key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `STRIPE_STANDARD_PRICE_ID` | Stripe price ID for Standard plan |
| `STRIPE_PREMIUM_PRICE_ID` | Stripe price ID for Premium plan |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token |
| `GEMINI_API_KEY` | Google Gemini API key for AI features (free at https://aistudio.google.com) |

### Optional

| Variable | Description |
|----------|------------|
| `STRAPI_URL` | Internal Strapi URL (Docker: `http://strapi:1337`) |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL for SEO |
| `STRIPE_STANDARD_MONTHLY_PRICE_ID` | Override for monthly Standard price |
| `STRIPE_STANDARD_ANNUAL_PRICE_ID` | Override for annual Standard price |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Override for monthly Premium price |
| `STRIPE_PREMIUM_ANNUAL_PRICE_ID` | Override for annual Premium price |
| `NEWSDATA_API_KEY` | NewsData.io key for content seeding |

---

## 17. Project Structure

```
AdamNews/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, providers, nav)
│   │   ├── page.tsx                  # Homepage (ISR)
│   │   ├── globals.css               # Design system (CSS variables, typography)
│   │   ├── providers.tsx             # SessionProvider wrapper
│   │   ├── error.tsx                 # Error boundary
│   │   ├── not-found.tsx             # Custom 404
│   │   ├── sitemap.ts               # Dynamic XML sitemap
│   │   ├── robots.ts                # Robots.txt
│   │   ├── articles/[slug]/page.tsx  # Article detail (ISR + SEO)
│   │   ├── search/page.tsx           # Full-text search (CSR)
│   │   ├── plans/page.tsx            # Subscription plans (SSG)
│   │   ├── account/page.tsx          # User profile (CSR)
│   │   ├── login/page.tsx            # Auth (SSG)
│   │   ├── saved/page.tsx            # Bookmarks (CSR)
│   │   ├── dashboard/               # Admin panel (CSR, auth-gated)
│   │   │   ├── page.tsx             # Overview
│   │   │   ├── posts/page.tsx       # Article management
│   │   │   ├── posts/[id]/edit/     # Article editor
│   │   │   ├── analytics/page.tsx   # Traffic analytics
│   │   │   └── subscribers/page.tsx # Subscriber management
│   │   ├── api-docs/page.tsx         # Interactive API playground
│   │   ├── architecture/page.tsx     # Architecture overview
│   │   ├── contact/page.tsx          # Contact form
│   │   ├── privacy/page.tsx          # Privacy policy
│   │   ├── terms/page.tsx            # Terms of service
│   │   └── api/                      # API route handlers
│   │       ├── revalidate/route.ts   # ISR webhook endpoint
│   │       ├── analytics/route.ts    # Engagement tracking
│   │       ├── articles/[slug]/views/route.ts  # View counter
│   │       ├── stripe/checkout/route.ts        # Stripe Checkout
│   │       ├── stripe/webhook/route.ts         # Stripe lifecycle
│   │       ├── ai/analyze/route.ts              # AI article analysis
│   │       ├── ai/translate/route.ts            # AI translation (EN ↔ BM)
│   │       ├── ai/chat/route.ts                 # AI article Q&A
│   │       ├── ai/digest/route.ts               # AI morning digest
│   │       ├── ai/suggest/route.ts              # AI editor tools
│   │       └── auth/[...nextauth]/route.ts     # NextAuth handler
│   ├── components/
│   │   ├── layout/                   # Navbar, Footer, MobileNav, Sidebar, TechBar
│   │   ├── reader/                   # HeroCarousel, ArticleCard, CategoryFilter
│   │   ├── article/                  # ArticleBody, Analytics, Toolbar, PaywallGate, AI features
│   │   ├── auth/                     # DemoLoginButtons, LoginStepper, OAuthButton
│   │   ├── dashboard/               # Chart, Editor, MetricCard, PostsTable, AIEditorTools
│   │   ├── shared/                   # DemoBanner, ArchCallout, ScrollToTop, Toast
│   │   └── ui/                       # Badge, Button, Card, Input, Modal, Skeleton
│   ├── lib/
│   │   ├── api/strapi.ts            # Strapi REST client (fetchStrapi, getArticles, etc.)
│   │   ├── api/stripe.ts            # Stripe helpers (createCheckoutSession, constructWebhookEvent)
│   │   ├── api/graphql.ts           # Strapi GraphQL client (alternative)
│   │   ├── auth.ts                  # NextAuth config + demo users
│   │   ├── redis.ts                 # Upstash Redis cache-aside
│   │   ├── ai/gemini.ts            # Gemini client, rate limiter, cache-aside, JSON parser
│   │   └── utils.ts                 # cn, formatDate, readTime, slugify, relativeTime, etc.
│   ├── hooks/
│   │   ├── useAuth.ts               # Auth state (isAuthenticated, isAdmin, plan)
│   │   ├── useMediaQuery.ts         # Responsive breakpoints
│   │   ├── useToast.ts              # Toast notification system
│   │   └── usePersonalization.ts    # Reading behavior tracking (localStorage)
│   ├── constants/
│   │   ├── meta.ts                  # Site name, description, default SEO metadata
│   │   ├── plans.ts                 # Subscription plan definitions
│   │   ├── nav.ts                   # Navigation items
│   │   └── api.ts                   # Centralized API endpoint URLs
│   ├── types/
│   │   ├── strapi.ts                # Strapi response types (generic wrappers + content types)
│   │   ├── auth.ts                  # UserRole, UserPlan, NextAuth module augmentation
│   │   ├── ai.ts                    # AI feature type definitions
│   │   └── index.ts                 # Re-exports
│   ├── __tests__/
│   │   ├── setup.ts                 # Test setup (@testing-library/jest-dom)
│   │   ├── utils.test.ts            # 26 utility function tests
│   │   ├── revalidate.test.ts       # 5 API route tests
│   │   └── article-body.test.ts     # 10 markdown rendering tests
│   └── proxy.ts                     # NextAuth middleware
├── cms/                              # Strapi CMS
│   ├── Dockerfile                   # Strapi production build
│   └── scripts/seed.ts             # Content seeding script
├── public/                           # Static assets
├── docker-compose.yml               # 4-service local dev stack
├── Dockerfile                        # Next.js production build
├── next.config.ts                   # Next.js config (standalone output, image remotes)
├── vitest.config.ts                 # Test runner config
├── tsconfig.json                    # TypeScript config
├── package.json                     # Dependencies and scripts
├── DEMO_GUIDE.md                    # Reviewer walkthrough
├── ARCHITECTURE.md                  # This document
└── .github/workflows/deploy.yml    # CI pipeline
```

---

## 18. Security

### Authentication Security

- Passwords hashed with **bcrypt** (cost factor 10)
- JWT sessions signed with `NEXTAUTH_SECRET` (256-bit)
- CSRF protection built into NextAuth (token-based)
- Google OAuth via official `next-auth/providers/google`

### API Security

- `/api/revalidate` — protected by `x-webhook-secret` header verification
- `/api/stripe/webhook` — protected by Stripe HMAC signature verification (`stripe-signature` header)
- `/api/stripe/checkout` — protected by NextAuth middleware (requires authenticated session)
- Dashboard routes — middleware enforces `role === 'admin'`
- **Rate limiting** — All API routes protected by token bucket rate limiter via Upstash Redis
- **Input validation** — All API routes validate request bodies with Zod schemas (type-safe, with descriptive error messages)
- **Structured logging** — All API requests logged with timing, status, and metadata in structured JSON format

### Frontend Security

- No raw HTML injection — React's JSX auto-escapes
- `target="_blank"` links include `rel="noopener noreferrer"`
- External images via `next/image` (no raw `<img>` tags)
- Environment variables: server-only secrets never exposed to client (no `NEXT_PUBLIC_` prefix)

### Content Security

- Strapi API token used for server-side requests only
- Fallback: if token authentication fails (401/403), retries without token for public content
- Premium content gated server-side (not just CSS hiding)
- **AI premium gating**: Article body is never sent to AI client components for premium articles when user lacks access (empty string passed from server component). `AIFeaturesLocked` panel shown instead of real AI features — no AI API calls made.

---

## 19. Business Features

### For Readers

- **Free tier**: 5 articles/month with breaking news access
- **Paid subscriptions**: Unlimited articles, no ads, offline reading
- **Personalization**: Bookmarks (localStorage), dark mode preference
- **Engagement**: View counts, read time estimates, share functionality (Web Share API)
- **Search**: Full-text search across all articles with category and sort filters
- **Newsletter**: Email signup form (stub for Mailchimp/Resend integration)

### For Editors/Admins

- **Strapi CMS**: Full CRUD for articles, categories, authors
- **Rich text editor**: In-dashboard article editing with save → auto-revalidation
- **Analytics dashboard**: Traffic overview, subscriber metrics (demo data)
- **Webhook automation**: Publish in Strapi → live on site in seconds

### For Business Stakeholders

- **Subscription revenue**: 3-tier pricing (Free / RM9.99 / RM19.99 per month)
- **Annual discount**: ~20% savings encourages longer commitment
- **Stripe integration**: Industry-standard payment processing
- **SEO optimized**: Sitemap, OG tags, Twitter Cards, JSON-LD for Google rich results
- **Performance**: Edge CDN delivery, ISR caching, optimized images
- **Mobile responsive**: Full experience on all device sizes

---

## 20. Known Limitations & Production Roadmap

### Current Limitations (Demo Scope)

| Limitation | Reason | Production Fix |
|-----------|--------|----------------|
| Hardcoded demo users | No user database | Connect to Strapi user collection or external auth DB |
| Stripe webhook logs only | No persistent DB for subscriptions | Store subscription status in PostgreSQL/Strapi |
| Dashboard uses demo data | No real analytics pipeline | Integrate PostHog, Mixpanel, or custom analytics |
| Newsletter is simulated | No email service | Integrate Mailchimp, Resend, or SendGrid |
| Bookmarks are localStorage | No cross-device sync | Store in user profile (database) |
| Google OAuth may not work | Requires verified OAuth consent | Complete Google OAuth verification |
| `// TODO` comments | Marked intentionally | Address before production use |

### Production Roadmap

1. **User database** — Replace demo users with Strapi user collection + password reset flow
2. **Stripe subscription persistence** — Store plan in database, sync via webhook
3. **Real analytics** — PostHog or Mixpanel integration for dashboard
4. **Email service** — Newsletter signup, payment receipts, password reset
5. **Comments system** — Article comments with moderation
6. **Push notifications** — Breaking news alerts via service worker
7. **i18n** — Multi-language support (Strapi supports this natively)
8. **A/B testing** — Headline testing, layout experiments
9. ~~**Rate limiting**~~ — ✅ Implemented (token bucket via Upstash Redis on all API routes)
10. ~~**Monitoring**~~ — ✅ Implemented (structured JSON logging + `/api/health` endpoint; Sentry/PostHog can be added)

---

## 21. AI Intelligence Layer

### Overview

Adam News includes a production-grade AI intelligence layer powered by a **multi-model routing architecture** using Groq LLaMA 3.3 70B (primary) and Google Gemini 2.5 Flash (fallback). A provider-agnostic AI router selects the best model per task, with automatic failover and Redis caching. Total cost: **RM 0** (both free tiers).

**Premium Content Gating**: AI features are freely available on all free articles. On premium articles, AI features are locked behind a subscription — unauthenticated and free-plan users see an `AIFeaturesLocked` upgrade panel instead. The article body is never sent to AI client components for gated users (empty string from server component), ensuring premium content cannot be summarized or analyzed without paying.

### AI Features

| Feature | Route | Primary Model | Cache TTL |
|---------|-------|--------------|-----------|
| **Article Intelligence** | `POST /api/ai/analyze` | Groq LLaMA 3.3 | 7 days |
| **Translation** | `POST /api/ai/translate` | Groq LLaMA 3.3 | 30 days |
| **Article Chat** | `POST /api/ai/chat` | Groq LLaMA 3.3 | 24 hours |
| **Morning Digest** | `POST /api/ai/digest` | Groq LLaMA 3.3 | 6 hours |
| **Editor Suggestions** | `POST /api/ai/suggest` | Groq LLaMA 3.3 | 7 days |
| **Audio Mode** | Client-side (Web Speech API) | Browser-native | N/A |

### Multi-Model Routing Architecture

```
API Route ────────► AI Router (src/lib/ai/router.ts)
                    ├── 1. Check Redis cache (provider-agnostic)
                    ├── 2. Select primary model by task type
                    ├── 3. Check provider-specific rate limit
                    ├── 4. Call primary provider
                    ├── 5. On failure → automatic fallback to secondary
                    └── 6. Cache result in Redis (same key regardless of provider)
```

### Task-Based Model Selection

| Task | Primary | Fallback | Reason |
|------|---------|----------|--------|
| **Analyze** | Groq LLaMA 3.3 70B | Gemini Flash | Strong summarization + reasoning |
| **Chat** | Groq LLaMA 3.3 70B | Gemini Flash | Fast + accurate Q&A |
| **Translate** | Groq LLaMA 3.3 70B | Gemini Flash | Higher rate limits + reliable JSON output |
| **Digest** | Groq LLaMA 3.3 70B | Gemini Flash | Cost optimization |
| **Suggest** | Groq LLaMA 3.3 70B | Gemini Flash | Creative headline generation |

### AI Architecture

```
Article Page ─────► AIInsightsPanel
                    ├── Calls POST /api/ai/analyze
                    ├── Router → Groq LLaMA 3.3 (fallback: Gemini)
                    └── Cached in Redis (7 days per slug)

Article Page ─────► LanguageToggle (BM ↔ EN)
                    ├── Calls POST /api/ai/translate
                    ├── Router → Groq LLaMA 3.3 (fallback: Gemini)
                    └── Cached in Redis (30 days per slug+lang)

Article Page ─────► AudioMode
                    ├── Uses browser SpeechSynthesis API
                    ├── Supports en-GB and ms-MY voices
                    └── Zero API cost

Article Page ─────► ArticleChat
                    ├── Calls POST /api/ai/chat
                    ├── Router → Groq LLaMA 3.3 (fallback: Gemini)
                    └── Cached in Redis (24h per slug+question)

/digest Page ──────► Morning Digest
                    ├── Reads user interests from localStorage
                    ├── Fetches latest articles from Strapi
                    ├── Router → Groq LLaMA 3.3 (fallback: Gemini)
                    └── Shared cache by interest+date (6h)

Dashboard ─────────► AI Editor Tools
                    ├── Calls POST /api/ai/suggest
                    ├── Router → Groq LLaMA 3.3 (fallback: Gemini)
                    └── Cached in Redis (7d per slug)
```

### AI Router (`src/lib/ai/router.ts`)

Provider-agnostic AI router with:

1. **Task-based selection** — routes each task to the best model (Groq for analysis/chat, Gemini for translation)
2. **Automatic failover** — if primary provider fails or hits rate limit, transparently falls back to secondary
3. **Per-provider rate limiting** — separate Redis counters for Groq (25 RPM) and Gemini (8 RPM)
4. **Provider-agnostic cache** — same Redis cache keys regardless of which model served the response
5. **Zero dependency Groq client** — uses native `fetch()` with OpenAI-compatible API (no SDK needed)
6. **Error handling** — graceful fallback on API errors (never crashes the page)

### File Structure

```
src/lib/ai/
├── router.ts    ← AI Router: task-based selection, failover, cache
├── groq.ts      ← Groq LLaMA client (fetch-based, zero deps)
└── gemini.ts    ← Gemini client + rate limiter (Google GenAI SDK)
```

### AI Rate Limiting

| Limit | Value | Enforcement |
|-------|-------|-------------|
| Groq RPM (self-imposed) | 25 req/min | Redis counter per minute window |
| Gemini RPM (self-imposed) | 8 req/min | Redis counter per minute window |
| Per-IP analyze | 20 req/min | Token bucket per IP |
| Per-IP chat | 15 req/min | Token bucket per IP |
| Per-IP translate | 10 req/min | Token bucket per IP |
| Per-IP digest | 5 req/min | Token bucket per IP |
| Chat questions/session | 5 per article | Client-side enforcement |
| On rate limit exceeded | 429 + retry-after | Client auto-retries with countdown |

### Cost Analysis

| Resource | Free Tier Limit | Our Daily Usage | Safety Margin |
|----------|----------------|-----------------|---------------|
| Groq API calls | 14,400 RPD | ~40-60 (after caching) | 99%+ under |
| Groq RPM | 30 RPM | 25 RPM (self-imposed) | 17% under |
| Gemini API calls | 250 RPD | ~10-20 (translation + fallback) | 92%+ under |
| Gemini RPM | 10 RPM | 8 RPM (self-imposed) | 20% under |
| Redis commands | 10,000/day | ~4,985 (all features) | 50% under |
| Web Speech API | Unlimited | Browser-native | Infinite |

---

*Last updated: February 2026*
*Built by Mohamed Adam as a Senior Full-Stack Developer portfolio project.*

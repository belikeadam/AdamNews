# AdamNews — Research Summary

## Technology Decisions & Best Practices

### 1. Next.js 14 App Router

**Chosen patterns:**
- **Server Components by default** — all pages and layouts are Server Components unless they need interactivity. Push `'use client'` to leaf components only (buttons, forms, filters).
- **ISR with `revalidate` export** — home page and article pages use `export const revalidate = 60` for time-based ISR. On-demand revalidation via `revalidatePath()` triggered by Strapi webhooks.
- **Metadata API** — use `export const metadata` (static) or `generateMetadata()` (dynamic per-article). Never manual `<head>` tags.
- **Route Handlers** — `app/api/*/route.ts` for Stripe checkout, webhook, and revalidation endpoints.
- **Middleware** — `src/middleware.ts` runs on Edge runtime. Only does cookie/token checks (no bcrypt, no DB). Protects `/dashboard/*` and `/api/stripe/*`.
- **next/font** — Inter loaded via `next/font/google` with CSS variable `--font-inter` for Tailwind integration. Self-hosted at build time, zero layout shift.
- **next/image** — remote patterns configured for Strapi uploads and DEV.to CDN. `fill` mode for article covers with `sizes` prop.

**Gotchas discovered:**
- `params` in page components is a Promise in Next.js 14+ — must `await params`
- Root layout cannot be a Client Component — providers go in a separate `providers.tsx`
- `'use client'` must be the first line, above all imports
- `GET` route handlers are cached by default — use `export const dynamic = 'force-dynamic'` when needed
- Cannot have `page.tsx` and `route.ts` at the same path

### 2. Strapi v4 Content API

**Chosen patterns:**
- **REST API as primary** — simpler for ISR `fetch()` calls from Server Components
- **GraphQL plugin as secondary** — enabled for API Docs "Try it" feature and complex relational queries
- **Populate parameter** — always explicit (`populate=*` for top-level, deep populate with `qs` library for nested relations)

**API Response Shape (critical for TypeScript types):**
```
Single:     { data: { id: number, attributes: { ...fields } }, meta: {} }
Collection: { data: [ { id, attributes } ], meta: { pagination: { page, pageSize, pageCount, total } } }
Error:      { data: null, error: { status, name, message, details } }
```

**Relations within attributes follow the same wrapping:**
```
author: { data: { id: 1, attributes: { name: "..." } } }
cover:  { data: { id: 7, attributes: { url: "/uploads/...", formats: {...} } } }
```

**Filtering syntax:** All operators prefixed with `$` — `$eq`, `$contains`, `$in`, `$null`, etc.
```
GET /api/articles?filters[slug][$eq]=my-article&populate=*
GET /api/articles?filters[premium][$eq]=true&sort=publishedAt:desc&pagination[page]=1&pagination[pageSize]=10
```

**Webhook payload:**
```json
{
  "event": "entry.publish",
  "model": "article",
  "entry": { "id": 42, "title": "...", "slug": "..." }
}
```

**Gotchas:**
- Relations and media NOT included by default — must use `populate`
- Media URLs are relative for local provider — prefix with `STRAPI_URL`
- `formats` in media can be `null` if image is small
- v4 uses `data.attributes.*` wrapping (v5 flattened this — we're on v4)

### 3. NextAuth.js v5 (Auth.js) with App Router

**Chosen patterns:**
- **Split configuration** — `auth.config.ts` (Edge-safe, no bcrypt) for middleware, `auth.ts` (full Node.js) for server components and API routes
- **JWT strategy** — required for Edge middleware compatibility. Custom claims: `{ id, email, role, plan }`
- **Credentials + Google OAuth** — both providers produce identical JWT claims
- **Type augmentation** — `types/next-auth.d.ts` extends `Session`, `User`, and `JWT` interfaces

**Auth flow:**
```
User → /login → Step 1 (email) → Step 2 (password) → POST /api/auth/callback/credentials
  → authorize() in auth.ts → bcrypt.compare()
  → jwt callback (inject id, role, plan into token)
  → session callback (expose on session.user)
  → Set httpOnly cookie → redirect to callbackUrl or /

Google OAuth:
  User → "Continue with Google" → /api/auth/signin/google
  → Google consent → callback → jwt callback (inject claims)
  → Same session flow

Middleware (Edge):
  Every request → auth.config.ts authorized() callback
  → Check auth?.user exists for /dashboard/* routes
  → Redirect to /login if not authenticated
```

**Gotchas:**
- bcrypt CANNOT run in Edge runtime — only in `auth.ts`, never in `auth.config.ts` or middleware
- `user` param in jwt callback only present on initial sign-in — guard with `if (user)`
- `session.user.id` not exposed by default — must add in session callback
- v5 uses `AUTH_` prefix for env vars (but `NEXTAUTH_SECRET` still works for backward compat)

### 4. Stripe Integration

**Chosen patterns:**
- **Stripe Checkout Sessions** — hosted payment page, handles all PCI compliance
- **Webhook signature verification** — `request.text()` for raw body (NOT `.json()`)
- **Metadata linking** — `userId` passed in `metadata` and `subscription_data.metadata` to link Stripe events back to our users

**Key events to handle:**
- `checkout.session.completed` → provision subscription access
- `customer.subscription.updated` → plan change
- `customer.subscription.deleted` → revoke access
- `invoice.payment_failed` → notify user

**Gotchas:**
- Must use `await request.text()` not `.json()` — parsing destroys signature
- `STRIPE_WEBHOOK_SECRET` (whsec_) is different from `STRIPE_SECRET_KEY` (sk_)
- Local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Webhooks can be delivered multiple times — use idempotent operations

### 5. Docker Compose

**Chosen patterns:**
- 4 services: postgres, redis, strapi, web (Next.js)
- **Health checks with `service_healthy` condition** — strapi waits for postgres to be ready
- **`start_period`** — grace period for slow-starting services
- **Anonymous volume** for `node_modules` — prevents host bind mount from overwriting container dependencies
- Services communicate via service name as hostname (e.g., `postgres:5432`, `strapi:1337`)

**Gotchas:**
- `depends_on: service_started` (default) only waits for container start, not process readiness
- Always add `/app/node_modules` anonymous volume with bind mounts
- Strapi admin panel is compiled at build time — env vars baked into bundle

### 6. Upstash Redis

**Chosen patterns:**
- `@upstash/redis` with REST API for Vercel Edge compatibility
- `Redis.fromEnv()` auto-reads `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Cache-aside pattern: check cache → miss → fetch from source → set cache with TTL
- Centralized cache key definitions to prevent typos

**For local development:** Docker Redis container used instead of Upstash. Redis client abstracted to support both.

### 7. Neon.tech PostgreSQL

**Chosen patterns:**
- Connection string via `DATABASE_URL` env var
- Connection pooling enabled (Neon's built-in pooler)
- For local dev: Docker PostgreSQL, for production: Neon.tech free tier (512MB)

### 8. Tailwind CSS v3

**Chosen patterns:**
- **Flat design** — `shadow-sm` on cards only, no heavy shadows
- **CSS variables for colors** — enables dark mode via `class="dark"` strategy
- **Mobile-first breakpoints** — default is mobile, `sm:` → `md:` → `lg:` → `xl:`
- **Inter font via CSS variable** — `font-sans: ['var(--font-inter)']` in Tailwind config
- **44px minimum tap targets** — `h-11` on all interactive elements

## File Structure Rationale

```
src/
├── app/          → Routes (pages + API), minimal logic, mostly server components
├── components/   → Organized by domain (ui, layout, reader, article, dashboard, auth, shared)
├── lib/          → Business logic, API clients, auth config, utilities
├── constants/    → Zero hardcoded values — all endpoints, plans, nav items as constants
├── types/        → TypeScript interfaces matching Strapi response shapes
├── hooks/        → Client-side hooks (useAuth, useToast, useMediaQuery)
└── middleware.ts  → Edge-only auth guard
```

**Why this structure:**
- **DRY** — constants centralized, API calls centralized in `lib/api/strapi.ts`
- **Separation of concerns** — components don't fetch data, pages don't have complex logic
- **Discoverability** — domain-organized components (reader/, dashboard/) vs generic (ui/)
- **Type safety** — Strapi response shapes typed once, reused everywhere

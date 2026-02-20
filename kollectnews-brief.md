# AdamNews — Claude Implementation Prompt

## How to Use This File
Paste this entire document as your first message to Claude. Claude must follow the **Research → Plan → Build → Deploy** sequence strictly. Do not skip phases.

---

## Phase 0 — Research First (Claude must do this before writing any code)

Before writing a single line of code, Claude must:

1. **Research current best practices** for each technology in the stack:
   - Next.js 14 App Router patterns (server components, client components, layouts, middleware)
   - Strapi v4 content API, GraphQL plugin, webhooks, and role-based access
   - NextAuth.js v5 with App Router (credentials + Google OAuth, JWT strategy)
   - Stripe Checkout Sessions + webhook signature verification
   - Docker Compose multi-service setup with health checks and volume mounts
   - Upstash Redis REST API (for Vercel edge compatibility)
   - Neon.tech PostgreSQL connection pooling with Next.js
   - Tailwind CSS v3 flat design patterns

2. **Create a research summary** saved as `RESEARCH.md` in the project root documenting:
   - Chosen patterns and why
   - Any version conflicts or gotchas discovered
   - API shape of Strapi responses (so types can be generated correctly)
   - Auth flow diagram (text-based)
   - File structure decision rationale

3. **Create a build plan** saved as `PLAN.md` documenting:
   - Exact file creation order (dependencies first)
   - Every environment variable needed and where it's used
   - Database schema (tables, relations)
   - All API routes with method, path, auth requirement, and response shape
   - Component tree for each page

4. **Only after both files are written**, proceed to implementation.

---

## Phase 1 — Clean Slate

The existing codebase has old files that must be deleted first:

```bash
# Delete all old files — start fresh
rm -rf src/ revmedia-mvp.jsx index.html vite.config.js
# Keep: package.json (will be replaced), node_modules (will be cleared), requirements.md
```

Then scaffold the new project:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git
```

---

## Phase 2 — Docker Setup (foundation, build this first)

`docker-compose.yml` at project root:

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: AdamNews
      POSTGRES_USER: kollect
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kollect"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  strapi:
    build: ./cms
    ports:
      - "1337:1337"
    environment:
      DATABASE_CLIENT: postgres
      DATABASE_HOST: postgres
      DATABASE_NAME: AdamNews
      DATABASE_USERNAME: kollect
      DATABASE_PASSWORD: ${POSTGRES_PASSWORD}
      JWT_SECRET: ${STRAPI_JWT_SECRET}
      ADMIN_JWT_SECRET: ${STRAPI_ADMIN_JWT_SECRET}
      APP_KEYS: ${STRAPI_APP_KEYS}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./cms:/app
      - /app/node_modules

  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXTAUTH_URL: http://localhost:3000
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      STRAPI_URL: http://strapi:1337
      STRAPI_API_TOKEN: ${STRAPI_API_TOKEN}
      NEXT_PUBLIC_STRAPI_URL: http://localhost:1337
    depends_on:
      - strapi
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next

volumes:
  postgres_data:
  redis_data:
```

---

## Phase 3 — File Structure (DRY, centralized, modular)

```
AdamNews/
├── docker-compose.yml
├── .env.example
├── RESEARCH.md              # Claude writes this in Phase 0
├── PLAN.md                  # Claude writes this in Phase 0
├── README.md                # 3-command setup
│
├── cms/                     # Strapi v4
│   ├── Dockerfile
│   ├── config/
│   ├── src/
│   │   ├── api/
│   │   │   ├── article/
│   │   │   ├── category/
│   │   │   └── author/
│   │   └── plugins/
│   └── scripts/
│       └── seed.ts          # Seeds real data from DEV.to API
│
├── src/                     # Next.js App Router
│   ├── app/
│   │   ├── layout.tsx       # Root layout — navbar, tech bar, providers
│   │   ├── page.tsx         # Reader home (ISR)
│   │   │
│   │   ├── articles/
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Article detail (ISR + paywall)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx     # Step-by-step auth (SSR, redirect if authed)
│   │   │
│   │   ├── plans/
│   │   │   └── page.tsx     # Subscription plans (SSR)
│   │   │
│   │   ├── dashboard/       # Auth-protected, admin only
│   │   │   ├── layout.tsx   # Dashboard shell + sidebar
│   │   │   ├── page.tsx     # Overview metrics
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx         # Posts list
│   │   │   │   └── [id]/edit/
│   │   │   │       └── page.tsx     # Post editor
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   └── subscribers/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api-docs/
│   │   │   └── page.tsx     # API reference (SSG)
│   │   │
│   │   └── api/             # Next.js API routes
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── stripe/
│   │       │   ├── checkout/route.ts
│   │       │   └── webhook/route.ts
│   │       └── revalidate/
│   │           └── route.ts
│   │
│   ├── components/
│   │   ├── ui/              # Primitives: Button, Badge, Card, Input, Modal
│   │   ├── layout/          # Navbar, TechBar, Footer, Sidebar
│   │   ├── reader/          # ArticleCard, HeroArticle, CategoryFilter
│   │   ├── article/         # ArticleBody, PaywallGate, AuthorBio
│   │   ├── dashboard/       # MetricCard, PostsTable, Editor, Chart
│   │   ├── auth/            # LoginStepper, OAuthButton
│   │   └── shared/          # ArchCallout, RenderBadge, Skeleton, Toast
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── strapi.ts    # All Strapi REST calls (centralized)
│   │   │   ├── graphql.ts   # GraphQL client + queries
│   │   │   └── stripe.ts    # Stripe helpers
│   │   ├── auth.ts          # NextAuth config
│   │   ├── redis.ts         # Upstash Redis client
│   │   └── utils.ts         # formatDate, readTime, cn(), etc.
│   │
│   ├── constants/
│   │   ├── api.ts           # All API endpoints as constants (NEVER hardcode URLs)
│   │   ├── plans.ts         # Subscription plan definitions
│   │   ├── nav.ts           # Navigation items
│   │   └── meta.ts          # SEO defaults
│   │
│   ├── types/
│   │   ├── strapi.ts        # Strapi response types
│   │   ├── auth.ts          # Session, user types
│   │   └── index.ts         # Re-exports
│   │
│   ├── hooks/
│   │   ├── useAuth.ts       # Auth state helpers
│   │   ├── useToast.ts      # Toast notifications
│   │   └── useMediaQuery.ts # Responsive helpers
│   │
│   └── middleware.ts        # Auth protection for /dashboard routes
```

---

## Phase 4 — Constants (never hardcode, always import)

`src/constants/api.ts` — single source of truth for all endpoints:

```typescript
export const STRAPI_BASE = process.env.NEXT_PUBLIC_STRAPI_URL!

export const API = {
  // Strapi REST
  articles:     `${STRAPI_BASE}/api/articles`,
  article:      (slug: string) => `${STRAPI_BASE}/api/articles?filters[slug][$eq]=${slug}&populate=*`,
  categories:   `${STRAPI_BASE}/api/categories`,
  authors:      `${STRAPI_BASE}/api/authors`,

  // Strapi GraphQL
  graphql:      `${STRAPI_BASE}/graphql`,

  // Next.js internal API routes
  checkout:     '/api/stripe/checkout',
  webhook:      '/api/stripe/webhook',
  revalidate:   '/api/revalidate',
  nextauth:     '/api/auth',
} as const
```

`src/constants/plans.ts`:

```typescript
export const PLANS = [
  {
    id: 'free',
    name: 'Reader',
    price: { monthly: 0, annual: 0 },
    stripePriceId: { monthly: null, annual: null },
    features: ['5 articles/month', 'Breaking news alerts', 'Newsletter'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: { monthly: 15, annual: 12 },
    stripePriceId: {
      monthly: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!,
      annual:  process.env.STRIPE_STANDARD_ANNUAL_PRICE_ID!,
    },
    features: ['Unlimited articles', 'No ads', 'Offline reading', 'Priority support'],
    cta: 'Start Standard',
    highlight: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: { monthly: 35, annual: 28 },
    stripePriceId: {
      monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
      annual:  process.env.STRIPE_PREMIUM_ANNUAL_PRICE_ID!,
    },
    features: ['Everything in Standard', 'Exclusive reports', 'Weekly briefing', 'API access'],
    cta: 'Start Premium',
    highlight: false,
  },
] as const
```

---

## Phase 5 — UX Flows (idiot-proof, 3 steps max)

### Login — Step-by-step (not a single form dump)

```
Step 1: Enter email → click Next
         [email input, large, full-width]
         [Next →] button

Step 2: Enter password → click Sign In
         [Shows user's avatar/initials + email at top so they know who they're signing in as]
         [password input]
         [← Back] [Sign In →]

Step 3: Success → toast "Welcome back!" → redirect
```

No username/password on screen at the same time. Each step is one decision.

### Subscribe — 3 steps

```
Step 1: Choose plan (card selector, visual, price clear)
Step 2: Confirm — show what you're getting + price
Step 3: Stripe Checkout (hosted, handles payment)
→ Webhook provisions access → redirect back with success toast
```

### Publish Article — 3 steps

```
Step 1: Write (title + body + cover image)
Step 2: Configure (category, author, SEO title, premium toggle, schedule)
Step 3: Publish → ISR revalidation triggered → toast "Live in ~5s"
```

### General UX Rules
- Every destructive action (delete, cancel subscription) requires a 2-step confirm
- All async actions show a loading state on the button (spinner + disabled)
- Every success/error shows a toast (top-right, auto-dismiss 4s)
- Empty states are never blank — always show an illustration + action button
- Forms validate inline (on blur), not just on submit
- No modal stacking — one modal at a time maximum

---

## Phase 6 — Pages Spec (all features from MVP, enhanced)

### Reader `/` — ISR revalidate: 60
- Hero: featured article full-width, large title, excerpt, author chip, read time, SSR badge
- Category filter bar: horizontal scroll on mobile, sticky below navbar
- Article grid: 1-col mobile → 2-col tablet → 3-col desktop
- Each card: cover image, category badge, premium lock icon, render strategy badge (ISR/SSG), title, excerpt (2 lines), author + date + read time
- Sidebar (desktop only): Trending Now, Live Core Web Vitals (LCP/CLS/INP/FCP), Subscriber count
- Non-premium user: after 5 articles, soft paywall nudge banner (not a hard block)
- `ⓘ How this works` callout: shows the ISR fetch + Redis cache key

### Article Detail `/articles/[slug]` — ISR revalidate: 60
- Breadcrumb: Home > Category > Title
- Render strategy toolbar: `ISR · revalidate: 60s` + `Cache-Control: s-maxage=60, stale-while-revalidate`
- Full article body for free articles
- Premium articles: first 3 paragraphs visible, then gradient fade → paywall gate
- Paywall gate: plan cards (Standard / Premium), price, key features, Stripe CTA
- Author bio card at bottom
- Related articles (same category, 3 cards)
- Share buttons: copy link, Twitter/X, WhatsApp

### Login `/login` — SSR (redirect if already authed)
- Step-by-step flow (see Phase 5)
- Google OAuth button above the stepper ("Continue with Google")
- Demo credentials banner (dismissible, yellow)
- After login: redirect to previous page or home

### Plans `/plans` — SSR
- Monthly / Annual toggle at top (annual shows "Save 20%")
- 3 plan cards side by side (stacked on mobile)
- Most popular badge on Standard
- Feature checklist per plan
- CTA button per plan → triggers subscribe flow
- Tech note at bottom: "Payments via Stripe · FPX via Billplz · JWT subscriber claims · Redis session TTL 24h"

### Dashboard `/dashboard` — CSR, admin-only (middleware protected)

**Overview sub-page:**
- 4 metric cards: Total Articles, Subscribers, MRR (RM), Churn Rate — each with sparkline + trend %
- 14-day pageviews bar chart
- Top performing pages table (path, views, bounce rate)
- Core Web Vitals table (LCP, CLS, INP, FCP — green/red status)

**Posts sub-page:**
- Table: title, status pill (published/draft/scheduled/review), author, category, views, premium flag, date, actions (Edit / Delete)
- Filter tabs: All / Published / Draft / Scheduled
- "+ New Post" button → editor

**Editor sub-page:**
- Step 1 panel: Title (large input), Body (rich text — Tiptap with H1/H2/Bold/Italic/Link/Image/Quote/Code toolbar), Cover image upload
- Step 2 panel (right sidebar): Category select, Author select, SEO Title, Meta Description, Publish Date (schedule), Premium toggle, Cache strategy note
- Action bar: Save Draft / Preview / Publish →
- On publish: POST to `/api/revalidate?slug=...` → toast "Article live in ~5s via ISR"

**Analytics sub-page:**
- 4 metric cards: Total Pageviews, Unique Readers, Avg Time on Page, Scroll Depth
- Traffic by source: horizontal bar chart (Organic, Social, Direct, Referral)
- Audience geography: top 5 countries bar chart
- Note: "GA4 + Chartbeat integration · Real-time data"

**Subscribers sub-page:**
- 4 metric cards: Total Subscribers, MRR, Churn Rate, ARPU
- Table: email, plan badge, MRR, status pill (active/churned), joined date, session count
- Export CSV button
- Note: "Stripe integration · JWT sessions · Redis cache"

### API Docs `/api-docs` — SSG
- 3-column layout: nav (left) / endpoint detail (center) / live response (right)
- 5 endpoints documented:
  - `GET /api/v1/articles` — Redis cached, paginated
  - `POST /api/v1/auth/login` — JWT issued
  - `POST /api/v1/subscribe` — Stripe checkout
  - `POST /graphql` — WPGraphQL/Strapi query
  - `POST /api/v1/cache/revalidate` — ISR + CloudFront
- Each endpoint: method badge, path, description, parameters table, curl example, "▶ Try it" button
- "▶ Try it" makes a **real fetch** to the actual running endpoint and shows live JSON response
- Response panel: shows status code (200 OK · 48ms), formatted JSON

---

## Phase 7 — Self-Explanatory UX Layer

### Tech Bar (every page, below navbar, 32px)
Shows current page's architecture at a glance:
```
[ISR · 60s]  [Strapi REST]  [Redis: HIT · TTL 42s]  [Next.js 14 App Router]  [TypeScript]
```
Each badge is a tooltip on hover explaining why this choice was made.

### `ⓘ How this works` Callout
Collapsible panel on each major section. Shows:
- Exact API call (method + URL + key params)
- Caching strategy + TTL
- Auth requirement
- One-line architectural rationale

### Demo Banner (login page + dashboard)
```
🔑 Demo access  |  Admin: admin@AdamNews.com / demo1234  |  Reader: reader@AdamNews.com / demo1234
```

### Render Strategy Badges
Every article card shows its render strategy:
- `SSR` — green — server-rendered per request
- `ISR` — amber — cached, revalidates every 60s
- `SSG` — blue — built at deploy time
- `CSR` — purple — client-side only

---

## Phase 8 — Design System (flat, Inter, mobile-first)

```
Font:       Inter — import from Google Fonts
Weights:    400 (body), 500 (labels), 600 (headings), 700 (display)

Colors (CSS variables, support dark mode via class="dark"):
  --bg:         #ffffff / #0f0f0f
  --surface:    #f9fafb / #171717
  --surface-2:  #f3f4f6 / #1f1f1f
  --border:     #e5e7eb / #2a2a2a
  --text:       #111827 / #f9fafb
  --muted:      #6b7280 / #9ca3af
  --accent:     #2563eb          (blue — primary CTA)
  --accent-hover: #1d4ed8
  --success:    #16a34a
  --warning:    #d97706          (premium/amber)
  --danger:     #dc2626

Spacing:    4px base (Tailwind default)
Radius:     rounded (4px cards), rounded-sm (2px badges), rounded-lg (8px modals)
Shadows:    shadow-sm on cards only, none on flat surfaces
Transitions: duration-150 ease-in-out on all interactive elements

Mobile-first breakpoints:
  default → mobile (< 640px): single column, bottom nav
  sm → 640px: 2-col grid
  md → 768px: sidebar appears
  lg → 1024px: full desktop layout
  xl → 1280px: max-width container

Tap targets: min h-11 (44px) on all interactive elements
```

---

## Phase 9 — Strapi CMS Content Types

```
Article:
  title         String (required)
  slug          UID (from title, required)
  excerpt       Text
  body          RichText (Blocks)
  cover         Media (single)
  category      Relation → Category (many-to-one)
  author        Relation → Author (many-to-one)
  tags          JSON
  premium       Boolean (default: false)
  trending      Boolean (default: false)
  views         Integer (default: 0)
  readTime      String (auto-computed on beforeCreate lifecycle)
  publishedAt   DateTime (Strapi draft/publish system)

Category:
  name          String (required)
  slug          UID
  color         String (hex, e.g. "#2563eb")
  description   Text

Author:
  name          String (required)
  role          String
  avatar        Media (single)
  bio           Text
  email         Email
```

Enable: GraphQL plugin, Users & Permissions plugin (for reader auth), Webhooks (POST to `/api/revalidate` on article publish/update).

---

## Phase 10 — Seed Script

`cms/scripts/seed.ts` — runs once on first `docker compose up`:

1. Create 4 categories: Technology, Business, Finance, Lifestyle
2. Create 3 authors with realistic names/roles
3. Fetch 8 articles from DEV.to public API:
   ```
   GET https://dev.to/api/articles?tag=javascript&per_page=8
   GET https://dev.to/api/articles?tag=webdev&per_page=4
   ```
4. Map DEV.to fields → Strapi fields (title, body_html → body, description → excerpt, cover_image → cover URL, reading_time_minutes → readTime)
5. Mark articles[0,2,4] as premium: true
6. Mark articles[0,1] as trending: true
7. Log: "✅ Seeded 12 articles, 4 categories, 3 authors"

---

## Phase 11 — Auth Architecture

```
NextAuth.js v5 (App Router)
├── Credentials provider
│   ├── email + password
│   ├── bcrypt.compare() on login
│   └── JWT claims: { id, email, role, plan }
├── Google OAuth provider
│   └── Same JWT claims injected on callback
├── JWT strategy
│   ├── Access: 15min (httpOnly cookie)
│   └── Refresh: 30d
└── Middleware (src/middleware.ts)
    ├── /dashboard/* → require role === 'admin'
    └── /api/stripe/* → require authenticated session
```

---

## Phase 12 — Deployment (auto, free tier)

### Vercel (Next.js)
- `vercel.json` at root:
  ```json
  {
    "buildCommand": "next build",
    "outputDirectory": ".next",
    "framework": "nextjs",
    "regions": ["sin1"]
  }
  ```
- GitHub Actions: `.github/workflows/deploy.yml`
  - On push to `main`: run `tsc --noEmit` + `next lint` → if pass, Vercel auto-deploys via GitHub integration

### Strapi (Railway)
- `cms/Dockerfile` for Railway deployment
- Environment variables set in Railway dashboard

### Free Tier Stack
| Service | Platform | Limit |
|---|---|---|
| Next.js | Vercel Hobby | 100GB bandwidth |
| Strapi | Railway | $5 credit/mo |
| PostgreSQL | Neon.tech | 512MB |
| Redis | Upstash | 10K req/day |
| Media | Cloudinary | 25GB |
| Analytics | Vercel Analytics | Included |

---

## Phase 13 — README (3 commands)

```markdown
# AdamNews

## Local Development

\`\`\`bash
git clone https://github.com/your-username/AdamNews
cp .env.example .env          # Fill in your values
docker compose up             # Starts everything
\`\`\`

Open http://localhost:3000

**Demo login:** admin@AdamNews.com / demo1234
\`\`\`
```

---

## Final Checklist (Claude must verify each before finishing)

- [ ] `RESEARCH.md` written with findings and decisions
- [ ] `PLAN.md` written with full build order and API shapes
- [ ] Old files deleted, fresh Next.js scaffold created
- [ ] `docker-compose.yml` — all 4 services, health checks, volumes
- [ ] `.env.example` — every variable documented with description
- [ ] `src/constants/api.ts` — all endpoints as constants, zero hardcoded URLs
- [ ] `src/constants/plans.ts` — plan definitions centralized
- [ ] All 6 pages built (Reader, Article, Login, Plans, Dashboard, API Docs)
- [ ] Dashboard: Overview, Posts, Editor, Analytics, Subscribers sub-pages
- [ ] Step-by-step login flow (email → next → password → sign in)
- [ ] Tech Bar on every page
- [ ] `ⓘ How this works` callout on each major section
- [ ] Demo credentials banner on login + dashboard
- [ ] Render strategy badges on article cards
- [ ] Strapi content types created + GraphQL plugin enabled
- [ ] Strapi webhook → `/api/revalidate` on publish
- [ ] Seed script with real DEV.to data
- [ ] NextAuth credentials + Google OAuth
- [ ] Stripe checkout + webhook provisioning
- [ ] Middleware protecting `/dashboard/*`
- [ ] Mobile: bottom tab nav, 44px tap targets, no horizontal scroll
- [ ] Dark mode support via Tailwind `dark:` classes
- [ ] `vercel.json` deployment config
- [ ] GitHub Actions CI workflow
- [ ] README with 3-command setup

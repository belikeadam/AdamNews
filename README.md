# The Adam News

> A full-stack news platform with editorial design, real-time CMS, subscription paywall, and ISR caching.

**Live:** [adam-news.vercel.app](https://adam-news.vercel.app)

**Demo credentials:** `admin@AdamNews.com` / `demo1234`

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, RSC, ISR), React 19, Tailwind CSS v4 |
| CMS | Strapi v4 (REST + GraphQL), PostgreSQL |
| Auth | NextAuth.js v5 (JWT, Google OAuth, Credentials) |
| Payments | Stripe Checkout + Webhook-driven subscription lifecycle |
| Cache | Next.js ISR (tag-based revalidation), Upstash Redis |
| Deployment | Vercel (frontend) + Railway (Strapi + PostgreSQL) |
| CI | GitHub Actions (typecheck, lint, test) |
| Testing | Vitest (41 tests: unit + API integration) |

## Key Features

- **ISR + On-demand Revalidation** — 60s stale-while-revalidate with instant cache purge via Strapi webhooks
- **Subscription Paywall** — Stripe Checkout with plan-aware content gating (`session.user.plan`)
- **Editorial Design System** — Playfair Display + Inter, CSS custom properties, full dark mode
- **SEO** — Dynamic OG/Twitter cards, JSON-LD NewsArticle schema, sitemap.xml, robots.txt
- **Dashboard** — Article editor with Strapi REST CRUD, analytics, subscriber management
- **Image Optimization** — `next/image` with responsive `sizes`, priority loading for hero
- **Engagement** — Bookmarks (localStorage), reading progress, font size control, native share API

## Pages

| Route | Rendering | Description |
|---|---|---|
| `/` | RSC + ISR | Homepage with hero carousel, density toggle, personalized greeting |
| `/articles/[slug]` | RSC + ISR | Article with paywall, JSON-LD, toolbar, related articles |
| `/search` | CSR | Real-time search with category + sort filters |
| `/saved` | CSR | Reading list (localStorage) |
| `/plans` | CSR | Subscription plans with Stripe Checkout |
| `/login` | RSC | Google OAuth + 2-step credentials flow |
| `/dashboard` | CSR (admin) | Metrics, post management, article editor |
| `/api-docs` | CSR | Interactive API playground |
| `/contact`, `/privacy`, `/terms` | RSC | Static pages |

## API Routes

| Endpoint | Purpose |
|---|---|
| `POST /api/stripe/checkout` | Creates Stripe Checkout session (auth-guarded) |
| `POST /api/stripe/webhook` | Handles subscription lifecycle events (signature-verified) |
| `POST /api/revalidate` | On-demand ISR cache purge (webhook-secret-verified) |
| `POST /api/articles/[slug]/views` | Increments view counter |
| `POST /api/analytics` | Receives scroll-depth beacon events |

## Project Structure

```
src/
├── app/            Routes (App Router) + API handlers
├── components/     article/, auth/, dashboard/, layout/, reader/, shared/, ui/
├── lib/            api/strapi.ts, api/stripe.ts, auth.ts, redis.ts, utils.ts
├── constants/      Centralized config (meta, nav, plans, API URLs)
├── types/          Generic Strapi types, NextAuth augmentation
├── hooks/          useAuth, useMediaQuery, useToast
└── __tests__/      Vitest unit + integration tests

cms/
├── src/api/        Content type schemas (Article, Category, Author)
├── src/index.js    Bootstrap: auto-permissions + webhook registration
├── config/         Database, server, plugin config
└── scripts/        Seed script (fetches from Dev.to API)
```

## Local Development

```bash
git clone https://github.com/your-username/AdamNews
cd AdamNews
cp .env.example .env     # Fill in your values
docker compose up        # Starts Postgres, Redis, Strapi, Next.js
```

Open [http://localhost:3000](http://localhost:3000)

### Seed Content

The seed script fetches real articles from the Dev.to API across 6 categories:

```bash
cd cms
npm install
npx ts-node scripts/seed.ts
```

### Run Tests

```bash
npm test            # Single run (41 tests)
npm run test:watch  # Watch mode
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | Yes | Strapi API URL |
| `STRAPI_API_TOKEN` | No | Strapi API token (falls back to public access) |
| `STRAPI_WEBHOOK_SECRET` | Yes | Shared secret for webhook verification |
| `NEXTAUTH_SECRET` | Yes | NextAuth.js JWT signing key |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_STANDARD_PRICE_ID` | Yes | Stripe price ID for Standard plan |
| `STRIPE_PREMIUM_PRICE_ID` | Yes | Stripe price ID for Premium plan |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis URL (graceful fallback) |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis token |

## Deployment

See [DEPLOY.md](./DEPLOY.md) for full Vercel + Railway + Neon + Upstash deployment guide.

## License

MIT

# The Adam News — Demo Guide

**Live Site:** https://adam-news.vercel.app
**CMS Admin:** https://adamnews-production.up.railway.app/admin
**GitHub:** https://github.com/belikeadam/AdamNews

---

## Quick Start (30 seconds)

1. Open https://adam-news.vercel.app/login
2. Click **"Admin Demo"** or **"Reader Demo"** — one click, instant sign in
3. Explore the site

---

## Demo Accounts

### Frontend (Next.js)

| Account | Email | Password | Role | Plan |
|---------|-------|----------|------|------|
| **Admin** | `admin@AdamNews.com` | `demo1234` | Admin | Premium |
| **Reader** | `reader@AdamNews.com` | `demo1234` | User | Free |

### CMS Admin (Strapi)

| Email | Password | Access |
|-------|----------|--------|
| `mohdadam020324@gmail.com` | `Editor912` | Full Strapi admin panel |

---

## Test Flows

### 1. Reader Experience (Free Plan)

1. Go to https://adam-news.vercel.app/login
2. Click **"Reader Demo"** (one-click login)
3. Browse homepage — lead article, category sections, trending sidebar
4. Click a category in the navbar — page scrolls to filtered view with category header
5. Click any article — read full content, see engagement metrics
6. Toggle dark mode (top-right moon icon)
7. Visit `/account` — see "Reader (Free)" plan, "Upgrade" button
8. Visit `/saved` — bookmark an article, verify it appears

### 2. Subscription Upgrade (Stripe)

1. Log in as **Reader** (free plan)
2. Go to `/plans` — "Your plan" badge shows on Reader card
3. Click **"Start Standard"** — redirects to Stripe Checkout
4. Use test card: **`4242 4242 4242 4242`**
   - Expiry: `12/29` (any future date)
   - CVC: `123` (any 3 digits)
   - Name: anything
5. After payment → redirected to `/account` with success banner
6. Plan shows "Standard — Active" on account page
7. Navbar shows `Reader (standard)` in top-right

### 3. Admin Dashboard

1. Log in as **Admin** (or click "Admin Demo")
2. Click **"Dashboard"** in top-right utility bar
3. View analytics overview, subscriber stats
4. Go to **Dashboard → Posts** — see all 67 articles across 6 categories
5. Click **Edit** on any article → edit title/excerpt/body in rich editor
6. Save → Strapi updates + ISR revalidation triggers automatically

### 4. CMS Content Management (Strapi)

1. Open https://adamnews-production.up.railway.app/admin
2. Login: `mohdadam020324@gmail.com` / `Editor912`
3. Go to **Content Manager → Articles**
4. Edit an article → Save → Publish
5. Webhook fires → frontend revalidates within seconds
6. Verify change appears at https://adam-news.vercel.app

### 5. API Playground

1. Visit https://adam-news.vercel.app/api-docs
2. Click **"Try it"** on any GET endpoint (articles, categories, authors, **health**)
3. See live JSON response with latency metrics
4. Review POST endpoints documentation (revalidate, checkout, webhook)

### 6. Health Check & Monitoring

1. Visit `/api/health` — see JSON response with:
   - Overall system status (`healthy` / `degraded`)
   - Strapi CMS status + latency
   - Upstash Redis status + latency
   - Server uptime
2. All API routes return rate limit headers:
   - `X-RateLimit-Limit` — max requests allowed
   - `X-RateLimit-Remaining` — requests left in window

---

## Key Features to Verify

| Feature | Where to Test |
|---------|---------------|
| Responsive design | Resize browser or use mobile device |
| Dark mode | Moon icon in top-right utility bar |
| Category colors | Each category has distinct color (blue, green, purple, etc.) |
| Category filtering | Click category in navbar → smooth scroll to filtered view |
| SEO metadata | View page source on any article |
| Sitemap | https://adam-news.vercel.app/sitemap.xml |
| 404 page | https://adam-news.vercel.app/nonexistent |
| Paywall | Premium articles gated for free users |
| Search | `/search` — full-text search with category chips, sort tabs |
| Bookmarks | Save icon on any article card |
| View counter | Article pages show view count |
| Read time | Calculated automatically per article |
| Health check | `/api/health` — service dependency status |
| Rate limiting | All API routes return `X-RateLimit-*` headers |
| Input validation | POST invalid JSON to `/api/analytics` — graceful handling |
| Reading progress | Colored progress bar at top of article pages |
| Emoji reactions | React to articles with emoji (below byline) |
| Share buttons | X, WhatsApp, Telegram, LinkedIn, Copy link on articles |

---

## Architecture Overview

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, CSS variables, dark mode |
| CMS | Strapi v4 (headless), REST API, 6 categories, 67 articles |
| Auth | NextAuth v5 (JWT sessions, Credentials + Google OAuth) |
| Payments | Stripe Checkout (subscriptions, webhooks) |
| Cache | Upstash Redis (cache-aside, rate limiting) |
| Validation | Zod schemas on all API routes |
| Monitoring | Structured JSON logger + `/api/health` endpoint |
| Hosting | Vercel (frontend), Railway (Strapi + PostgreSQL) |
| Testing | Vitest (41 tests passing) |
| CI/CD | GitHub Actions → Vercel auto-deploy |

---

## Stripe Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry, any 3-digit CVC, any cardholder name.

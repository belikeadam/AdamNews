# The Adam News — Demo & Review Guide

**Live Site:** https://adam-news.vercel.app
**CMS Admin:** https://adamnews-production.up.railway.app/admin
**GitHub:** https://github.com/belikeadam/AdamNews
**Architecture Docs:** https://adam-news.vercel.app/architecture
**API Playground:** https://adam-news.vercel.app/api-docs

---

## Quick Start (30 seconds)

1. Open https://adam-news.vercel.app/login
2. Click **"Admin Demo"** — one click, instant sign in as admin with premium access
3. You now have full access to every feature: dashboard, CMS editor, premium articles, API docs, architecture page

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

## Requirements Coverage

This section maps each core requirement to **where you can verify it** in the live demo.

### Frontend (React + Next.js)

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **React 19** component architecture | 60+ reusable components (ArticleCard, HeroCarousel, Navbar, PaywallGate, etc.) | View page source or `/architecture` |
| **SSR** (Server Side Rendering) | Article pages and homepage rendered server-side for SEO | View source on any article — full HTML present before JS loads |
| **SSG** (Static Site Generation) | Plans, Login, Privacy, Terms, Architecture pages pre-built at deploy | These pages load instantly — no loading spinner |
| **ISR** (Incremental Static Regeneration) | Homepage + articles revalidate every 60s or on CMS webhook | Edit article in Strapi → appears on site within seconds |
| **Mobile First** responsive design | All pages fully responsive, mobile nav drawer, touch-optimized | Resize browser or open on phone |
| **Core Web Vitals (LCP, CLS, INP)** | `overflow-x: hidden` prevents CLS, `next/image` for LCP, `font-display: swap` | Run Lighthouse on any page |
| **Image optimization** | All images via `next/image` with responsive `sizes`, lazy loading, format negotiation | Inspect network tab — see WebP/AVIF served |
| **TypeScript** | 100% TypeScript codebase with strict types | `/architecture` page lists all type definitions |
| **Tailwind CSS v4** | Utility-first CSS with CSS custom properties, dark mode | Toggle dark mode (moon icon top-right) |

### Backend (Node.js APIs)

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **REST API** | 14 API routes (4 GET, 10 POST) including 5 AI endpoints | `/api-docs` — click "Try it" on any endpoint |
| **Authentication (JWT)** | NextAuth v5 with stateless JWT sessions, OAuth + credentials | Login as Admin → inspect cookies (next-auth.session-token) |
| **Authorization (RBAC)** | Free/Standard/Premium/Admin roles with tiered access | Login as Reader → premium articles show paywall gate |
| **Rate limiting** | Token bucket algorithm via Upstash Redis on all API routes | `/api-docs` — check response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining` |
| **Input validation** | Zod schemas on all POST API routes | `/api-docs` — see schema definitions for each endpoint |
| **Structured logging** | JSON logger with timing, metadata, IP anonymization | `/architecture` → "Key Patterns" section shows implementation |
| **Health monitoring** | `/api/health` endpoint checks Strapi + Redis with latency | `/api-docs` → click "Try it" on Health Check |
| **Webhook handling** | Stripe webhooks (HMAC verified) + Strapi webhooks (secret verified) | `/architecture` → Content Pipeline diagram |

### CMS (Headless CMS — Strapi)

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **Headless CMS** | Strapi v4 with REST API, structured content types | Open https://adamnews-production.up.railway.app/admin |
| **Content modeling** | Article, Category, Author content types with relations | CMS Admin → Content Manager → see all content types |
| **Editorial workflow** | Draft → Published, webhook auto-revalidation | Edit article in Strapi → save → verify on live site |
| **SEO fields** | slug, excerpt, cover image, publishedAt on every article | View source on any article → see `<meta>` tags |
| **67 articles** across 6 categories | Seeded from Dev.to API with real tech content | Homepage shows categorized articles, `/search` shows all |
| **40+ authors** | Author profiles with avatars, roles, bios | Click any author name on article page |

### Database & Caching

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **PostgreSQL** | Strapi database (hosted on Railway) | CMS Admin → all data persists across sessions |
| **Redis** | Upstash Redis for API caching + rate limiting | `/api/health` → shows Redis status + latency |
| **Cache-aside pattern** | Redis cache with TTL, graceful fallback on failure | `/architecture` → Caching section |
| **ISR cache invalidation** | Tag-based + path-based revalidation via webhooks | Edit in Strapi → `POST /api/revalidate` fires automatically |

### Subscription System (Stripe)

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **3-tier pricing** | Free / Standard RM9.99 / Premium RM19.99 per month | `/plans` page |
| **Stripe Checkout** | Secure hosted payment page with test cards | Click "Start Standard" → Stripe page opens |
| **Webhook lifecycle** | checkout.completed, subscription.updated/deleted, invoice.failed | `/architecture` → Payment System section |
| **Plan upgrade flow** | Pay → redirect → JWT updated → access granted instantly | Use test card `4242 4242 4242 4242` |

### DevOps & Infrastructure

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **Docker** | 4-service docker-compose (Postgres, Redis, Strapi, Next.js) | See `docker-compose.yml` in repo |
| **CI/CD** | GitHub Actions (type check, lint, 41 tests) → Vercel auto-deploy | See `.github/workflows/deploy.yml` in repo |
| **Vercel Edge CDN** | Global distribution with ISR caching | Site loads fast worldwide |
| **Railway hosting** | Strapi + PostgreSQL on Railway | CMS Admin is always accessible |

### Security

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **JWT auth** | Stateless sessions, bcrypt password hashing | Login flow — no database session lookup needed |
| **HTTPS** | Enforced on all production endpoints | All URLs are `https://` |
| **Input validation** | Zod schemas on every API route | `/api-docs` → POST endpoints show validation |
| **Rate limiting** | Per-IP token bucket on all routes (5–100 req/min depending on endpoint) | API response headers show rate limit status |
| **XSS protection** | React JSX auto-escaping, no `dangerouslySetInnerHTML` on user input | Article body rendered through safe markdown parser |
| **RBAC** | Admin routes protected by middleware, premium content gated server-side | Try `/dashboard` as Reader → redirected to home |

---

## Reviewer Walkthrough: Admin Demo

Follow these steps to see every major feature in action.

### Step 1: Sign In as Admin

1. Go to https://adam-news.vercel.app/login
2. Click **"Admin Demo"** (one-click login)
3. Notice: navbar shows your name + `(premium)` plan badge in top-right

### Step 2: Browse the Homepage

1. See the **Breaking News ticker** at top (auto-rotating headlines)
2. **Hero Carousel** — swipeable featured articles with Ken Burns effect
3. **Category sections** — each with unique color accent (Technology=blue, Business=green, etc.)
4. Click a **category in the navbar** — page smooth-scrolls to filtered view with category header
5. **Trending sidebar** (desktop) — numbered list with thumbnails
6. Toggle **dark mode** (moon icon, top-right)

### Step 3: Read an Article

1. Click any article from homepage
2. Notice: **Reading progress bar** at the very top (colored by category)
3. **Full-bleed cover image** with gradient overlay
4. **Breadcrumb navigation** — Home → Category → Article title
5. **Byline** — author avatar, name, published time, read time, view count, live reader count
6. **Emoji reactions** — click to react (persisted in localStorage)
7. **Article toolbar** — font size toggle, bookmark, copy link, share
8. **Share buttons** at bottom — X, WhatsApp, Telegram, LinkedIn, Copy link
9. **Author bio card** — shows author details
10. **Related articles** — 3 articles from same category
11. **Next article CTA** — fixed bottom bar suggesting next read

### Step 4: Admin Dashboard

1. Click **"Dashboard"** in the top utility bar
2. **Overview page** — KPI cards (total articles, subscribers, revenue, page views) with sparkline charts
3. **Posts tab** — see all 67 articles in a table with status (Published/Draft), category, views
4. Click **"Edit"** on any article → opens rich text editor
5. Edit title or content → click **Save** → ISR revalidation triggers automatically
6. **Analytics tab** — traffic sources, geographic distribution (demo data)
7. **Subscribers tab** — subscriber table with plan, status, MRR (demo data)

### Step 5: View Architecture & API Docs (Performance & Technical Depth)

This is where reviewers can see the full technical implementation.

1. Click **"Architecture"** in the navbar (available on both desktop and mobile)
   - **System diagram** — Vercel → Strapi → PostgreSQL → Redis data flow
   - **Rendering strategies table** — which pages use SSR/SSG/ISR/CSR and why
   - **API routes listing** — all 9 endpoints with descriptions
   - **Key patterns**: Rate Limiting (Token Bucket), Zod Validation, Cache-Aside, Structured Logging

2. Click **"API Docs"** in the navbar
   - All 9 API endpoints documented with method, path, auth, and description
   - Click **"Try it"** on **Health Check** → see live system status:
     - Strapi CMS: status + latency in ms
     - Upstash Redis: status + latency in ms
     - Overall system health: `healthy` or `degraded`
   - Click **"Try it"** on **Articles**, **Categories**, **Authors** → see live JSON responses with latency
   - Review POST endpoint documentation for Stripe, Revalidation, Analytics

### Step 6: Verify Search & Filtering

1. Click **"Search"** in the navbar
2. Try searching for "AI" or "React" — see instant results
3. Click **category chips** — filter by Technology, Business, Science, etc.
4. Toggle between **Grid** and **List** view modes
5. Switch sort tabs: **Newest**, **Trending**, **Most Read**

### Step 7: Test Subscription Flow (Stripe)

1. Go to `/plans`
2. Notice "Your plan" badge on Premium card (since you're admin)
3. Open a **new incognito window** → login as **Reader** (free plan)
4. Go to `/plans` → click **"Start Standard"**
5. Use test card: `4242 4242 4242 4242`, expiry `12/29`, CVC `123`
6. After payment → redirected to `/account` with success banner
7. Plan updates to "Standard — Active" without re-login

### Step 8: CMS Content Management

1. Open https://adamnews-production.up.railway.app/admin
2. Login: `mohdadam020324@gmail.com` / `Editor912`
3. Go to **Content Manager → Articles** — see all 67 articles
4. Edit an article → change title → **Save** → **Publish**
5. Webhook fires automatically → frontend revalidates
6. Verify the change appears at https://adam-news.vercel.app within seconds

### Step 9: AI Intelligence Features (Multi-Model: Groq + Gemini)

Adam News includes a full AI intelligence layer powered by a **multi-model routing architecture** — Groq LLaMA 3.1 70B (primary for analysis, chat, digest, suggestions) and Google Gemini 2.5 Flash (primary for translation, fallback for all). Every feature is production-grade with Redis caching, per-provider rate limiting, automatic failover, and graceful error handling. Total cost: **RM 0** (dual free tiers).

#### 9.1: AI Article Intelligence Panel

1. Open any article (e.g., click a Technology article from homepage)
2. Look for the **"AI Intelligence"** panel below the article toolbar
3. Click to expand — watch the AI analyze the article in real-time
4. You'll see:
   - **TL;DR** — one-sentence summary
   - **Key Takeaways** — 3-5 bullet points
   - **Sentiment badge** — Positive / Neutral / Negative / Mixed
   - **Fact-Check badge** — Verified / Unverified / Mixed
   - **Reading Level** — grade level indicator
   - **Entities** — people, organizations, locations mentioned
   - **Topics** — auto-generated topic tags
5. Close and re-open — notice **"CACHED"** badge (served from Redis, no AI call)
6. Try on another article — see different analysis

#### 9.2: Language Toggle (BM <-> EN)

1. On the same article page, find the **"Read in [EN] [BM]"** toggle
2. Click **BM** — watch the article translate to Bahasa Malaysia
3. Notice: title and full body content update
4. Click **EN** — instantly returns to English (cached, no API call)
5. If Audio Mode is playing, the voice switches to Malay automatically

#### 9.3: Audio Mode (Listen to Article)

1. Find the **AUDIO MODE** bar above the article body
2. Click **"Listen"** — the article starts reading aloud
3. Notice: waveform animation and progress bar tracking position
4. Use **Pause** and **Stop** controls
5. Switch language to BM, then play — reads in Malay voice
6. **Zero API cost** — uses browser-native Web Speech API

#### 9.4: Ask This Article (AI Chat)

1. Scroll down on any article page
2. Find the **"Ask About This Article"** chat widget
3. Click a **suggested question** or type your own
4. Watch the AI response appear
5. Note: the AI only answers from the article content — no hallucination
6. Try asking: "What does this mean for Malaysia?" or "Summarize in one sentence"

#### 9.5: AI Morning Digest

1. Read 3-4 articles from different categories (this builds your interest profile)
2. Navigate to **`/digest`**
3. Watch the AI generate a personalized morning briefing
4. You'll see:
   - Curated headline for today
   - Personalized intro mentioning your interests
   - Prioritized stories with urgency badges (high / medium / low)
   - Closing note
5. Note: digest is shared-cached by interest profile (multiple similar readers share the same cached digest)

#### 9.6: AI Editor Tools (Admin Dashboard)

1. Navigate to **/dashboard** (must be signed in as Admin)
2. Scroll down to find the **"AI Editor Tools"** section
3. Click **"Analyze Article"** to see:
   - **3 alternative headlines** with predicted engagement scores
   - **SEO suggestions** (keyword placement, meta description, internal links)
   - **Auto-generated tags** for the article
   - **Suggested excerpt** optimized for click-through
4. This demonstrates editorial AI tools — critical for media companies managing 30+ brands

---

## AI Requirements Coverage

| Requirement | Implementation | Where to Verify |
|------------|----------------|-----------------|
| **AI Content Analysis** | Multi-model AI article intelligence (summary, sentiment, entities, fact-check) | Expand AI panel on any article page |
| **Multilingual AI** | BM <-> EN translation for Malaysia's diverse audience | Language toggle on article page |
| **Text-to-Speech** | Browser-native Web Speech API with EN/BM voices | Audio Mode on article page |
| **Conversational AI** | Grounded Q&A chat scoped to article content | Chat widget on article page |
| **AI Personalization** | Interest-based morning digest | `/digest` page |
| **AI Editorial Tools** | Headline optimizer, SEO suggestions, auto-tags | Admin dashboard |
| **Production Caching** | All AI responses cached in Redis (7-30 day TTL) | Second request shows "CACHED" badge |
| **Rate Limiting** | Per-provider rate limits (Groq 25 RPM, Gemini 8 RPM) | Rate limit countdown on heavy usage |
| **Cost: RM 0** | Entire AI layer runs on Groq + Gemini free tiers | All features work without billing |

---

## Mobile Testing Checklist

| Feature | How to Test |
|---------|-------------|
| Responsive layout | Resize browser to mobile width or use DevTools |
| Mobile nav drawer | Tap hamburger icon → slide-out drawer with all links |
| Demo banner | Visible at top on mobile for unauthenticated users |
| API Docs & Architecture | Available in mobile drawer → Explore section (visible to all users) |
| Touch carousel | Swipe hero carousel on mobile |
| Touch-friendly cards | All buttons and links have adequate tap targets |
| Dark mode | Toggle from mobile drawer or top utility bar |
| Reading progress | Scroll through article on mobile — progress bar at top |

---

## Performance Verification

| Metric | How to Verify |
|--------|---------------|
| **LCP** (Largest Contentful Paint) | Run Lighthouse → check LCP < 2.5s |
| **CLS** (Cumulative Layout Shift) | Scroll through pages — no content jumping |
| **INP** (Interaction to Next Paint) | Click buttons/links — instant response |
| **API latency** | `/api-docs` → "Try it" shows response time in ms |
| **Health status** | `/api/health` → system status + dependency latency |
| **Cache headers** | Inspect response headers on article pages (ISR cache tags) |
| **Image optimization** | DevTools Network tab → images served as WebP/AVIF |
| **Bundle size** | DevTools → Coverage tab → check JS coverage |

---

## Key Technical Patterns

These patterns directly address senior full-stack requirements:

| Pattern | File | What It Demonstrates |
|---------|------|---------------------|
| ISR with webhook revalidation | `src/app/api/revalidate/route.ts` | Content freshness without rebuilding entire site |
| Token bucket rate limiting | `src/lib/rate-limit.ts` | Production-grade API protection via Redis |
| Zod input validation | `src/lib/validations.ts` | Type-safe request parsing with descriptive errors |
| Cache-aside with Redis | `src/lib/redis.ts` | Multi-layer caching with graceful fallback |
| JWT session management | `src/lib/auth.ts` | Stateless auth with role-based access control |
| Stripe webhook verification | `src/app/api/stripe/webhook/route.ts` | HMAC signature verification for payment security |
| Structured JSON logging | `src/lib/logger.ts` | Production monitoring with timing and metadata |
| Content pipeline | Strapi → Webhook → Revalidate → CDN | End-to-end editorial workflow |
| Multi-model AI routing | `src/lib/ai/router.ts` | Task-based model selection with automatic failover (Groq → Gemini) |
| Structured AI output | `src/app/api/ai/*/route.ts` | JSON mode with typed responses and Zod validation |
| Graceful AI fallback | `src/app/api/ai/analyze/route.ts` | Never crashes — falls back to secondary provider, then static data |
| Browser-native TTS | `src/components/article/AudioMode.tsx` | Web Speech API for zero-cost article reading |

---

## Stripe Test Cards

| Card Number | Result |
|------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 0002` | Payment declined |
| `4000 0025 0000 3155` | 3D Secure required |

Use any future expiry, any 3-digit CVC, any cardholder name.

---

## Architecture at a Glance

```
Frontend:  Next.js 16 (ISR + SSG + CSR) → Vercel Edge CDN
Backend:   14 API routes with rate limiting + Zod validation
CMS:       Strapi v4 (headless) → REST API + webhooks
Database:  PostgreSQL 16 (Railway)
Cache:     Upstash Redis (cache-aside + rate limiting + AI cache)
Payments:  Stripe Checkout (subscriptions + webhooks)
Auth:      NextAuth v5 (JWT + OAuth + credentials)
AI:        Groq LLaMA 3.1 70B + Gemini 2.5 Flash (multi-model router with failover)
Audio:     Web Speech API (browser-native TTS, zero cost)
Testing:   Vitest (41 unit tests) + Playwright (22 E2E tests), GitHub Actions CI
DevOps:    Docker Compose (4 services), Vercel + Railway deploy
```

---

*Built by Mohamed Adam as a Senior Full-Stack Developer portfolio project for REV Media Group.*
*Full technical documentation: [ARCHITECTURE.md](./ARCHITECTURE.md)*

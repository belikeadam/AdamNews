# AdamNews — Build Plan

## File Creation Order (dependencies first)

### Phase 1 — Clean Slate
1. Delete: `src/`, `revmedia-mvp.jsx`, `index.html`, `vite.config.js`
2. Scaffold: `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git`

### Phase 2 — Docker & Infrastructure
3. `docker-compose.yml` — 4 services (postgres, redis, strapi, web)
4. `cms/Dockerfile` — Strapi production build
5. `Dockerfile` — Next.js production build
6. `.env.example` — all environment variables documented

### Phase 3 — Types (no dependencies)
7. `src/types/strapi.ts` — Strapi response wrapper types + content types
8. `src/types/auth.ts` — Session, user, JWT types
9. `src/types/index.ts` — Re-exports

### Phase 4 — Constants (depend on types)
10. `src/constants/api.ts` — All API endpoints
11. `src/constants/plans.ts` — Subscription plans
12. `src/constants/nav.ts` — Navigation items
13. `src/constants/meta.ts` — SEO defaults

### Phase 5 — Lib (depend on types + constants)
14. `src/lib/utils.ts` — formatDate, readTime, cn()
15. `src/lib/api/strapi.ts` — Centralized Strapi REST client
16. `src/lib/api/graphql.ts` — GraphQL client + queries
17. `src/lib/api/stripe.ts` — Stripe helpers
18. `src/lib/redis.ts` — Upstash Redis client
19. `src/lib/auth.ts` — NextAuth config (auth.ts)
20. `src/auth.config.ts` — Edge-safe auth config

### Phase 6 — Hooks (depend on lib)
21. `src/hooks/useToast.ts` — Toast notifications
22. `src/hooks/useAuth.ts` — Auth state helpers
23. `src/hooks/useMediaQuery.ts` — Responsive helpers

### Phase 7 — UI Components (primitives, no dependencies)
24. `src/components/ui/Button.tsx`
25. `src/components/ui/Badge.tsx`
26. `src/components/ui/Card.tsx`
27. `src/components/ui/Input.tsx`
28. `src/components/ui/Modal.tsx`
29. `src/components/ui/Skeleton.tsx`

### Phase 8 — Shared Components (depend on UI)
30. `src/components/shared/RenderBadge.tsx` — SSR/ISR/SSG/CSR badges
31. `src/components/shared/ArchCallout.tsx` — "How this works" collapsible
32. `src/components/shared/Toast.tsx` — Toast notification component
33. `src/components/shared/DemoBanner.tsx` — Demo credentials banner

### Phase 9 — Layout Components (depend on UI + shared)
34. `src/components/layout/Navbar.tsx`
35. `src/components/layout/TechBar.tsx`
36. `src/components/layout/Footer.tsx`
37. `src/components/layout/Sidebar.tsx` — Dashboard sidebar
38. `src/components/layout/MobileNav.tsx` — Bottom tab nav

### Phase 10 — Domain Components
39. `src/components/reader/ArticleCard.tsx`
40. `src/components/reader/HeroArticle.tsx`
41. `src/components/reader/CategoryFilter.tsx`
42. `src/components/article/ArticleBody.tsx`
43. `src/components/article/PaywallGate.tsx`
44. `src/components/article/AuthorBio.tsx`
45. `src/components/auth/LoginStepper.tsx`
46. `src/components/auth/OAuthButton.tsx`
47. `src/components/dashboard/MetricCard.tsx`
48. `src/components/dashboard/PostsTable.tsx`
49. `src/components/dashboard/Editor.tsx`
50. `src/components/dashboard/Chart.tsx`

### Phase 11 — Root Layout & Providers
51. `src/app/providers.tsx` — SessionProvider, ToastProvider, ThemeProvider
52. `src/app/layout.tsx` — Root layout with navbar, tech bar, font
53. `src/app/globals.css` — CSS variables, dark mode, Tailwind

### Phase 12 — Pages
54. `src/app/page.tsx` — Reader home (ISR)
55. `src/app/articles/[slug]/page.tsx` — Article detail (ISR + paywall)
56. `src/app/login/page.tsx` — Step-by-step auth
57. `src/app/plans/page.tsx` — Subscription plans
58. `src/app/dashboard/layout.tsx` — Dashboard shell
59. `src/app/dashboard/page.tsx` — Overview metrics
60. `src/app/dashboard/posts/page.tsx` — Posts list
61. `src/app/dashboard/posts/[id]/edit/page.tsx` — Post editor
62. `src/app/dashboard/analytics/page.tsx` — Analytics
63. `src/app/dashboard/subscribers/page.tsx` — Subscribers
64. `src/app/api-docs/page.tsx` — API reference

### Phase 13 — API Routes
65. `src/app/api/auth/[...nextauth]/route.ts`
66. `src/app/api/stripe/checkout/route.ts`
67. `src/app/api/stripe/webhook/route.ts`
68. `src/app/api/revalidate/route.ts`

### Phase 14 — Middleware
69. `src/middleware.ts` — Auth guard for dashboard + stripe routes

### Phase 15 — Strapi CMS
70. `cms/package.json`
71. `cms/config/database.js`
72. `cms/config/server.js`
73. `cms/config/plugins.js` — GraphQL, Users & Permissions
74. `cms/src/api/article/content-types/article/schema.json`
75. `cms/src/api/article/content-types/article/lifecycles.js`
76. `cms/src/api/category/content-types/category/schema.json`
77. `cms/src/api/author/content-types/author/schema.json`
78. `cms/scripts/seed.ts`

### Phase 16 — Deployment
79. `vercel.json`
80. `.github/workflows/deploy.yml`
81. `README.md`

---

## Environment Variables

| Variable | Used In | Description |
|---|---|---|
| `POSTGRES_PASSWORD` | docker-compose.yml, Strapi | PostgreSQL password |
| `REDIS_PASSWORD` | docker-compose.yml | Redis auth password |
| `STRAPI_JWT_SECRET` | Strapi | JWT signing for Strapi Users & Permissions |
| `STRAPI_ADMIN_JWT_SECRET` | Strapi | Admin panel JWT |
| `STRAPI_APP_KEYS` | Strapi | Comma-separated app keys |
| `STRAPI_API_TOKEN` | Next.js (server) | Strapi API token for server-side fetches |
| `NEXT_PUBLIC_STRAPI_URL` | Next.js (client+server) | Public Strapi URL (http://localhost:1337) |
| `STRAPI_URL` | Next.js (server) | Internal Docker Strapi URL (http://strapi:1337) |
| `NEXTAUTH_URL` | NextAuth | App URL (http://localhost:3000) |
| `NEXTAUTH_SECRET` | NextAuth | Session encryption secret |
| `AUTH_GOOGLE_ID` | NextAuth | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | NextAuth | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | Next.js (server) | Stripe secret key (sk_test_...) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Next.js (client) | Stripe publishable key (pk_test_...) |
| `STRIPE_WEBHOOK_SECRET` | Next.js (server) | Stripe webhook signing secret (whsec_...) |
| `STRIPE_STANDARD_MONTHLY_PRICE_ID` | Next.js (server) | Stripe price ID for Standard monthly |
| `STRIPE_STANDARD_ANNUAL_PRICE_ID` | Next.js (server) | Stripe price ID for Standard annual |
| `STRIPE_PREMIUM_MONTHLY_PRICE_ID` | Next.js (server) | Stripe price ID for Premium monthly |
| `STRIPE_PREMIUM_ANNUAL_PRICE_ID` | Next.js (server) | Stripe price ID for Premium annual |
| `UPSTASH_REDIS_REST_URL` | Next.js (server/edge) | Upstash Redis REST URL (production) |
| `UPSTASH_REDIS_REST_TOKEN` | Next.js (server/edge) | Upstash Redis REST token (production) |
| `DATABASE_URL` | Next.js (server) | Neon.tech PostgreSQL URL (production) |

---

## Database Schema

### Strapi-managed tables (auto-created by content types):

**articles**
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| title | varchar(255) | NOT NULL |
| slug | varchar(255) | UNIQUE, NOT NULL |
| excerpt | text | |
| body | jsonb | Rich text blocks |
| premium | boolean | DEFAULT false |
| trending | boolean | DEFAULT false |
| views | integer | DEFAULT 0 |
| read_time | varchar(50) | |
| tags | jsonb | |
| published_at | timestamp | Nullable (draft system) |
| created_at | timestamp | |
| updated_at | timestamp | |

**categories**
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | UNIQUE |
| color | varchar(7) | Hex color |
| description | text | |

**authors**
| Column | Type | Constraints |
|---|---|---|
| id | serial | PK |
| name | varchar(255) | NOT NULL |
| role | varchar(255) | |
| bio | text | |
| email | varchar(255) | |

**Relations:**
- `articles.category` → many-to-one → `categories.id`
- `articles.author` → many-to-one → `authors.id`
- `articles.cover` → one-to-one → `files.id` (Strapi media)
- `authors.avatar` → one-to-one → `files.id` (Strapi media)

**Strapi Users & Permissions (built-in):**
| Column | Type | Notes |
|---|---|---|
| id | serial | PK |
| username | varchar | |
| email | varchar | UNIQUE |
| password | varchar | bcrypt hashed |
| role | FK → roles | authenticated / public |
| plan | varchar | free / standard / premium (custom field) |
| stripe_customer_id | varchar | Stripe link |
| stripe_subscription_id | varchar | Active subscription |

---

## API Routes

### Next.js API Routes

| Method | Path | Auth | Description | Response |
|---|---|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Public | NextAuth handler | Session/JWT |
| POST | `/api/stripe/checkout` | Authenticated | Create Stripe Checkout Session | `{ url: string }` |
| POST | `/api/stripe/webhook` | Stripe signature | Handle Stripe events | `{ received: true }` |
| POST | `/api/revalidate` | Webhook secret | ISR revalidation trigger | `{ revalidated: true }` |

### Strapi REST API (proxied via lib/api/strapi.ts)

| Method | Path | Auth | Description | Response |
|---|---|---|---|---|
| GET | `/api/articles?populate=*&sort=publishedAt:desc` | Public | List articles | `StrapiCollectionResponse<Article>` |
| GET | `/api/articles?filters[slug][$eq]={slug}&populate=*` | Public | Single article | `StrapiCollectionResponse<Article>` |
| GET | `/api/articles?filters[trending][$eq]=true&populate=*` | Public | Trending articles | `StrapiCollectionResponse<Article>` |
| GET | `/api/categories` | Public | List categories | `StrapiCollectionResponse<Category>` |
| GET | `/api/authors?populate=*` | Public | List authors | `StrapiCollectionResponse<Author>` |
| POST | `/api/articles` | Admin token | Create article | `StrapiSingleResponse<Article>` |
| PUT | `/api/articles/{id}` | Admin token | Update article | `StrapiSingleResponse<Article>` |
| DELETE | `/api/articles/{id}` | Admin token | Delete article | `{ data: null }` |
| POST | `/api/auth/local` | Public | Strapi user login | `{ jwt, user }` |
| POST | `/api/auth/local/register` | Public | Register user | `{ jwt, user }` |

### Strapi GraphQL

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/graphql` | Public/Token | GraphQL queries |

---

## Component Tree per Page

### `/` (Reader Home)
```
RootLayout
├── Navbar
├── TechBar [ISR · 60s] [Strapi REST] [Redis: HIT]
├── ReaderHomePage
│   ├── ArchCallout "How ISR works"
│   ├── HeroArticle (featured article)
│   ├── CategoryFilter (horizontal scroll)
│   ├── main (grid)
│   │   └── ArticleCard[] (each with RenderBadge, premium lock)
│   └── aside (desktop)
│       ├── TrendingNow widget
│       ├── WebVitals widget
│       └── SubscriberCount widget
├── Footer
└── MobileNav (mobile only)
```

### `/articles/[slug]` (Article Detail)
```
RootLayout
├── Navbar
├── TechBar [ISR · 60s] [Cache-Control: s-maxage=60]
├── ArticleDetailPage
│   ├── Breadcrumb
│   ├── RenderBadge toolbar
│   ├── ArticleBody (full or truncated if premium)
│   ├── PaywallGate (premium only — gradient fade + plan cards)
│   ├── AuthorBio card
│   ├── ShareButtons (copy, Twitter/X, WhatsApp)
│   ├── ArchCallout "How this article is rendered"
│   └── RelatedArticles (3 cards, same category)
├── Footer
└── MobileNav
```

### `/login` (Login)
```
RootLayout
├── Navbar
├── TechBar [SSR] [NextAuth v5] [JWT]
├── LoginPage
│   ├── DemoBanner (dismissible)
│   ├── OAuthButton "Continue with Google"
│   ├── Divider "or"
│   └── LoginStepper
│       ├── Step 1: Email input → Next button
│       ├── Step 2: User chip + Password input → Back / Sign In
│       └── Step 3: Success toast → redirect
├── Footer
└── MobileNav
```

### `/plans` (Subscription Plans)
```
RootLayout
├── Navbar
├── TechBar [SSR] [Stripe Checkout] [JWT claims]
├── PlansPage
│   ├── Monthly/Annual toggle
│   ├── PlanCard × 3 (Reader, Standard, Premium)
│   │   ├── Name, price, features checklist
│   │   ├── "Most popular" badge (Standard)
│   │   └── CTA Button → checkout flow
│   └── TechNote footer
├── Footer
└── MobileNav
```

### `/dashboard` (Admin Dashboard)
```
DashboardLayout
├── Navbar
├── DemoBanner
├── Sidebar (desktop) / MobileNav (mobile)
│   ├── Overview
│   ├── Posts
│   ├── Analytics
│   └── Subscribers
├── TechBar [CSR] [Protected] [Admin only]
└── {children}
```

**Overview `/dashboard`:**
```
├── MetricCard × 4 (Articles, Subscribers, MRR, Churn)
├── PageviewsChart (14-day bar chart)
├── TopPagesTable
└── WebVitalsTable
```

**Posts `/dashboard/posts`:**
```
├── FilterTabs (All / Published / Draft / Scheduled)
├── "+ New Post" Button
└── PostsTable (title, status pill, author, category, views, premium, date, actions)
```

**Editor `/dashboard/posts/[id]/edit`:**
```
├── Step 1: Title input + Tiptap rich text editor + Cover image upload
├── Step 2 sidebar: Category, Author, SEO, Date, Premium toggle
└── ActionBar: Save Draft / Preview / Publish
```

**Analytics `/dashboard/analytics`:**
```
├── MetricCard × 4 (Pageviews, Readers, Avg Time, Scroll Depth)
├── TrafficSourceChart (horizontal bar)
├── GeographyChart (top 5 countries)
└── ArchCallout "GA4 + Chartbeat integration"
```

**Subscribers `/dashboard/subscribers`:**
```
├── MetricCard × 4 (Subscribers, MRR, Churn, ARPU)
├── SubscribersTable (email, plan, MRR, status, joined, sessions)
├── Export CSV button
└── ArchCallout "Stripe + JWT + Redis"
```

### `/api-docs` (API Reference)
```
RootLayout
├── Navbar
├── TechBar [SSG] [REST + GraphQL]
├── ApiDocsPage (3-column)
│   ├── NavSidebar (endpoint list)
│   ├── EndpointDetail
│   │   ├── MethodBadge + Path
│   │   ├── Description
│   │   ├── ParametersTable
│   │   ├── CurlExample
│   │   └── "Try it" Button
│   └── ResponsePanel
│       ├── StatusCode + latency
│       └── Formatted JSON
├── Footer
└── MobileNav
```

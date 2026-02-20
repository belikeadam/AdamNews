# AdamNews

A modern news platform built with Next.js 14 App Router, Strapi v4 CMS, NextAuth.js v5, and Stripe. Features ISR, server components, real-time content management, and a subscription paywall.

## Local Development

```bash
git clone https://github.com/your-username/AdamNews
cp .env.example .env          # Fill in your values
docker compose up             # Starts everything
```

Open http://localhost:3000

**Demo login:** admin@AdamNews.com / demo1234

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, React Server Components, Tailwind CSS |
| CMS | Strapi v4 (REST + GraphQL) |
| Auth | NextAuth.js v5 (Credentials + Google OAuth, JWT) |
| Payments | Stripe Checkout + Webhooks |
| Database | PostgreSQL 15 (Neon.tech in production) |
| Cache | Redis 7 / Upstash (production) |
| Deployment | Vercel (Next.js) + Railway (Strapi) |

## Pages

- `/` — Reader home (ISR, 60s revalidation)
- `/articles/[slug]` — Article detail with paywall
- `/login` — Step-by-step authentication
- `/plans` — Subscription plans with Stripe
- `/dashboard` — Admin dashboard (protected)
- `/api-docs` — Interactive API reference

## Project Structure

```
src/
├── app/          Routes and API handlers
├── components/   UI, layout, domain components
├── lib/          API clients, auth, utilities
├── constants/    Centralized config (zero hardcoded URLs)
├── types/        TypeScript interfaces
├── hooks/        Client-side hooks
└── middleware.ts  Auth guard

cms/              Strapi v4 CMS
├── config/       Database, server, plugins
├── src/api/      Content type schemas
└── scripts/      Seed script (DEV.to data)
```

# AdamNews — Deployment & Operations Guide

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start (Docker)](#quick-start-docker)
- [Seeding Content](#seeding-content)
- [Strapi CMS Admin](#strapi-cms-admin)
- [Environment Variables](#environment-variables)
- [Production Deployment](#production-deployment)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│  Strapi CMS  │────▶│  PostgreSQL   │
│  (port 3000) │     │ (port 1337)  │     │  (port 5433)  │
└──────────────┘     └──────────────┘     └──────────────┘
       │                                         │
       │              ┌──────────────┐            │
       └─────────────▶│    Redis     │◀───────────┘
                      │ (port 6379)  │
                      └──────────────┘
```

| Service    | Technology             | Purpose                        |
|------------|------------------------|--------------------------------|
| **web**    | Next.js 16 + React 19  | Frontend SSR, API routes       |
| **strapi** | Strapi 4.25            | Headless CMS, content API      |
| **postgres** | PostgreSQL 16        | Primary database               |
| **redis**  | Redis 7                | Caching, rate limiting         |

---

## Quick Start (Docker)

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Node.js 20.x (for running the seed script locally)
- 4 GB RAM minimum

### 1. Start all services

```bash
docker compose up --build -d
```

This starts PostgreSQL, Redis, Strapi, and Next.js. First boot takes ~2 minutes while Strapi runs database migrations.

### 2. Verify services are running

```bash
docker compose ps
```

| Service    | URL                          | Expected Status |
|------------|------------------------------|-----------------|
| Next.js    | http://localhost:3000         | Up              |
| Strapi     | http://localhost:1337/admin   | Up              |
| PostgreSQL | localhost:5433               | healthy         |
| Redis      | localhost:6379               | healthy         |

### 3. Create Strapi admin account

1. Open http://localhost:1337/admin
2. Fill in: First name, Last name, Email, Password
3. Click **Let's start** — you are now the Super Admin

### 4. Seed content

```bash
cd cms
npx ts-node scripts/seed.ts
```

This fetches real articles from the Dev.to API and creates ~24 articles, 4 categories, and ~15 authors in Strapi.

### 5. Open the site

- **Frontend:** http://localhost:3000
- **Strapi Admin:** http://localhost:1337/admin

---

## Seeding Content

The seed script (`cms/scripts/seed.ts`) pulls real developer articles from the **Dev.to API** (free, no authentication required).

### What it creates

| Content Type | Count  | Source                                    |
|-------------|--------|-------------------------------------------|
| Categories  | 4      | Technology, Business, Science, General     |
| Authors     | ~15    | Extracted from Dev.to article authors      |
| Articles    | ~24    | Top articles across 6 Dev.to tags          |

### Running the seed

```bash
cd cms
npx ts-node scripts/seed.ts
```

### Re-seeding (fresh data)

To re-seed with fresh content, reset the database first:

```bash
# Stop and remove volumes (deletes all data)
docker compose down -v

# Start fresh
docker compose up --build -d

# Wait ~60s for Strapi to finish booting, then seed
cd cms && npx ts-node scripts/seed.ts
```

### Seed environment variables

| Variable           | Default                 | Description                 |
|-------------------|-------------------------|-----------------------------|
| `STRAPI_URL`      | `http://localhost:1337` | Strapi API base URL         |
| `STRAPI_API_TOKEN`| (empty)                 | Optional API token for auth |

---

## Strapi CMS Admin

### First-time setup

1. Open http://localhost:1337/admin
2. Create your admin account (first user becomes Super Admin)
3. Fill in: First name, Last name, Email, Password

### Admin panel sections

| Section          | Path                             | Purpose                                  |
|-----------------|-----------------------------------|------------------------------------------|
| Content Manager | `/admin/content-manager`          | Create/edit articles, categories, authors |
| Media Library   | `/admin/media-library`            | Upload and manage images                  |
| Settings        | `/admin/settings`                 | API tokens, roles, permissions            |
| API Tokens      | `/admin/settings/api-tokens`      | Generate tokens for external access       |

### Content types

| Type     | Key Fields                                                                           |
|---------|--------------------------------------------------------------------------------------|
| Article | title, slug, excerpt, body, cover, coverUrl, category, author, premium, trending, readTime, views, tags |
| Category| name, slug, color, description                                                        |
| Author  | name, role, bio, email, avatar                                                        |

### Creating an article

1. Go to **Content Manager** > **Article**
2. Click **Create new entry**
3. Fill required fields: title, slug, body (markdown or rich text)
4. Assign a **category** and **author** via the relation dropdowns
5. Toggle `premium` for paywall content, `trending` for homepage carousel
6. Click **Publish**

### Generating an API token

1. Go to **Settings** > **API Tokens** > **Create new API Token**
2. Name: `NextJS Frontend`, Token type: `Full access`
3. Click **Save** and copy the token
4. Add it to your `.env` as `STRAPI_API_TOKEN`

### Verifying public API permissions

The bootstrap script auto-configures public read access. To verify manually:

1. Go to **Settings** > **Users & Permissions** > **Roles** > **Public**
2. Under each content type (Article, Category, Author), ensure `find` and `findOne` are checked
3. Click **Save**

### Testing the API

```bash
# List all articles
curl http://localhost:1337/api/articles?populate=*

# Get a single article by slug
curl "http://localhost:1337/api/articles?filters[slug][$eq]=your-article-slug&populate=*"

# List categories
curl http://localhost:1337/api/categories
```

---

## Environment Variables

### Setup

```bash
cp .env.example .env
# Edit .env and fill in your values
```

### Core variables (development defaults provided)

| Variable                   | Default (dev)                          | Description                    |
|---------------------------|----------------------------------------|--------------------------------|
| `POSTGRES_PASSWORD`       | `kollect_dev_2024`                     | PostgreSQL password            |
| `REDIS_PASSWORD`          | `redis_dev_2024`                       | Redis password                 |
| `STRAPI_JWT_SECRET`       | `strapi_jwt_secret_dev_key_32chars!`   | JWT signing secret             |
| `STRAPI_ADMIN_JWT_SECRET` | `strapi_admin_jwt_dev_key_32chars!`    | Admin JWT secret               |
| `STRAPI_APP_KEYS`         | `key1_dev_abcdef,...`                  | Strapi application keys        |
| `NEXTAUTH_SECRET`         | `dev_nextauth_secret_32characters!`    | NextAuth session encryption    |
| `NEXTAUTH_URL`            | `http://localhost:3000`                | Public URL for auth callbacks  |
| `NEXT_PUBLIC_STRAPI_URL`  | `http://localhost:1337`                | Strapi URL (browser-side)      |
| `STRAPI_URL`              | `http://strapi:1337`                   | Strapi URL (server/Docker)     |

### Optional (for full features)

| Variable                               | Purpose                    |
|---------------------------------------|----------------------------|
| `AUTH_GOOGLE_ID`                      | Google OAuth client ID     |
| `AUTH_GOOGLE_SECRET`                  | Google OAuth client secret |
| `STRIPE_SECRET_KEY`                   | Stripe payments            |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | Stripe public key          |
| `STRIPE_WEBHOOK_SECRET`              | Stripe webhook verification |
| `UPSTASH_REDIS_REST_URL`             | Production Redis (Upstash) |
| `UPSTASH_REDIS_REST_TOKEN`           | Upstash authentication     |

### Generating secrets

```bash
# Generate a random 32-character secret
openssl rand -base64 32
```

---

## Production Deployment

### Option A: Railway (Strapi) + Vercel (Next.js)

**Deploy Strapi to Railway:**

1. Create a new project at [railway.app](https://railway.app)
2. Add a PostgreSQL service (or use Neon for serverless Postgres)
3. Deploy from GitHub — set **Root Directory** to `cms`
4. Add environment variables:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `NODE_ENV` = `production`
   - `HOST` = `0.0.0.0`
   - `PORT` = `1337`
   - Generate secrets for: `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `JWT_SECRET`, `TRANSFER_TOKEN_SALT`
5. Get the public URL from Settings > Domains

**Deploy Next.js to Vercel:**

1. Import from GitHub at [vercel.com](https://vercel.com)
2. Framework: Next.js (auto-detected)
3. Add environment variables:
   - `NEXT_PUBLIC_STRAPI_URL` = your Railway Strapi URL
   - `STRAPI_API_TOKEN` = token from Strapi admin
   - `NEXTAUTH_URL` = your Vercel URL
   - `NEXTAUTH_SECRET` = generate with `openssl rand -base64 32`
   - Add Google OAuth, Stripe, and Upstash variables as needed

### Option B: Docker Compose on VPS

1. Clone the repo to your server
2. Create `.env` with production secrets
3. Build and start:
   ```bash
   docker compose up --build -d
   ```
4. Set up a reverse proxy (Nginx or Caddy) for HTTPS

**Example Nginx config:**

```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    server_name cms.yourdomain.com;
    location / {
        proxy_pass http://localhost:1337;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Post-deployment checklist

After deploying both services:

1. Create Strapi admin account at `https://your-strapi-url/admin`
2. Generate an API token and update `STRAPI_API_TOKEN` in Vercel
3. Run the seed script pointing at your production Strapi:
   ```bash
   cd cms
   STRAPI_URL=https://your-strapi-url STRAPI_API_TOKEN=your-token npx ts-node scripts/seed.ts
   ```
4. Set up Stripe webhook endpoint: `https://your-domain/api/stripe/webhook`
5. Add Google OAuth redirect URI: `https://your-domain/api/auth/callback/google`

---

## Common Operations

### Restart a single service

```bash
docker compose restart web      # Restart Next.js
docker compose restart strapi   # Restart Strapi
```

### View logs

```bash
docker compose logs -f web      # Follow Next.js logs
docker compose logs -f strapi   # Follow Strapi logs
docker compose logs -f postgres # Follow database logs
```

### Rebuild after code changes

```bash
# Rebuild Next.js only
docker compose up --build -d web

# Rebuild everything
docker compose up --build -d
```

### Access the database directly

```bash
docker compose exec postgres psql -U kollect -d AdamNews
```

### Full reset (delete all data)

```bash
docker compose down -v          # Stop and remove all volumes
docker compose up --build -d    # Fresh start
```

---

## Troubleshooting

### Strapi won't start

- **Check logs:** `docker compose logs strapi`
- **Common cause:** PostgreSQL not ready yet — wait 30s and check again
- **Port conflict:** Ensure port 1337 is free

### Articles not showing on frontend

1. Verify Strapi is running: http://localhost:1337/api/articles
2. Check public role permissions in Strapi Admin
3. Run the seed script if no content exists
4. Restart Next.js: `docker compose restart web`

### Images not loading

- External images from Dev.to CDN are allowed via `next.config.ts` remote patterns
- If adding new image domains, update `next.config.ts` and rebuild the web service

### Hydration errors

- All dates use `timeZone: 'UTC'` in formatting to prevent server/client mismatches
- Clear the `.next` cache and restart: `docker compose restart web`

### Search page not returning results

- The search page queries Strapi directly from the browser via `NEXT_PUBLIC_STRAPI_URL`
- Ensure Strapi is accessible from the browser at that URL
- Verify article `find` permission is enabled for the Public role

### CORS issues

- `NEXT_PUBLIC_STRAPI_URL` is used for browser requests, `STRAPI_URL` for server-side Docker network requests
- Ensure both are correctly set in your environment

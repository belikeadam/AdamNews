import { Metadata } from 'next'
import TechBar from '@/components/layout/TechBar'
import HeroArticle from '@/components/reader/HeroArticle'
import ArticleCard from '@/components/reader/ArticleCard'
import ArchCallout from '@/components/shared/ArchCallout'
import { getArticles, getTrendingArticles, getCategories } from '@/lib/api/strapi'
import HomeClient from './home-client'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'AdamNews | Modern News Platform',
  description:
    'A modern news platform built with Next.js, Strapi, and Stripe. Showcasing ISR, server components, and real-time content management.',
}

export default async function HomePage() {
  let articles, trending, categories

  try {
    ;[articles, trending, categories] = await Promise.all([
      getArticles({ pageSize: 12 }),
      getTrendingArticles(),
      getCategories(),
    ])
  } catch {
    // Strapi not available — render with demo data
    return <HomeFallback />
  }

  const featuredArticle = trending.data[0] || articles.data[0]
  const gridArticles = articles.data.filter(
    (a) => a.id !== featuredArticle?.id
  )

  return (
    <>
      <TechBar
        badges={[
          { label: 'ISR \u00b7 60s', tooltip: 'Page revalidates every 60 seconds', variant: 'warning' },
          { label: 'Strapi REST', tooltip: 'Content fetched from Strapi v4 REST API' },
          { label: 'Next.js App Router', tooltip: 'Using React Server Components' },
          { label: 'TypeScript', tooltip: 'Fully typed with TypeScript' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <ArchCallout
          apiCall="GET /api/articles?populate=*&sort=publishedAt:desc"
          caching="ISR revalidate: 60s, Redis cache-aside with 60s TTL"
          auth="Public — no authentication required"
          rationale="ISR balances freshness with performance. Stale content served while revalidating in background."
          className="mb-6"
        />

        {featuredArticle && (
          <section className="mb-8">
            <HeroArticle article={featuredArticle} />
          </section>
        )}

        <HomeClient
          articles={gridArticles}
          categories={categories.data}
          trending={trending.data}
        />
      </div>
    </>
  )
}

function HomeFallback() {
  return (
    <>
      <TechBar
        badges={[
          { label: 'ISR \u00b7 60s', tooltip: 'Page revalidates every 60 seconds', variant: 'warning' },
          { label: 'Strapi REST', tooltip: 'Content fetched from Strapi v4 REST API' },
          { label: 'Next.js App Router', tooltip: 'Using React Server Components' },
        ]}
      />
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
          AdamNews
        </h1>
        <p className="text-[var(--muted)] mb-6 max-w-xl mx-auto">
          A modern news platform built with Next.js 14 App Router, Strapi v4 CMS,
          NextAuth.js, and Stripe. Start the Strapi CMS to see articles here.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-[var(--surface)] border border-[var(--border)] rounded overflow-hidden"
            >
              <div className="aspect-[16/9] bg-[var(--surface-2)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[var(--surface-2)] rounded animate-pulse w-3/4" />
                <div className="h-3 bg-[var(--surface-2)] rounded animate-pulse" />
                <div className="h-3 bg-[var(--surface-2)] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-[var(--surface)] border border-[var(--border)] rounded p-6">
          <h2 className="font-semibold text-[var(--text)] mb-2">
            Getting Started
          </h2>
          <code className="text-sm text-[var(--muted)]">
            docker compose up &mdash; starts Postgres, Redis, Strapi &amp; Next.js
          </code>
        </div>
      </div>
    </>
  )
}

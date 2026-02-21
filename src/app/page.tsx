import { Metadata } from 'next'
import HeroCarousel from '@/components/reader/HeroCarousel'
import BreakingNewsBar from '@/components/reader/BreakingNewsBar'
import { getArticles, getTrendingArticles, getCategories } from '@/lib/api/strapi'
import HomeClient from './home-client'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'The Adam News | Independent Journalism',
  description:
    'Breaking news, in-depth analysis, and opinion. Independent journalism since 2024.',
}

interface HomePageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category } = await searchParams
  let articles, trending, categories

  try {
    ;[articles, trending, categories] = await Promise.all([
      getArticles({ pageSize: 30 }),
      getTrendingArticles(),
      getCategories(),
    ])
  } catch {
    return <HomeFallback />
  }

  // Carousel: trending articles, supplement with latest if needed
  const carouselArticles = trending.data.slice(0, 5)
  if (carouselArticles.length < 3) {
    const supplement = articles.data
      .filter((a) => !carouselArticles.find((c) => c.id === a.id))
      .slice(0, 3 - carouselArticles.length)
    carouselArticles.push(...supplement)
  }

  const carouselIds = new Set(carouselArticles.map((a) => a.id))
  const gridArticles = articles.data.filter((a) => !carouselIds.has(a.id))

  return (
    <>
      {/* Breaking news ticker */}
      {trending.data.length > 0 && (
        <BreakingNewsBar articles={trending.data.slice(0, 8)} />
      )}

      {carouselArticles.length > 0 && (
        <section>
          <HeroCarousel articles={carouselArticles} />
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 pb-8 overflow-x-hidden">
        <HomeClient
          articles={gridArticles}
          trending={trending.data}
          initialCategory={category || null}
        />
      </div>
    </>
  )
}

function HomeFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1
        className="text-4xl font-bold tracking-tight text-[var(--text)] mb-4"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        The Adam News
      </h1>
      <p className="text-[var(--muted)] mb-8 max-w-xl mx-auto text-lg">
        Start the Strapi CMS to see articles here.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-[var(--border)] overflow-hidden">
            <div className="aspect-[16/9] bg-[var(--surface-2)] animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-[var(--surface-2)] animate-pulse w-3/4" />
              <div className="h-3 bg-[var(--surface-2)] animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 border border-[var(--border)] p-8 max-w-md mx-auto">
        <h2 className="font-semibold text-[var(--text)] mb-2">Getting Started</h2>
        <code className="text-sm text-[var(--muted)]">
          docker compose up &mdash; starts Postgres, Redis, Strapi &amp; Next.js
        </code>
      </div>
    </div>
  )
}

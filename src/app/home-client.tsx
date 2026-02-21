'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ArticleCard from '@/components/reader/ArticleCard'
import CategoryFilter from '@/components/reader/CategoryFilter'
import AdSlot from '@/components/shared/AdSlot'
import { getArticleCoverUrl, formatDate, truncate } from '@/lib/utils'
import type { Article, Category } from '@/types'

interface HomeClientProps {
  articles: Article[]
  categories: Category[]
  trending: Article[]
  initialCategory?: string | null
}

export default function HomeClient({
  articles,
  categories,
  trending,
  initialCategory = null,
}: HomeClientProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug)
    // Sync URL so nav links and back/forward work
    router.push(slug ? `/?category=${slug}` : '/', { scroll: false })
  }

  const filtered = selectedCategory
    ? articles.filter(
        (a) => a.attributes.category?.data?.attributes?.slug === selectedCategory
      )
    : articles

  const leadArticle = filtered[0]
  const secondaryArticles = filtered.slice(1, 4)
  const remainingArticles = filtered.slice(4)

  // Group remaining by category
  const categoryGroups = new Map<string, Article[]>()
  for (const article of remainingArticles) {
    const catName = article.attributes.category?.data?.attributes?.name || 'General'
    if (!categoryGroups.has(catName)) categoryGroups.set(catName, [])
    categoryGroups.get(catName)!.push(article)
  }

  return (
    <>
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={handleCategorySelect}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[var(--muted)] text-lg">No articles in this category yet</p>
        </div>
      ) : (
        <>
          {/* NYT-style main grid */}
          <div className="grid grid-cols-1 md:grid-cols-[2fr,1px,1fr] gap-0 mt-6">
            {/* Lead story + secondary */}
            <div className="pr-0 md:pr-8">
              {leadArticle && <LeadArticle article={leadArticle} />}

              {secondaryArticles.length > 0 && (
                <>
                  <hr className="section-rule" />
                  <div className="grid sm:grid-cols-2 gap-6">
                    {secondaryArticles.map((a) => (
                      <ArticleCard key={a.id} article={a} variant="compact" />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Vertical rule */}
            <div className="hidden md:block bg-[var(--border)]" />

            {/* Sidebar */}
            <aside className="hidden md:block pl-8">
              <h3 className="section-label mb-4">Most Read</h3>
              <div className="space-y-5">
                {trending.slice(0, 5).map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.attributes.slug}`}
                    className="flex gap-3 group"
                  >
                    <span
                      className="text-2xl font-bold text-[var(--border)] leading-none mt-0.5"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p
                        className="text-sm font-semibold text-[var(--text)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
                        style={{ fontFamily: 'var(--font-headline)' }}
                      >
                        {article.attributes.title}
                      </p>
                      <p className="byline mt-1">
                        {article.attributes.readTime || '3 min read'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <hr className="section-rule my-6" />

              {/* Sidebar ad */}
              <AdSlot position="sidebar" className="mb-6" />

              {/* Newsletter */}
              <div className="bg-[var(--surface)] p-6 border border-[var(--border)]">
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  The Morning Briefing
                </h3>
                <p className="text-sm text-[var(--muted)] mb-4">
                  Get the day&apos;s top stories delivered every morning.
                </p>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full h-10 px-3 border border-[var(--border)] bg-[var(--bg)] text-sm mb-2 focus:outline-none focus:border-[var(--text)]"
                />
                <button className="w-full h-10 bg-[var(--text)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </div>
            </aside>
          </div>

          {/* Mobile trending */}
          {trending.length > 0 && (
            <section className="md:hidden mt-8">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="section-label">Most Read</h2>
                <hr className="flex-1 border-t border-[var(--border)]" />
              </div>
              <div className="space-y-4">
                {trending.slice(0, 5).map((article, i) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.attributes.slug}`}
                    className="flex gap-3 group"
                  >
                    <span
                      className="text-xl font-bold text-[var(--border)] leading-none mt-0.5"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      {i + 1}
                    </span>
                    <p
                      className="text-sm font-semibold text-[var(--text)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      {article.attributes.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Mid-page ad */}
          <AdSlot position="banner" className="mt-8" />

          {/* Category sections */}
          {Array.from(categoryGroups).map(([catName, catArticles]) => (
            <section key={catName} className="mt-10">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="section-label whitespace-nowrap">{catName}</h2>
                <hr className="flex-1 border-t border-[var(--border)]" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catArticles.slice(0, 3).map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </>
  )
}

function LeadArticle({ article }: { article: Article }) {
  const { attributes: a } = article
  const coverUrl = getArticleCoverUrl(
    a.cover?.data?.attributes?.formats?.large?.url || a.cover?.data?.attributes?.url,
    a.slug,
    1200,
    800,
    a.coverUrl
  )

  return (
    <Link href={`/articles/${a.slug}`} className="group block">
      <div className="relative aspect-[16/10] overflow-hidden mb-4 bg-[var(--surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={a.title}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="section-label">
        {a.category?.data?.attributes?.name}
      </span>
      <h2 className="headline-xl mt-1 mb-2 group-hover:text-[var(--accent)] transition-colors">
        {a.title}
      </h2>
      {a.excerpt && (
        <p className="text-[var(--muted)] text-base leading-relaxed mb-2 line-clamp-3">
          {a.excerpt}
        </p>
      )}
      <span className="byline">
        {a.author?.data?.attributes?.name && `By ${a.author.data.attributes.name}`}
        {a.publishedAt && ` · ${formatDate(a.publishedAt)}`}
      </span>
    </Link>
  )
}

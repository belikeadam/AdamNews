'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import ArticleCard from '@/components/reader/ArticleCard'
import AdSlot from '@/components/shared/AdSlot'
import NewsletterSignup from '@/components/shared/NewsletterSignup'
import { getArticleCoverUrl, relativeTime } from '@/lib/utils'
import type { Article } from '@/types'

interface HomeClientProps {
  articles: Article[]
  trending: Article[]
  initialCategory?: string | null
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

type FeedDensity = 'comfortable' | 'compact'

export default function HomeClient({
  articles,
  trending,
  initialCategory = null,
}: HomeClientProps) {
  const { user, isAuthenticated } = useAuth()
  // Sync with URL — initialCategory changes on server navigation
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [density, setDensity] = useState<FeedDensity>('comfortable')

  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  useEffect(() => {
    const stored = localStorage.getItem('feedDensity') as FeedDensity | null
    if (stored === 'comfortable' || stored === 'compact') setDensity(stored)
  }, [])

  const toggleDensity = (d: FeedDensity) => {
    setDensity(d)
    localStorage.setItem('feedDensity', d)
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
      {/* Personalized greeting */}
      {isAuthenticated && user?.name && (
        <div className="max-w-7xl mx-auto px-4 pt-5 pb-1 animate-fade-in">
          <p className="text-sm text-[var(--muted)]">
            {getGreeting()}, <span className="font-medium text-[var(--text)]">{user.name.split(' ')[0]}</span>.
            {' '}Here&apos;s your daily brief.
          </p>
        </div>
      )}

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
                      className="text-2xl font-bold text-[var(--border)] leading-none mt-0.5 group-hover:text-[var(--accent)] transition-colors"
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
                      <div className="flex items-center gap-2 mt-1">
                        <span className="byline">
                          {article.attributes.readTime || '3 min read'}
                        </span>
                        {article.attributes.views > 0 && (
                          <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            {article.attributes.views >= 1000 ? `${(article.attributes.views / 1000).toFixed(1)}k` : article.attributes.views}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <hr className="section-rule my-6" />

              {/* Sidebar ad */}
              <AdSlot position="sidebar" className="mb-6" />

              {/* Newsletter */}
              <NewsletterSignup />
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
                      className="text-xl font-bold text-[var(--border)] leading-none mt-0.5 group-hover:text-[var(--accent)] transition-colors"
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
                      <span className="byline mt-0.5 block text-xs">
                        {article.attributes.readTime || '3 min read'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Mid-page ad */}
          <AdSlot position="banner" className="mt-8" />

          {/* Category sections with density toggle */}
          {categoryGroups.size > 0 && (
            <div className="flex items-center justify-between mt-10 mb-2">
              <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">More Stories</span>
              <div className="flex items-center gap-1 bg-[var(--surface)] rounded p-0.5">
                <button
                  onClick={() => toggleDensity('comfortable')}
                  className={`p-1.5 rounded transition-colors ${density === 'comfortable' ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                  aria-label="Comfortable view"
                  title="Comfortable"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button
                  onClick={() => toggleDensity('compact')}
                  className={`p-1.5 rounded transition-colors ${density === 'compact' ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                  aria-label="Compact view"
                  title="Compact"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              </div>
            </div>
          )}

          {Array.from(categoryGroups).map(([catName, catArticles]) => (
            <section key={catName} className="mt-8">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="section-label whitespace-nowrap">{catName}</h2>
                <hr className="flex-1 border-t border-[var(--border)]" />
              </div>
              {density === 'compact' ? (
                <div className="space-y-0 divide-y divide-[var(--border)]">
                  {catArticles.slice(0, 6).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" />
                  ))}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
                  {catArticles.slice(0, 3).map((a) => (
                    <ArticleCard key={a.id} article={a} />
                  ))}
                </div>
              )}
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
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
        />
        {a.trending && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-[var(--accent)] text-white text-[0.65rem] font-bold uppercase tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Trending
          </span>
        )}
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
      <div className="flex items-center gap-3">
        <span className="byline">
          {a.author?.data?.attributes?.name && `By ${a.author.data.attributes.name}`}
          {a.publishedAt && ` · ${relativeTime(a.publishedAt)}`}
        </span>
        {a.readTime && (
          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {a.readTime}
          </span>
        )}
        {a.views > 0 && (
          <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}k` : a.views}
          </span>
        )}
      </div>
    </Link>
  )
}

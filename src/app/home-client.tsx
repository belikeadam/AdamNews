'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import ArticleCard from '@/components/reader/ArticleCard'
import AdSlot from '@/components/shared/AdSlot'
import NewsletterSignup from '@/components/shared/NewsletterSignup'
import LiveReaderCount from '@/components/shared/LiveReaderCount'
import { ScrollReveal, ScrollStagger, ScrollStaggerItem, SlideUp, FadeIn } from '@/components/motion'
import { getArticleCoverUrl, relativeTime } from '@/lib/utils'
import { getCategoryColor } from '@/constants/categories'
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory)
  const [density, setDensity] = useState<FeedDensity>('comfortable')
  const feedRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  useEffect(() => {
    setSelectedCategory(initialCategory)
  }, [initialCategory])

  // Smooth scroll to feed when category changes (but not on initial load)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (selectedCategory && feedRef.current) {
      feedRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedCategory])

  useEffect(() => {
    const stored = localStorage.getItem('feedDensity') as FeedDensity | null
    if (stored === 'comfortable' || stored === 'compact') setDensity(stored)
  }, [])

  const toggleDensity = (d: FeedDensity) => {
    setDensity(d)
    localStorage.setItem('feedDensity', d)
  }

  const isCategoryView = !!selectedCategory
  const selectedCategoryName = selectedCategory
    ? articles.find(a => a.attributes.category?.data?.attributes?.slug === selectedCategory)
        ?.attributes.category?.data?.attributes?.name || selectedCategory
    : null
  const selectedColors = getCategoryColor(selectedCategory)

  const filtered = selectedCategory
    ? articles.filter(
        (a) => a.attributes.category?.data?.attributes?.slug === selectedCategory
      )
    : articles

  const leadArticle = filtered[0]
  const secondaryArticles = filtered.slice(1, 4)
  const remainingArticles = filtered.slice(4)

  // Group remaining by category, premium articles first
  const categoryGroups = new Map<string, { slug: string; articles: Article[] }>()
  for (const article of remainingArticles) {
    const catName = article.attributes.category?.data?.attributes?.name || 'General'
    const catSlug = article.attributes.category?.data?.attributes?.slug || ''
    if (!categoryGroups.has(catName)) categoryGroups.set(catName, { slug: catSlug, articles: [] })
    categoryGroups.get(catName)!.articles.push(article)
  }
  for (const [, group] of categoryGroups) {
    group.articles.sort((a, b) => {
      if (a.attributes.premium && !b.attributes.premium) return -1
      if (!a.attributes.premium && b.attributes.premium) return 1
      return 0
    })
  }

  // Total views for live reader count
  const totalViews = trending.reduce((sum, a) => sum + (a.attributes.views || 0), 0)

  // Trending articles filtered by category if in category view
  const trendingForView = isCategoryView
    ? trending.filter(a => a.attributes.category?.data?.attributes?.slug === selectedCategory)
    : trending

  return (
    <>
      {/* Welcome hero for new visitors — only on homepage (not category view) */}
      {!isAuthenticated && !isCategoryView && (
        <SlideUp delay={0.1} className="text-center py-6 sm:py-8 border-b border-[var(--border)] mb-6">
          <h2
            className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Welcome to The Adam News
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1.5 max-w-md mx-auto">
            Independent journalism for Malaysia and beyond. Stay informed with quality reporting.
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link
              href="/search"
              className="px-4 py-2 text-sm font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors"
            >
              Explore stories
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            >
              Sign in
            </Link>
          </div>
        </SlideUp>
      )}

      {/* Personalized greeting — only on homepage */}
      {isAuthenticated && user?.name && !isCategoryView && (
        <FadeIn className="max-w-7xl mx-auto pt-5 pb-1">
          <p className="text-sm text-[var(--muted)]">
            {getGreeting()}, <span className="font-medium text-[var(--text)]">{user.name.split(' ')[0]}</span>.
            {' '}Here&apos;s your daily brief.
          </p>
        </FadeIn>
      )}

      {/* Category view header — shown when a category is selected */}
      {isCategoryView && (
        <div
          ref={feedRef}
          className="flex items-center gap-3 mt-4 mb-4 py-3 px-4 -mx-4 border-b-2"
          style={{ borderBottomColor: selectedColors.primary, backgroundColor: `${selectedColors.primary}08` }}
        >
          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            All
          </Link>
          <span
            className="w-1.5 h-5 rounded-full flex-shrink-0"
            style={{ backgroundColor: selectedColors.primary }}
          />
          <h2
            className="text-base sm:text-lg font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-headline)', color: selectedColors.primary }}
          >
            {selectedCategoryName}
          </h2>
          <span className="text-xs text-[var(--muted)] flex-shrink-0">
            {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
          </span>
          <div className="flex-1" />
          <LiveReaderCount views={totalViews} className="hidden sm:inline-flex" />
        </div>
      )}

      {/* "Just In" live timestamp bar — only on homepage */}
      {!isCategoryView && (
        <div className="flex items-center gap-3 mt-4 mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Just In</span>
          </div>
          <span className="text-[var(--border)]">|</span>
          <span className="text-xs text-[var(--muted)]" suppressHydrationWarning>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-[var(--border)] hidden sm:inline">|</span>
          <LiveReaderCount views={totalViews} className="hidden sm:inline-flex" />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p className="text-[var(--muted)] text-lg" style={{ fontFamily: 'var(--font-headline)' }}>No articles in this category yet</p>
          <p className="text-sm text-[var(--muted)] mt-1">Check back soon for new stories.</p>
          <Link href="/" className="inline-block mt-4 text-sm text-[var(--accent)] font-medium hover:underline">
            ← Back to all stories
          </Link>
        </div>
      ) : (
        <>
          {/* NYT-style main grid */}
          <div ref={isCategoryView ? undefined : feedRef} className="grid grid-cols-1 md:grid-cols-[2fr,1px,1fr] gap-0 mt-2 sm:mt-4">
            {/* Lead story + secondary */}
            <div className="pr-0 md:pr-8">
              {leadArticle && (
                <ScrollReveal>
                  <LeadArticle article={leadArticle} isCategoryView={isCategoryView} />
                </ScrollReveal>
              )}

              {secondaryArticles.length > 0 && (
                <>
                  <hr className="section-rule" />
                  <ScrollStagger className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                    {secondaryArticles.map((a) => (
                      <ScrollStaggerItem key={a.id}>
                        <ArticleCard article={a} variant="compact" />
                      </ScrollStaggerItem>
                    ))}
                  </ScrollStagger>
                </>
              )}
            </div>

            {/* Vertical rule */}
            <div className="hidden md:block bg-[var(--border)]" />

            {/* Enhanced Sidebar */}
            <aside className="hidden md:block pl-8">
              {/* Live reader indicator */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="section-label">
                  {isCategoryView ? `Top in ${selectedCategoryName}` : 'Most Read'}
                </h3>
                <LiveReaderCount views={totalViews} />
              </div>

              <div className="space-y-0">
                {(isCategoryView ? trendingForView : trending).slice(0, 5).map((article, i) => {
                  const ta = article.attributes
                  const catSlug = ta.category?.data?.attributes?.slug
                  const colors = getCategoryColor(catSlug)
                  const thumbUrl = getArticleCoverUrl(
                    ta.cover?.data?.attributes?.formats?.thumbnail?.url || ta.cover?.data?.attributes?.url,
                    ta.slug,
                    200,
                    200,
                    ta.coverUrl
                  )
                  return (
                    <ScrollReveal key={article.id} delay={i * 0.05}>
                      <Link
                        href={`/articles/${ta.slug}`}
                        className="flex gap-3 group py-2.5 border-b border-[var(--border)] last:border-0"
                      >
                        <span
                          className="text-2xl font-bold leading-none mt-0.5 transition-colors"
                          style={{
                            fontFamily: 'var(--font-headline)',
                            color: i < 3 ? colors.primary : 'var(--border)',
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          {!isCategoryView && (
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: colors.primary }}
                              />
                              <span className="text-[0.6rem] uppercase tracking-wider font-medium text-[var(--muted)]">
                                {ta.category?.data?.attributes?.name}
                              </span>
                            </div>
                          )}
                          <p
                            className="text-sm font-semibold text-[var(--text)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
                            style={{ fontFamily: 'var(--font-headline)' }}
                          >
                            {ta.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="byline">
                              {ta.readTime || '3 min read'}
                            </span>
                            {ta.views > 0 && (
                              <span className="text-xs text-[var(--muted)] flex items-center gap-1">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                {ta.views >= 1000 ? `${(ta.views / 1000).toFixed(1)}k` : ta.views}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="relative w-14 h-14 flex-shrink-0 overflow-hidden bg-[var(--surface-2)]">
                          <Image
                            src={thumbUrl}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    </ScrollReveal>
                  )
                })}
              </div>

              <hr className="section-rule my-4" />

              {/* Sidebar ad — compact */}
              <AdSlot position="sidebar" className="mb-4" />

              {/* Newsletter */}
              <NewsletterSignup />

              {/* Editor's Pick quote */}
              {trending[0] && (
                <ScrollReveal className="mt-4">
                  <div className="p-4 bg-[var(--surface)] border-l-3 border-[var(--accent)]" style={{ borderLeftWidth: 3, borderLeftColor: 'var(--accent)' }}>
                    <span className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--accent)] font-bold">
                      Editor&apos;s Pick
                    </span>
                    <p
                      className="text-sm font-medium text-[var(--text)] mt-1.5 leading-relaxed italic"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      &ldquo;{trending[0].attributes.excerpt?.slice(0, 120)}...&rdquo;
                    </p>
                    <Link
                      href={`/articles/${trending[0].attributes.slug}`}
                      className="text-xs text-[var(--accent)] font-medium mt-1.5 inline-block hover:underline"
                    >
                      Read full story →
                    </Link>
                  </div>
                </ScrollReveal>
              )}
            </aside>
          </div>

          {/* Mobile trending — only on homepage (not category view) */}
          {!isCategoryView && trending.length > 0 && (
            <section className="md:hidden mt-8">
              <ScrollReveal direction="left">
                <div className="flex items-center gap-4 mb-4">
                  <h2 className="section-label">Most Read</h2>
                  <hr className="flex-1 border-t border-[var(--border)]" />
                  <LiveReaderCount views={totalViews} />
                </div>
              </ScrollReveal>
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4">
                {trending.slice(0, 8).map((article, i) => {
                  const ta = article.attributes
                  const catSlug = ta.category?.data?.attributes?.slug
                  const colors = getCategoryColor(catSlug)
                  const coverUrl = getArticleCoverUrl(
                    ta.cover?.data?.attributes?.formats?.small?.url || ta.cover?.data?.attributes?.url,
                    ta.slug,
                    400,
                    300,
                    ta.coverUrl
                  )
                  return (
                    <Link
                      key={article.id}
                      href={`/articles/${ta.slug}`}
                      className="flex-shrink-0 w-[260px] snap-start group"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)] mb-2">
                        <Image
                          src={coverUrl}
                          alt={ta.title}
                          fill
                          sizes="260px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span
                          className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: colors.primary }}
                        >
                          {i + 1}
                        </span>
                        <span
                          className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-wider text-white rounded-sm"
                          style={{ backgroundColor: `${colors.primary}cc` }}
                        >
                          {ta.category?.data?.attributes?.name}
                        </span>
                      </div>
                      <h3
                        className="text-sm font-semibold text-[var(--text)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors"
                        style={{ fontFamily: 'var(--font-headline)' }}
                      >
                        {ta.title}
                      </h3>
                      <span className="byline mt-0.5 block text-xs">
                        {ta.readTime || '3 min read'}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}

          {/* Mid-page ad — only on homepage */}
          {!isCategoryView && <AdSlot position="banner" className="mt-8" />}

          {/* Category view: show all remaining articles in a clean grid */}
          {isCategoryView && remainingArticles.length > 0 && (
            <>
              <div className="flex items-center justify-between mt-8 mb-4 border-t border-[var(--border)] pt-5">
                <span className="text-xs text-[var(--muted)] uppercase tracking-wider font-medium">
                  More in {selectedCategoryName}
                </span>
                <div className="flex items-center gap-1 bg-[var(--surface)] rounded p-0.5">
                  <button
                    onClick={() => toggleDensity('comfortable')}
                    className={`p-1.5 rounded transition-colors ${density === 'comfortable' ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                    aria-label="Comfortable view"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  </button>
                  <button
                    onClick={() => toggleDensity('compact')}
                    className={`p-1.5 rounded transition-colors ${density === 'compact' ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                    aria-label="Compact view"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  </button>
                </div>
              </div>

              {density === 'compact' ? (
                <div className="space-y-0 divide-y divide-[var(--border)]">
                  {remainingArticles.map((a) => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" showCategory={false} />
                  ))}
                </div>
              ) : (
                <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {remainingArticles.map((a) => (
                    <ScrollStaggerItem key={a.id}>
                      <ArticleCard article={a} showCategory={false} />
                    </ScrollStaggerItem>
                  ))}
                </ScrollStagger>
              )}
            </>
          )}

          {/* Homepage: Category sections with density toggle */}
          {!isCategoryView && categoryGroups.size > 0 && (
            <>
              <div className="flex items-center justify-between mt-10 mb-2 border-t border-[var(--border)] pt-6">
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

              {Array.from(categoryGroups).map(([catName, { slug: catSlug, articles: catArticles }], catIdx) => {
                const colors = getCategoryColor(catSlug)
                return (
                  <section key={catName} id={`category-${catSlug}`} className="mt-8">
                    <ScrollReveal direction="left">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <span
                            className="w-1 h-5 rounded-full"
                            style={{ backgroundColor: colors.primary }}
                          />
                          <h2
                            className="text-[0.7rem] font-semibold uppercase tracking-[0.1em]"
                            style={{ color: colors.primary }}
                          >
                            {catName}
                          </h2>
                        </div>
                        <hr className="flex-1 border-t border-[var(--border)]" />
                        {catSlug && (
                          <Link
                            href={`/?category=${catSlug}`}
                            className="text-xs font-medium hover:underline transition-colors whitespace-nowrap"
                            style={{ color: colors.primary }}
                          >
                            View all →
                          </Link>
                        )}
                      </div>
                    </ScrollReveal>

                    {density === 'compact' ? (
                      <div className="space-y-0 divide-y divide-[var(--border)]">
                        {catArticles.slice(0, 6).map((a) => (
                          <ArticleCard key={a.id} article={a} variant="horizontal" showCategory={false} />
                        ))}
                      </div>
                    ) : catIdx % 3 === 0 && catArticles.length >= 2 ? (
                      <div className="grid grid-cols-1 md:grid-cols-[1fr,1px,1fr] gap-0">
                        <ScrollReveal className="pr-0 md:pr-6">
                          <ArticleCard article={catArticles[0]} showCategory={false} />
                        </ScrollReveal>
                        <div className="hidden md:block bg-[var(--border)]" />
                        <div className="pl-0 md:pl-6 mt-4 md:mt-0">
                          <div className="space-y-0 divide-y divide-[var(--border)]">
                            {catArticles.slice(1, 5).map((a) => (
                              <ArticleCard key={a.id} article={a} variant="horizontal" showCategory={false} />
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : catIdx % 3 === 1 && catArticles.length >= 3 ? (
                      <div>
                        <ScrollReveal>
                          <FeaturedCard article={catArticles[0]} colors={colors} />
                        </ScrollReveal>
                        <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-5">
                          {catArticles.slice(1, 4).map((a) => (
                            <ScrollStaggerItem key={a.id}>
                              <ArticleCard article={a} variant="compact" showCategory={false} />
                            </ScrollStaggerItem>
                          ))}
                        </ScrollStagger>
                      </div>
                    ) : catArticles.length >= 2 ? (
                      <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible md:snap-none">
                        {catArticles.slice(0, 3).map((a) => (
                          <div key={a.id} className="flex-shrink-0 w-[280px] snap-start md:w-auto">
                            <ArticleCard article={a} showCategory={false} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ScrollStagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {catArticles.slice(0, 3).map((a) => (
                          <ScrollStaggerItem key={a.id}>
                            <ArticleCard key={a.id} article={a} />
                          </ScrollStaggerItem>
                        ))}
                      </ScrollStagger>
                    )}
                  </section>
                )
              })}
            </>
          )}

          {/* Mobile newsletter */}
          <div className="md:hidden mt-10">
            <NewsletterSignup />
          </div>
        </>
      )}
    </>
  )
}

/* ── Lead Article — enhanced with category colors & visual hierarchy ── */

function LeadArticle({ article, isCategoryView }: { article: Article; isCategoryView?: boolean }) {
  const { attributes: a } = article
  const catSlug = a.category?.data?.attributes?.slug
  const colors = getCategoryColor(catSlug)
  const coverUrl = getArticleCoverUrl(
    a.cover?.data?.attributes?.formats?.large?.url || a.cover?.data?.attributes?.url,
    a.slug,
    1200,
    800,
    a.coverUrl
  )

  return (
    <Link href={`/articles/${a.slug}`} className="group block">
      <div className="relative aspect-[16/9] sm:aspect-[16/10] overflow-hidden mb-3 sm:mb-4 bg-[var(--surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={a.title}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${colors.primary}15 0%, transparent 40%)`,
          }}
        />
        {a.trending && (
          <span className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 text-white text-[0.65rem] font-bold uppercase tracking-wider"
            style={{ backgroundColor: colors.primary }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Trending
          </span>
        )}
        {a.premium && (
          <span className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-amber-600 text-white text-[0.65rem] font-bold uppercase tracking-wider">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Premium
          </span>
        )}
      </div>

      {/* Lead story label */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="text-[0.6rem] font-bold uppercase tracking-[0.15em]"
          style={{ color: colors.primary }}
        >
          {isCategoryView ? 'Featured' : 'Lead Story'}
        </span>
        <span className="text-[var(--border)]">·</span>
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-[0.1em]"
          style={{ color: colors.text }}
        >
          {a.category?.data?.attributes?.name}
        </span>
      </div>

      <h2 className="headline-xl mt-1 mb-2 group-hover:text-[var(--accent)] transition-colors">
        {a.title}
      </h2>
      {a.excerpt && (
        <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed mb-2 line-clamp-2 sm:line-clamp-3">
          {a.excerpt}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {a.author?.data?.attributes?.name && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: colors.primary }}
            >
              {a.author.data.attributes.name[0].toUpperCase()}
            </span>
            <span className="byline font-medium text-[var(--text)]">
              {a.author.data.attributes.name}
            </span>
          </span>
        )}
        {a.publishedAt && (
          <span className="byline">
            {relativeTime(a.publishedAt)}
          </span>
        )}
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
      <span className="inline-flex items-center gap-1 mt-3 text-xs font-semibold uppercase tracking-wider group-hover:gap-2 transition-all" style={{ color: colors.primary }}>
        Read full story
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </span>
    </Link>
  )
}

/* ── Featured Card — full-bleed image with text overlay ── */

function FeaturedCard({ article, colors }: { article: Article; colors: ReturnType<typeof getCategoryColor> }) {
  const { attributes: a } = article
  const coverUrl = getArticleCoverUrl(
    a.cover?.data?.attributes?.formats?.large?.url || a.cover?.data?.attributes?.url,
    a.slug,
    1200,
    600,
    a.coverUrl
  )
  const authorName = a.author?.data?.attributes?.name

  return (
    <Link href={`/articles/${a.slug}`} className="group block relative overflow-hidden bg-[var(--surface-2)]">
      <div className="relative aspect-[21/9] sm:aspect-[3/1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={a.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <span
            className="inline-block px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-white rounded-sm mb-2"
            style={{ backgroundColor: colors.primary }}
          >
            {a.category?.data?.attributes?.name}
          </span>
          <h3
            className="text-lg sm:text-xl font-bold text-white line-clamp-2 mb-1"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {a.title}
          </h3>
          <div className="flex items-center gap-2 text-white/70 text-xs">
            {authorName && <span>By {authorName}</span>}
            {a.readTime && <span>· {a.readTime}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

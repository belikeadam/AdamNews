'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ArticleCard from '@/components/reader/ArticleCard'
import AdSlot from '@/components/shared/AdSlot'
import { getCategoryColor } from '@/constants/categories'
import type { Article, Category } from '@/types'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 animate-shimmer rounded mb-6" />
          <div className="h-11 animate-shimmer rounded mb-4" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}

type SortOption = 'newest' | 'oldest' | 'trending' | 'most-read'

const TRENDING_PILLS = [
  'AI Agents', 'React 19', 'TypeScript', 'Next.js', 'Web Dev', 'Startups',
]

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialLoad = useRef(true)

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'newest')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const isTrending = sort === 'trending'
  const isMostRead = sort === 'most-read'

  const pageTitle = isTrending
    ? 'Trending Now'
    : isMostRead
    ? 'Most Read'
    : 'Search & Archive'

  const pageSubtitle = isTrending
    ? 'Stories generating the most buzz right now.'
    : isMostRead
    ? 'The most viewed articles by our readers.'
    : 'Browse and search our full article archive.'

  useEffect(() => {
    fetch(`${STRAPI_URL}/api/categories?sort=name:asc`)
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      const hasParams = searchParams.get('q') || searchParams.get('category') || searchParams.get('sort')
      if (hasParams) {
        doSearch()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doSearch = async (overrideQuery?: string, overrideSort?: SortOption) => {
    const q = overrideQuery ?? query
    const s = overrideSort ?? sort

    setLoading(true)
    const params = new URLSearchParams()
    params.set('populate', '*')
    params.set('pagination[pageSize]', '20')

    const isTr = s === 'trending'
    const isMr = s === 'most-read'

    if (isTr) {
      params.set('filters[trending][$eq]', 'true')
      params.set('sort', 'publishedAt:desc')
    } else if (isMr) {
      params.set('sort', 'views:desc')
    } else {
      params.set('sort', s === 'oldest' ? 'publishedAt:asc' : 'publishedAt:desc')
    }

    if (q.trim()) {
      params.set('filters[$or][0][title][$containsi]', q.trim())
      params.set('filters[$or][1][excerpt][$containsi]', q.trim())
    }
    if (category) {
      params.set('filters[category][slug][$eq]', category)
    }

    try {
      const res = await fetch(`${STRAPI_URL}/api/articles?${params}`)
      const data = await res.json()
      setArticles(data.data || [])
      setTotal(data.meta?.pagination?.total || 0)
    } catch {
      setArticles([])
      setTotal(0)
    }
    setLoading(false)

    const urlParams = new URLSearchParams()
    if (q.trim()) urlParams.set('q', q.trim())
    if (category) urlParams.set('category', category)
    if (s !== 'newest') urlParams.set('sort', s)
    router.push(`/search?${urlParams}`, { scroll: false })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-8 overflow-x-hidden">
      <h1
        className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-1"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        {pageTitle}
      </h1>
      <p className="text-sm text-[var(--muted)] mb-4 sm:mb-6">
        {pageSubtitle}
      </p>

      {/* Trending pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TRENDING_PILLS.map((pill) => (
          <button
            key={pill}
            onClick={() => { setQuery(pill); doSearch(pill) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
              query === pill
                ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)]'
            }`}
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Search controls */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr,auto] sm:gap-4 mb-4">
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            placeholder="Search articles..."
            className="w-full h-11 pl-10 pr-4 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all rounded-lg"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
              !category
                ? 'bg-[var(--text)] text-[var(--bg)]'
                : 'border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            All
          </button>
          {categories.map((c) => {
            const colors = getCategoryColor(c.attributes.slug)
            const isActive = category === c.attributes.slug
            return (
              <button
                key={c.id}
                onClick={() => setCategory(isActive ? '' : c.attributes.slug)}
                className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white'
                    : 'border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
                style={isActive ? { backgroundColor: colors.primary } : undefined}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isActive ? 'white' : colors.primary }} />
                  {c.attributes.name}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sort tabs + view toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-0 bg-[var(--surface)] rounded-lg p-0.5">
          {(['newest', 'trending', 'most-read'] as SortOption[]).map((s) => (
            <button
              key={s}
              onClick={() => { setSort(s); doSearch(undefined, s) }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                sort === s
                  ? 'bg-[var(--bg)] text-[var(--text)] shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {s === 'newest' ? 'Newest' : s === 'trending' ? 'Trending' : 'Most Read'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => doSearch()}
            disabled={loading}
            className="px-4 py-1.5 bg-[var(--accent)] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 mr-2"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}
            aria-label="Grid view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-[var(--text)]' : 'text-[var(--muted)]'}`}
            aria-label="List view"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Results */}
      {articles.length > 0 && (
        <p className="text-sm text-[var(--muted)] mb-4">
          {total} result{total !== 1 ? 's' : ''} found
        </p>
      )}

      {viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      ) : (
        <div className="space-y-0 divide-y divide-[var(--border)]">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} variant="horizontal" />
          ))}
        </div>
      )}

      {articles.length === 0 && !loading && (
        <div className="text-center py-16">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5" strokeLinecap="round" className="mx-auto mb-4">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <p className="text-[var(--text)] font-medium" style={{ fontFamily: 'var(--font-headline)' }}>
            {searchParams.get('q') || searchParams.get('category') || isTrending || isMostRead
              ? 'No articles match your filters'
              : 'Start your search'}
          </p>
          <p className="text-sm text-[var(--muted)] mt-1">
            {searchParams.get('q')
              ? 'Try different keywords or browse by category.'
              : 'Use the search bar or pick a trending topic above.'}
          </p>
        </div>
      )}

      {articles.length > 0 && (
        <AdSlot position="banner" className="mt-10" />
      )}
    </div>
  )
}

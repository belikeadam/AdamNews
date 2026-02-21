'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ArticleCard from '@/components/reader/ArticleCard'
import AdSlot from '@/components/shared/AdSlot'
import type { Article, Category } from '@/types'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-[var(--surface-2)] animate-pulse mb-6" />
          <div className="h-11 bg-[var(--surface-2)] animate-pulse mb-4" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}

type SortOption = 'newest' | 'oldest' | 'trending' | 'most-read'

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

  const isTrending = sort === 'trending'
  const isMostRead = sort === 'most-read'

  // Contextual page title
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

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${STRAPI_URL}/api/categories?sort=name:asc`)
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {})
  }, [])

  // Auto-search on mount if any params present (including trending/most-read)
  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      const hasParams = searchParams.get('q') || searchParams.get('category') || searchParams.get('sort')
      if (hasParams) {
        handleSearch()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('populate', '*')
    params.set('pagination[pageSize]', '20')

    if (isTrending) {
      params.set('filters[trending][$eq]', 'true')
      params.set('sort', 'publishedAt:desc')
    } else if (isMostRead) {
      params.set('sort', 'views:desc')
    } else {
      params.set('sort', sort === 'oldest' ? 'publishedAt:asc' : 'publishedAt:desc')
    }

    if (query.trim()) {
      params.set('filters[$or][0][title][$containsi]', query.trim())
      params.set('filters[$or][1][excerpt][$containsi]', query.trim())
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

    // Update URL
    const urlParams = new URLSearchParams()
    if (query.trim()) urlParams.set('q', query.trim())
    if (category) urlParams.set('category', category)
    if (sort !== 'newest') urlParams.set('sort', sort)
    router.push(`/search?${urlParams}`, { scroll: false })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-8">
      <h1
        className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-1"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        {pageTitle}
      </h1>
      <p className="text-sm text-[var(--muted)] mb-4 sm:mb-6">
        {pageSubtitle}
      </p>

      {/* Search controls */}
      <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr,auto] sm:gap-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search articles..."
          className="w-full h-11 px-4 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text)] transition-colors"
        />
        <div className="flex gap-2 sm:gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex-1 sm:flex-none h-11 px-3 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text)]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.attributes.slug}>
                {c.attributes.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="flex-1 sm:flex-none h-11 px-3 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="trending">Trending</option>
            <option value="most-read">Most Read</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={loading}
        className="w-full sm:w-auto h-11 px-8 bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>

      {/* Results */}
      {articles.length > 0 && (
        <p className="text-sm text-[var(--muted)] mt-6 mb-4">
          {total} result{total !== 1 ? 's' : ''} found
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>

      {articles.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-[var(--muted)]">
            {searchParams.get('q') || searchParams.get('category') || isTrending || isMostRead
              ? 'No articles match your filters.'
              : 'Use the filters above to find articles.'}
          </p>
        </div>
      )}

      {/* Ad slot */}
      {articles.length > 0 && (
        <AdSlot position="banner" className="mt-10" />
      )}
    </div>
  )
}

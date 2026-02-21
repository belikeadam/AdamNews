'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ArticleCard from '@/components/reader/ArticleCard'
import AdSlot from '@/components/shared/AdSlot'
import type { Article, Category } from '@/types'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest')
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Fetch categories on mount
  useEffect(() => {
    fetch(`${STRAPI_URL}/api/categories?sort=name:asc`)
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {})
  }, [])

  // Search on mount if params present
  useEffect(() => {
    if (searchParams.get('q') || searchParams.get('category')) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('populate', '*')
    params.set('pagination[pageSize]', '20')
    params.set(
      'sort',
      sort === 'oldest' ? 'publishedAt:asc' : 'publishedAt:desc'
    )

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
    <div className="max-w-7xl mx-auto px-4 py-8 pb-20 md:pb-8">
      <h1
        className="text-3xl font-bold text-[var(--text)] mb-6"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        Search &amp; Archive
      </h1>

      {/* Search controls */}
      <div className="grid sm:grid-cols-[1fr,auto] gap-4 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search articles..."
          className="h-11 px-4 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text)] transition-colors"
        />
        <div className="flex gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 px-3 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text)]"
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
            onChange={(e) => setSort(e.target.value)}
            className="h-11 px-3 border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm focus:outline-none focus:border-[var(--text)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>

      {articles.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-[var(--muted)]">
            {searchParams.get('q') || searchParams.get('category')
              ? 'No articles match your search.'
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

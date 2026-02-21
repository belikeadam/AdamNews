'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface SavedArticle {
  slug: string
  title: string
  excerpt?: string
  category?: string
  savedAt: string
}

export default function SavedPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [saved, setSaved] = useState<SavedArticle[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedArticles')
      if (raw) setSaved(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const removeSaved = (slug: string) => {
    const updated = saved.filter((a) => a.slug !== slug)
    setSaved(updated)
    localStorage.setItem('savedArticles', JSON.stringify(updated))
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pb-20 md:pb-8">
      <div className="pt-8 pb-6 border-b border-[var(--border)] mb-8">
        <h1
          className="text-3xl font-bold text-[var(--text)] mb-2"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Saved Articles
        </h1>
        <p className="text-sm text-[var(--muted)]">
          {saved.length > 0
            ? `${saved.length} article${saved.length !== 1 ? 's' : ''} saved to your reading list`
            : 'Your reading list is empty'}
        </p>
      </div>

      {!isAuthenticated && (
        <div className="bg-[var(--surface)] border border-[var(--border)] p-6 mb-8 text-center">
          <p className="text-sm text-[var(--muted)] mb-3">
            Sign in to sync your saved articles across devices.
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 text-sm font-medium bg-[var(--text)] text-[var(--bg)] hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
        </div>
      )}

      {saved.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto mb-4 text-[var(--border)]" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          <p className="text-[var(--muted)] mb-2">No saved articles yet</p>
          <p className="text-sm text-[var(--muted)]">
            Tap the bookmark icon on any article to save it for later.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 px-4 py-2 text-sm font-medium border border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
          >
            Browse articles
          </Link>
        </div>
      ) : (
        <div className="space-y-0">
          {saved.map((article) => (
            <div key={article.slug} className="flex items-start gap-4 py-5 border-b border-[var(--border)] group">
              <div className="flex-1 min-w-0">
                {article.category && (
                  <span className="section-label">{article.category}</span>
                )}
                <Link href={`/articles/${article.slug}`}>
                  <h3
                    className="text-lg font-semibold text-[var(--text)] line-clamp-2 mt-1 hover:text-[var(--accent)] transition-colors"
                    style={{ fontFamily: 'var(--font-headline)' }}
                  >
                    {article.title}
                  </h3>
                </Link>
                {article.excerpt && (
                  <p className="text-sm text-[var(--muted)] line-clamp-2 mt-1">
                    {article.excerpt}
                  </p>
                )}
                <span className="byline mt-1 block text-xs">
                  Saved {new Date(article.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <button
                onClick={() => removeSaved(article.slug)}
                className="flex-shrink-0 mt-1 w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                aria-label="Remove from saved"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePersonalization } from '@/hooks/usePersonalization'
import type { AIDigest } from '@/types/ai'

const URGENCY_CONFIG = {
  high: { color: 'var(--danger)', label: 'Breaking' },
  medium: { color: 'var(--warning)', label: 'Important' },
  low: { color: 'var(--success)', label: 'Worth reading' },
} as const

export default function DigestPage() {
  const { topCategories, loaded } = usePersonalization()
  const [digest, setDigest] = useState<AIDigest | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cached, setCached] = useState(false)

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-MY', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    if (loaded) generateDigest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded])

  const generateDigest = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch latest articles from Strapi
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || ''
      const strapiRes = await fetch(
        `${strapiUrl}/api/articles?sort=publishedAt:desc&pagination[limit]=10&populate=category`
      )
      const strapiData = await strapiRes.json()
      const topArticles = (strapiData.data || []).map((a: { attributes: { title: string; excerpt?: string; body?: string; category?: { data?: { attributes?: { name: string } } }; slug: string } }) => ({
        title: a.attributes.title,
        excerpt: a.attributes.excerpt || (typeof a.attributes.body === 'string' ? a.attributes.body.slice(0, 200) : ''),
        category: a.attributes.category?.data?.attributes?.name || 'General',
        slug: a.attributes.slug,
      }))

      if (topArticles.length === 0) {
        setError('No articles available right now. Check back soon.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/ai/digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: topCategories.length > 0 ? topCategories : ['technology', 'business', 'science'],
          topArticles,
        }),
      })

      if (!res.ok) {
        setError('Digest generation failed. Try again.')
        setLoading(false)
        return
      }

      const body = await res.json()
      setDigest(body.data)
      setCached(body.cached)
    } catch {
      setError('Failed to generate digest. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-[var(--border)]">
          <div className="text-[0.65rem] text-[var(--muted)] tracking-[0.15em] uppercase mb-3">
            {dateStr} · {timeStr}
          </div>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text)] leading-tight mb-2"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            Your Morning{' '}
            <span className="text-[var(--accent)]">Briefing</span>
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Personalised for your interests · Powered by Groq + Gemini · Updates twice daily
            {cached && <span className="ml-2 text-[var(--accent)]">· Cached</span>}
          </p>
          {topCategories.length === 0 && loaded && (
            <p className="text-xs text-[var(--accent)] mt-1">
              Showing general briefing · Read articles to personalise your digest
            </p>
          )}
        </div>

        {/* No digest and no error — waiting or empty */}
        {!loading && !digest && !error && loaded && (
          <div className="text-center py-12 px-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
            <div className="text-4xl mb-4">📰</div>
            <h3
              className="text-xl font-semibold text-[var(--text)] mb-2"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              No articles available
            </h3>
            <p className="text-sm text-[var(--muted)] mb-6 max-w-sm mx-auto">
              We couldn&apos;t find enough articles to generate your digest right now. Check back soon.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
            >
              Browse Articles →
            </Link>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 rounded-full border-3 border-[var(--border)] border-t-[var(--accent)] animate-spin mx-auto mb-4" />
            <p className="text-sm text-[var(--muted)]">AI is crafting your briefing...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-8 text-sm text-[var(--danger)]">{error}</div>
        )}

        {/* Digest Content */}
        {digest && !loading && (
          <div className="animate-slide-up space-y-5">
            {/* Headline card */}
            <div className="p-5 sm:p-6 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[0.65rem] font-bold text-[var(--accent)] tracking-[0.1em] uppercase mb-3">
                Today&apos;s Briefing
              </div>
              <h2
                className="text-xl sm:text-2xl font-bold text-[var(--text)] leading-snug mb-3"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {digest.headline}
              </h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                {digest.intro}
              </p>
            </div>

            {/* Stories */}
            <div className="space-y-3">
              {digest.stories?.map((story, i) => {
                const urgency = URGENCY_CONFIG[story.urgency] || URGENCY_CONFIG.low
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]"
                    style={{ borderLeftWidth: '3px', borderLeftColor: urgency.color }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-wide">
                        {story.category}
                      </span>
                      <span
                        className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: urgency.color,
                          backgroundColor: `color-mix(in srgb, ${urgency.color} 10%, transparent)`,
                        }}
                      >
                        {urgency.label}
                      </span>
                    </div>
                    <div
                      className="text-sm font-semibold text-[var(--text)] mb-1"
                      style={{ fontFamily: 'var(--font-headline)' }}
                    >
                      {story.title}
                    </div>
                    <div className="text-xs text-[var(--muted)] leading-relaxed">
                      {story.summary}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Closing */}
            {digest.closingNote && (
              <div className="text-center py-4 border-t border-[var(--border)]">
                <p
                  className="text-sm text-[var(--muted)] italic"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  {digest.closingNote}
                </p>
              </div>
            )}

            {/* Refresh button */}
            <button
              onClick={generateDigest}
              disabled={loading}
              className="w-full py-3 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors cursor-pointer disabled:opacity-50"
            >
              ↻ Refresh briefing
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

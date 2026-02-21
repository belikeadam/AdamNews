'use client'

import { useState, useEffect } from 'react'
import type { AIAnalysis } from '@/types/ai'

const SENTIMENT_CONFIG = {
  positive: { icon: '↑', label: 'Positive', color: 'var(--success)' },
  neutral: { icon: '→', label: 'Neutral', color: 'var(--muted)' },
  negative: { icon: '↓', label: 'Negative', color: 'var(--danger)' },
  mixed: { icon: '↕', label: 'Mixed', color: 'var(--warning)' },
} as const

const FACT_CHECK_CONFIG = {
  verified: { icon: '✓', label: 'Sources Verified', color: 'var(--success)' },
  unverified: { icon: '?', label: 'Unverified Claims', color: 'var(--warning)' },
  mixed: { icon: '!', label: 'Mixed Sources', color: 'var(--danger)' },
} as const

interface Props {
  slug: string
  title: string
  content: string
}

export default function AIInsightsPanel({ slug, title, content }: Props) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(() => {
    // Auto-expand on first ever visit so reviewers see AI in action
    if (typeof window === 'undefined') return false
    const seen = localStorage.getItem('ai-panel-seen')
    if (!seen) {
      localStorage.setItem('ai-panel-seen', '1')
      return true
    }
    return false
  })
  const [cached, setCached] = useState(false)
  const [retryIn, setRetryIn] = useState(0)

  // Auto-fetch when panel is open on mount (first visit auto-expand)
  useEffect(() => {
    if (open && !analysis && !loading) fetchAnalysis()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAnalysis = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, content: content.slice(0, 6000) }),
      })

      if (res.status === 429) {
        const body = await res.json()
        const wait = body.retryAfter || 15
        setRetryIn(wait)
        const interval = setInterval(() => {
          setRetryIn(prev => {
            if (prev <= 1) { clearInterval(interval); return 0 }
            return prev - 1
          })
        }, 1000)
        setTimeout(() => fetchAnalysis(), wait * 1000)
        setLoading(false)
        return
      }

      const { data, cached: wasCached } = await res.json()
      setAnalysis(data)
      setCached(wasCached)
    } catch {
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next && !analysis && !loading) fetchAnalysis()
  }

  const s = analysis?.sentiment ? SENTIMENT_CONFIG[analysis.sentiment.label] : null
  const f = analysis?.factCheck ? FACT_CHECK_CONFIG[analysis.factCheck.status] : null

  return (
    <div className="my-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden transition-all duration-300">
      {/* Toggle Header */}
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            AI
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-[var(--text)]">AI Intelligence</div>
            <div className="text-[0.65rem] text-[var(--muted)] tracking-wide">
              GEMINI 2.5 FLASH {cached ? '· CACHED' : ''}
            </div>
          </div>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={`text-[var(--muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable Content */}
      {open && (
        <div className="px-4 pb-4 animate-slide-up">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center gap-3 py-3 text-[var(--muted)]">
              <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
              <span className="text-sm">
                {retryIn > 0 ? `Rate limited — retrying in ${retryIn}s...` : 'Analyzing with AI...'}
              </span>
            </div>
          )}

          {/* Analysis Content */}
          {analysis && !loading && (
            <div className="space-y-4">
              {/* TL;DR */}
              <div className="border-l-3 border-[var(--accent)] pl-3 py-1">
                <p className="text-sm text-[var(--text)] leading-relaxed italic">
                  &ldquo;{analysis.tldr}&rdquo;
                </p>
              </div>

              {/* Key Takeaways */}
              {analysis.keyTakeaways.length > 0 && (
                <div>
                  <div className="text-[0.65rem] font-bold text-[var(--accent)] tracking-[0.1em] uppercase mb-2">
                    Key Takeaways
                  </div>
                  <div className="space-y-1.5">
                    {analysis.keyTakeaways.map((point, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <span className="text-[var(--accent)] text-xs mt-0.5 flex-shrink-0">◆</span>
                        <span className="text-sm text-[var(--text-secondary)] leading-snug">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2">
                {s && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                    style={{
                      color: s.color,
                      borderColor: s.color,
                      backgroundColor: `color-mix(in srgb, ${s.color} 8%, transparent)`,
                    }}
                  >
                    {s.icon} {s.label}
                  </span>
                )}
                {f && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border cursor-help"
                    style={{
                      color: f.color,
                      borderColor: f.color,
                      backgroundColor: `color-mix(in srgb, ${f.color} 8%, transparent)`,
                    }}
                    title={analysis.factCheck.note}
                  >
                    {f.icon} {f.label}
                  </span>
                )}
                {analysis.readingLevel && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]">
                    Grade {analysis.readingLevel.grade} · {analysis.readingLevel.label}
                  </span>
                )}
                {analysis.readTimeSaved && (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-[var(--border)] text-[var(--muted)]">
                    Saves {analysis.readTimeSaved}
                  </span>
                )}
              </div>

              {/* Entities */}
              {analysis.entities && (
                <div className="space-y-2">
                  {analysis.entities.people.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase tracking-wide w-16 flex-shrink-0">People</span>
                      {analysis.entities.people.map((p, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)]">{p}</span>
                      ))}
                    </div>
                  )}
                  {analysis.entities.organizations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase tracking-wide w-16 flex-shrink-0">Orgs</span>
                      {analysis.entities.organizations.map((o, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)]">{o}</span>
                      ))}
                    </div>
                  )}
                  {analysis.entities.locations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase tracking-wide w-16 flex-shrink-0">Places</span>
                      {analysis.entities.locations.map((l, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-secondary)]">{l}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Topics */}
              {analysis.topics.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.topics.map((topic, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}

              {/* Fact check note */}
              {analysis.factCheck.note && (
                <p className="text-xs text-[var(--muted)] italic">
                  {analysis.factCheck.note}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

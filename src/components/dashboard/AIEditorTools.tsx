'use client'

import { useState } from 'react'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { AIEditorSuggestion } from '@/types/ai'

interface ArticleForAI {
  slug: string
  title: string
  excerpt: string
  body: string
}

const SAMPLE_ARTICLES: ArticleForAI[] = [
  {
    slug: 'sample-ai-demo',
    title: 'New AI Policy Announced in Malaysia',
    excerpt: 'The government has unveiled a new digital economy framework.',
    body: 'The Malaysian government announced a comprehensive AI policy framework today aimed at positioning the country as a regional hub for artificial intelligence innovation. The new policy includes investments of RM500 million in AI research, training programs for 100,000 workers, and tax incentives for companies developing AI solutions. Industry leaders from Petronas, Grab, and AirAsia have pledged support for the initiative.',
  },
]

export default function AIEditorTools() {
  const [suggestions, setSuggestions] = useState<AIEditorSuggestion | null>(null)
  const [loading, setLoading] = useState(false)
  const [cached, setCached] = useState(false)
  const [provider, setProvider] = useState<string | null>(null)
  const [selectedArticle] = useState(SAMPLE_ARTICLES[0])

  const analyze = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: selectedArticle.slug,
          title: selectedArticle.title,
          content: selectedArticle.body,
          excerpt: selectedArticle.excerpt,
        }),
      })

      if (res.ok) {
        const json = await res.json()
        setSuggestions(json.data)
        setCached(json.cached)
        setProvider(json.provider || null)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text)]">AI Editor Tools</h2>
              <p className="text-xs text-[var(--muted)]">
                Optimize headlines, SEO, and tags with AI
                {cached && ' · Cached'}
                {provider && !cached && ` · via ${provider === 'groq' ? 'Groq LLaMA 70B' : 'Gemini Flash'}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {provider && (
              <Badge variant={provider === 'groq' ? 'accent' : 'warning'} size="sm">
                {provider === 'groq' ? 'GROQ' : 'GEMINI'}
              </Badge>
            )}
            <button
              onClick={analyze}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Analyzing...' : suggestions ? 'Re-analyze' : 'Analyze Article'}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Demo article being analyzed */}
        <div className="mb-4 p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-wide mb-1">
            Analyzing
          </div>
          <div className="text-sm font-semibold text-[var(--text)]">{selectedArticle.title}</div>
          <div className="text-xs text-[var(--muted)] mt-1">{selectedArticle.excerpt}</div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-4 justify-center text-[var(--muted)]">
            <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            <span className="text-sm">Generating suggestions with AI...</span>
          </div>
        )}

        {suggestions && !loading && (
          <div className="space-y-4 animate-slide-up">
            {/* Headlines */}
            <div>
              <div className="text-[0.65rem] font-bold text-[var(--accent)] uppercase tracking-[0.1em] mb-2">
                Headline Alternatives
              </div>
              <div className="space-y-2">
                {suggestions.headlines.map((h, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
                  >
                    <Badge variant={h.score >= 90 ? 'success' : h.score >= 80 ? 'warning' : 'default'} size="sm">
                      {h.score}%
                    </Badge>
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">{h.text}</div>
                      <div className="text-xs text-[var(--muted)] mt-0.5">{h.reasoning}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Suggestions */}
            <div>
              <div className="text-[0.65rem] font-bold text-[var(--accent)] uppercase tracking-[0.1em] mb-2">
                SEO Suggestions
              </div>
              <div className="space-y-1.5">
                {suggestions.seoSuggestions.map((s, i) => (
                  <div key={i} className="flex gap-2 items-start text-sm">
                    <span className="text-[var(--accent)] text-xs mt-0.5 flex-shrink-0">◆</span>
                    <span className="text-[var(--text-secondary)]">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto Tags */}
            <div>
              <div className="text-[0.65rem] font-bold text-[var(--accent)] uppercase tracking-[0.1em] mb-2">
                Auto-Generated Tags
              </div>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.autoTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent)] font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Excerpt */}
            {suggestions.excerptSuggestion && (
              <div>
                <div className="text-[0.65rem] font-bold text-[var(--accent)] uppercase tracking-[0.1em] mb-2">
                  Suggested Excerpt
                </div>
                <p className="text-sm text-[var(--text-secondary)] italic border-l-3 border-[var(--accent)] pl-3">
                  {suggestions.excerptSuggestion}
                </p>
              </div>
            )}
          </div>
        )}

        {!suggestions && !loading && (
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-[var(--muted)]">
              Click &ldquo;Analyze Article&rdquo; to generate AI-powered suggestions for headlines, SEO, and tags.
            </p>
            <p className="text-[0.65rem] text-[var(--muted)]">
              Routes to Groq LLaMA 70B (primary) with Gemini Flash fallback
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

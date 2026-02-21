'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AIInsightsPanel from './AIInsightsPanel'
import LanguageToggle from './LanguageToggle'
import AudioMode from './AudioMode'
import ArticleChat from './ArticleChat'
import { usePersonalization } from '@/hooks/usePersonalization'

interface Props {
  slug: string
  title: string
  body: string // plain text content for AI processing
  categorySlug?: string
  isPremium?: boolean
  hasAccess?: boolean
}

const LOCKED_FEATURES = [
  { icon: '✦', name: 'AI Analysis', desc: 'Summary, sentiment, entities' },
  { icon: '🌐', name: 'Translation', desc: 'English to Bahasa Malaysia' },
  { icon: '🎧', name: 'Audio Mode', desc: 'Listen to article aloud' },
  { icon: '💬', name: 'Ask AI', desc: 'Chat about this article' },
]

function AIFeaturesLocked() {
  return (
    <div className="my-5 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent)] text-white text-[0.6rem] font-black flex-shrink-0">
            AI
          </span>
          <div>
            <div className="text-sm font-semibold text-[var(--text)]">AI Features</div>
            <div className="text-[0.6rem] text-[var(--muted)] uppercase tracking-widest">Premium Content</div>
          </div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      {/* Body */}
      <div className="px-4 py-5 text-center">
        {/* Feature preview grid at reduced opacity */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 opacity-50">
          {LOCKED_FEATURES.map((f) => (
            <div
              key={f.name}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)]"
            >
              <span className="text-base flex-shrink-0">{f.icon}</span>
              <div className="text-left">
                <div className="text-xs font-semibold text-[var(--text)]">{f.name}</div>
                <div className="text-[0.6rem] text-[var(--muted)] leading-tight">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm text-[var(--muted)] mb-4">
          Upgrade to unlock AI-powered analysis, translation, audio, and chat for premium articles.
        </p>

        <Link
          href="/plans"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Upgrade Plan
        </Link>

        <p className="text-xs text-[var(--muted)] mt-3">
          Already subscribed?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline">Sign in</Link>
          {' '}to access.
        </p>
      </div>
    </div>
  )
}

export default function AIArticleFeatures({
  slug, title, body, categorySlug, isPremium = false, hasAccess = true,
}: Props) {
  const [displayLang, setDisplayLang] = useState<'en' | 'ms'>('en')
  const [displayContent, setDisplayContent] = useState(body)
  const [displayTitle, setDisplayTitle] = useState(title)
  const { trackRead } = usePersonalization()

  // Track reading for personalization
  useEffect(() => {
    if (categorySlug) {
      trackRead(slug, categorySlug)
    }
  }, [slug, categorySlug, trackRead])

  // Premium article without access — show locked panel
  if (isPremium && !hasAccess) {
    return <AIFeaturesLocked />
  }

  const handleTranslate = (newTitle: string, newContent: string, lang: 'en' | 'ms') => {
    setDisplayTitle(newTitle)
    setDisplayContent(newContent)
    setDisplayLang(lang)
  }

  return (
    <>
      {/* Language Toggle + Audio Mode row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <LanguageToggle
          slug={slug}
          originalTitle={title}
          originalContent={body}
          onTranslate={handleTranslate}
        />
      </div>

      {/* Audio Mode */}
      <AudioMode
        content={displayContent}
        title={displayTitle}
        lang={displayLang}
      />

      {/* AI Insights Panel */}
      <AIInsightsPanel
        slug={slug}
        title={title}
        content={body}
      />

      {/* Article Chat (at the bottom, after article body) */}
      <ArticleChat
        slug={slug}
        title={title}
        content={body}
      />
    </>
  )
}

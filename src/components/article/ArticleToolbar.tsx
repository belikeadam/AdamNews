'use client'

import { useState, useEffect } from 'react'

interface ArticleToolbarProps {
  slug: string
  title: string
  excerpt?: string
  category?: string
}

type FontSize = 'small' | 'medium' | 'large'

const FONT_SIZES: Record<FontSize, string> = {
  small: '1rem',
  medium: '1.125rem',
  large: '1.3rem',
}

export default function ArticleToolbar({ slug, title, excerpt, category }: ArticleToolbarProps) {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Restore font size preference
    const stored = localStorage.getItem('articleFontSize') as FontSize | null
    if (stored && FONT_SIZES[stored]) {
      setFontSize(stored)
      applyFontSize(stored)
    }

    // Check if article is saved
    try {
      const raw = localStorage.getItem('savedArticles')
      if (raw) {
        const list = JSON.parse(raw) as { slug: string }[]
        setSaved(list.some((a) => a.slug === slug))
      }
    } catch { /* ignore */ }
  }, [slug])

  const applyFontSize = (size: FontSize) => {
    const prose = document.querySelector('.prose')
    if (prose) {
      (prose as HTMLElement).style.fontSize = FONT_SIZES[size]
    }
  }

  const cycleFontSize = () => {
    const order: FontSize[] = ['small', 'medium', 'large']
    const next = order[(order.indexOf(fontSize) + 1) % order.length]
    setFontSize(next)
    applyFontSize(next)
    localStorage.setItem('articleFontSize', next)
  }

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem('savedArticles')
      const list = raw ? JSON.parse(raw) : []
      if (saved) {
        const updated = list.filter((a: { slug: string }) => a.slug !== slug)
        localStorage.setItem('savedArticles', JSON.stringify(updated))
        setSaved(false)
      } else {
        list.unshift({ slug, title, excerpt: excerpt || '', category: category || '', savedAt: new Date().toISOString() })
        localStorage.setItem('savedArticles', JSON.stringify(list))
        setSaved(true)
      }
    } catch { /* ignore */ }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href })
      } catch { /* cancelled */ }
    }
  }

  return (
    <div className="sticky top-[2.75rem] z-30 bg-[var(--bg)]/90 backdrop-blur-sm border-b border-[var(--border)] -mx-4 px-4 py-2 mb-6">
      <div className="flex items-center justify-between">
        {/* Left — font size */}
        <button
          onClick={cycleFontSize}
          className="flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          title={`Font size: ${fontSize}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7V4h16v3" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="8" y1="20" x2="16" y2="20" />
          </svg>
          <span className="hidden sm:inline">
            {fontSize === 'small' ? 'A' : fontSize === 'medium' ? 'A+' : 'A++'}
          </span>
        </button>

        {/* Right — actions */}
        <div className="flex items-center gap-1">
          {/* Save/Bookmark */}
          <button
            onClick={toggleSave}
            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
              saved ? 'text-[var(--accent)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            aria-label={saved ? 'Remove from saved' : 'Save article'}
            title={saved ? 'Saved' : 'Save'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Copy link */}
          <button
            onClick={copyLink}
            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
              copied ? 'text-[var(--success)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
            aria-label="Copy link"
            title={copied ? 'Copied!' : 'Copy link'}
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            )}
          </button>

          {/* Share (native on mobile) */}
          {'share' in navigator && (
            <button
              onClick={shareNative}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              aria-label="Share"
              title="Share"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

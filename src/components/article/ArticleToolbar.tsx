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
  const [pageUrl, setPageUrl] = useState('')
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    // Restore font size preference
    const stored = localStorage.getItem('articleFontSize') as FontSize | null
    if (stored && FONT_SIZES[stored]) {
      setFontSize(stored)
      applyFontSize(stored)
    }

    setPageUrl(window.location.href)
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)

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
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: pageUrl })
      } catch { /* cancelled */ }
    }
  }

  return (
    <div className="sticky top-[2.75rem] z-30 -mx-4 px-4 py-2.5 mb-4 sm:mb-6 border-y border-[var(--border)]" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex items-center justify-between">
        {/* Left — font size */}
        <button
          onClick={cycleFontSize}
          className="flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
          title={`Font size: ${fontSize}`}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7V4h16v3" />
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="8" y1="20" x2="16" y2="20" />
          </svg>
          <span>
            {fontSize === 'small' ? 'A' : fontSize === 'medium' ? 'A+' : 'A++'}
          </span>
        </button>

        {/* Right — actions */}
        <div className="flex items-center gap-0.5">
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

          {/* WhatsApp share (critical for Malaysian market) */}
          <a
            href={pageUrl ? `https://wa.me/?text=${encodeURIComponent(title + '\n' + pageUrl)}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted)] hover:text-green-600 transition-colors"
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          {/* Share (native on mobile) */}
          {canShare && (
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

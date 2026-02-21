'use client'

import { useState, useEffect } from 'react'

type Lang = 'en' | 'ms'

interface Props {
  slug: string
  originalTitle: string
  originalContent: string
  onTranslate: (title: string, content: string, lang: Lang) => void
}

export default function LanguageToggle({ slug, originalTitle, originalContent, onTranslate }: Props) {
  const [activeLang, setActiveLang] = useState<Lang>('en')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [translationCache, setTranslationCache] = useState<Record<string, { title: string; content: string }>>({})

  // Auto-clear error after 3s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(''), 3000)
    return () => clearTimeout(t)
  }, [error])

  const switchTo = async (lang: Lang) => {
    if (lang === activeLang) return
    setError('')

    // Switch back to original
    if (lang === 'en') {
      setActiveLang('en')
      onTranslate(originalTitle, originalContent, 'en')
      return
    }

    // Check component-level cache
    if (translationCache[lang]) {
      setActiveLang(lang)
      onTranslate(translationCache[lang].title, translationCache[lang].content, lang)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title: originalTitle,
          content: originalContent.slice(0, 8000),
          targetLang: lang,
        }),
      })

      if (res.ok) {
        const body = await res.json()
        if (body.fallback) {
          // Gemini failed — show error, stay on current language
          setError('Translation unavailable right now')
        } else {
          setTranslationCache(prev => ({ ...prev, [lang]: body.data }))
          setActiveLang(lang)
          onTranslate(body.data.title, body.data.content, lang)
        }
      } else {
        setError('Translation unavailable right now')
      }
    } catch {
      setError('Translation unavailable right now')
    } finally {
      setLoading(false)
    }
  }

  const langs: Array<{ code: Lang; label: string; full: string }> = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'ms', label: 'BM', full: 'Bahasa Malaysia' },
  ]

  return (
    <div className="inline-flex items-center gap-2 flex-wrap">
      <span className="text-[0.65rem] font-semibold text-[var(--muted)] uppercase tracking-wide">
        Read in
      </span>
      <div className="inline-flex rounded-lg border border-[var(--border)] overflow-hidden">
        {langs.map(({ code, label, full }) => (
          <button
            key={code}
            onClick={() => switchTo(code)}
            disabled={loading}
            title={`Read in ${full}`}
            className={`px-3 py-1 text-xs font-bold transition-colors cursor-pointer disabled:cursor-wait ${
              activeLang === code
                ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            } ${code === 'en' ? 'border-r border-[var(--border)]' : ''}`}
          >
            {loading && code !== activeLang ? '...' : label}
          </button>
        ))}
      </div>
      {loading && (
        <span className="text-[0.65rem] text-[var(--accent)] animate-pulse">
          Translating...
        </span>
      )}
      {error && (
        <span className="text-[0.65rem] text-[var(--danger)]">
          {error}
        </span>
      )}
    </div>
  )
}

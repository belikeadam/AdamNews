'use client'

import { useState, useEffect } from 'react'

/* ─── Shared event name ─────────────────────────────── */
export const TRANSLATE_EVENT = 'article-translated'

interface TranslationDetail {
  title: string
  content: string
  lang: 'en' | 'ms'
}

/** Dispatch translation event from AIArticleFeatures */
export function dispatchTranslation(detail: TranslationDetail) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(TRANSLATE_EVENT, { detail }))
  }
}

/* ─── TranslatableTitle ─────────────────────────────── */

export function TranslatableTitle({ children }: { children: React.ReactNode }) {
  const [translated, setTranslated] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const { title, lang } = (e as CustomEvent<TranslationDetail>).detail
      setTranslated(lang === 'en' ? null : title)
    }
    window.addEventListener(TRANSLATE_EVENT, handler)
    return () => window.removeEventListener(TRANSLATE_EVENT, handler)
  }, [])

  if (translated) {
    return <>{translated}</>
  }
  return <>{children}</>
}

/* ─── TranslatableBody ──────────────────────────────── */

function contentToHtml(content: string): string {
  return content
    .split(/\n\n+/)
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

export function TranslatableBody({ children }: { children: React.ReactNode }) {
  const [translatedHtml, setTranslatedHtml] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const { content, lang } = (e as CustomEvent<TranslationDetail>).detail
      if (lang === 'en') {
        setTranslatedHtml(null)
      } else {
        setTranslatedHtml(contentToHtml(content))
      }
    }
    window.addEventListener(TRANSLATE_EVENT, handler)
    return () => window.removeEventListener(TRANSLATE_EVENT, handler)
  }, [])

  if (translatedHtml) {
    return (
      <div className="relative">
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: translatedHtml }}
        />
      </div>
    )
  }

  return <>{children}</>
}

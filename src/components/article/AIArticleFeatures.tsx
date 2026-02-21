'use client'

import { useState, useEffect } from 'react'
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
}

export default function AIArticleFeatures({ slug, title, body, categorySlug }: Props) {
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

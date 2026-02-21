'use client'

import { useEffect, useRef } from 'react'

interface ArticleAnalyticsProps {
  slug: string
}

export default function ArticleAnalytics({ slug }: ArticleAnalyticsProps) {
  const tracked = useRef(false)
  const startTime = useRef(Date.now())
  const milestones = useRef(new Set<number>())

  useEffect(() => {
    // Track view — fire once per page load
    if (!tracked.current) {
      tracked.current = true
      fetch(`/api/articles/${slug}/views`, { method: 'POST' }).catch(() => {})
    }

    // Track scroll depth milestones (25%, 50%, 75%, 100%)
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const percent = Math.round((scrollTop / docHeight) * 100)

      for (const milestone of [25, 50, 75, 100]) {
        if (percent >= milestone && !milestones.current.has(milestone)) {
          milestones.current.add(milestone)
          console.log(`[Analytics] Scroll depth: ${milestone}% — ${slug}`)
        }
      }
    }

    // Track read time on unmount
    const handleUnload = () => {
      const readSeconds = Math.round((Date.now() - startTime.current) / 1000)
      const scrolled = Array.from(milestones.current)
      const maxDepth = scrolled.length > 0 ? Math.max(...scrolled) : 0
      console.log(`[Analytics] Read time: ${readSeconds}s, max scroll: ${maxDepth}% — ${slug}`)

      // Use sendBeacon for reliable delivery on page exit
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          '/api/analytics',
          JSON.stringify({
            type: 'article_read',
            slug,
            readSeconds,
            maxScrollDepth: maxDepth,
            milestones: scrolled,
          })
        )
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('beforeunload', handleUnload)
      handleUnload()
    }
  }, [slug])

  return null
}

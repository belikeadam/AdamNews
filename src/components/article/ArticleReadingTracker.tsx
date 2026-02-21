'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ArticleReadingTrackerProps {
  slug: string
  readTime?: string
}

export default function ArticleReadingTracker({ slug, readTime }: ArticleReadingTrackerProps) {
  const [showNudge, setShowNudge] = useState(false)
  const [savedPercent, setSavedPercent] = useState(0)

  // Check if user has a saved reading position
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`readPos:${slug}`)
      if (raw) {
        const { scrollPercent } = JSON.parse(raw)
        if (scrollPercent > 5 && scrollPercent < 90) {
          setSavedPercent(Math.round(scrollPercent))
          setShowNudge(true)
          // Auto-hide after 8 seconds
          const timer = setTimeout(() => setShowNudge(false), 8000)
          return () => clearTimeout(timer)
        }
      }
    } catch { /* ignore */ }
  }, [slug])

  // Save reading position on scroll (debounced)
  const savePosition = useCallback(() => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight > 0) {
      const scrollPercent = (scrollTop / docHeight) * 100
      try {
        localStorage.setItem(`readPos:${slug}`, JSON.stringify({
          scrollPercent,
          timestamp: Date.now(),
        }))
      } catch { /* ignore */ }
    }
  }, [slug])

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    const handleScroll = () => {
      clearTimeout(timeout)
      timeout = setTimeout(savePosition, 500)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timeout)
    }
  }, [savePosition])

  const scrollToSaved = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const targetY = (savedPercent / 100) * docHeight
    window.scrollTo({ top: targetY, behavior: 'smooth' })
    setShowNudge(false)
  }

  return (
    <AnimatePresence>
      {showNudge && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-14 left-4 right-4 sm:left-auto sm:right-4 z-40 max-w-sm"
        >
          <div className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] shadow-lg px-4 py-3 rounded-lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--accent)] flex-shrink-0">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)]">Continue reading</p>
              <p className="text-xs text-[var(--muted)]">You were {savedPercent}% through this article</p>
            </div>
            <button
              onClick={scrollToSaved}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-medium bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)] transition-colors"
            >
              Resume
            </button>
            <button
              onClick={() => setShowNudge(false)}
              className="flex-shrink-0 p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Article } from '@/types'
import { getCategoryColor } from '@/constants/categories'

interface NextArticleCTAProps {
  articles: Article[]
}

export default function NextArticleCTA({ articles }: NextArticleCTAProps) {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      setVisible(scrollPercent > 0.75)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!articles.length || dismissed) return null

  const next = articles[0]
  const { attributes: a } = next
  const catSlug = a.category?.data?.attributes?.slug
  const catName = a.category?.data?.attributes?.name
  const colors = getCategoryColor(catSlug)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-md shadow-lg"
        >
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: colors.primary }}
            />
            <div className="flex-1 min-w-0">
              <span className="text-[0.6rem] uppercase tracking-wider font-semibold text-[var(--muted)]">
                Up Next
                {catName && (
                  <span style={{ color: colors.primary }}> · {catName}</span>
                )}
              </span>
              <Link
                href={`/articles/${a.slug}`}
                className="block text-sm font-semibold text-[var(--text)] line-clamp-1 hover:text-[var(--accent)] transition-colors"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {a.title}
              </Link>
            </div>
            <Link
              href={`/articles/${a.slug}`}
              className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold text-white rounded-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: colors.primary }}
            >
              Read →
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
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

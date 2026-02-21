'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Article } from '@/types'

interface BreakingNewsBarProps {
  articles: Article[]
  interval?: number
}

export default function BreakingNewsBar({ articles, interval = 4000 }: BreakingNewsBarProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
  }, [articles.length])

  useEffect(() => {
    if (articles.length <= 1) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [next, interval, articles.length])

  if (!articles.length) return null

  const current = articles[currentIndex]
  const { attributes: a } = current

  return (
    <div className="bg-[var(--accent)] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 h-9 flex items-center gap-3 text-sm">
        {/* Badge */}
        <span className="flex items-center gap-1.5 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Trending</span>
        </span>

        {/* Auto-rotating headline */}
        <div className="flex-1 min-w-0 relative h-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Link
                href={`/articles/${a.slug}`}
                className="block truncate text-sm text-white/90 hover:text-white transition-colors leading-5"
              >
                {a.title}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Counter + View all */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[0.6rem] text-white/50 hidden sm:inline">
            {currentIndex + 1}/{articles.length}
          </span>
          <Link
            href="/search?sort=trending"
            className="text-[0.65rem] font-medium text-white/70 hover:text-white transition-colors whitespace-nowrap"
          >
            View all
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      {articles.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/20">
          <motion.div
            key={currentIndex}
            className="h-full bg-white/60"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: interval / 1000, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  )
}

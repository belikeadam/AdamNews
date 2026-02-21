'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  // Don't show for authenticated users or if dismissed
  if (dismissed || isAuthenticated) return null

  // Reserve space during loading to prevent layout shift
  if (isLoading) {
    return <div className="h-10 sm:h-9 bg-[var(--accent)]" />
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[var(--accent)] border-b border-[var(--accent)] px-3 sm:px-4 py-2 text-white flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
      >
        <span className="text-sm">&#128273;</span>
        <span className="font-medium text-xs sm:text-sm">Demo Mode</span>
        <span className="text-white/50 hidden sm:inline">|</span>
        <Link
          href="/login"
          className="underline font-semibold hover:text-white/80 transition-colors text-xs sm:text-sm"
        >
          Try the demo
        </Link>
        <span className="text-white/50 hidden sm:inline">|</span>
        <span className="text-[0.65rem] sm:text-xs text-white/80 hidden sm:inline">One-click sign in</span>
        <button
          onClick={() => setDismissed(true)}
          className="ml-1 sm:ml-2 text-white/60 hover:text-white transition-colors text-lg leading-none"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

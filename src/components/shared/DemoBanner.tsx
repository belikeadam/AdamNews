'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  if (dismissed || isLoading || isAuthenticated) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-[var(--accent)] border-b border-[var(--accent)] px-4 py-2 text-sm text-white flex items-center justify-center gap-2 flex-wrap"
      >
        <span>&#128273;</span>
        <span className="font-medium">Demo Mode</span>
        <span className="text-white/50">|</span>
        <Link
          href="/login"
          className="underline font-semibold hover:text-white/80 transition-colors"
        >
          Click here to try the demo
        </Link>
        <span className="text-white/50">|</span>
        <span className="text-xs text-white/80">One-click sign in available</span>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-white/60 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

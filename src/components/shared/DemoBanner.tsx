'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'

const ADMIN_QUICK_LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/plans', label: 'Plans' },
] as const

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const pathname = usePathname()

  // Don't show on login page (redundant with demo buttons there)
  if (pathname === '/login') return null

  // Don't show if dismissed
  if (dismissed) return null

  // Reserve space during loading to prevent layout shift
  if (isLoading) {
    return <div className="h-10 sm:h-9 bg-[var(--accent)]" />
  }

  // Authenticated admin: show quick-nav guide to key features
  if (isAuthenticated && isAdmin) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[var(--surface)] border-b border-[var(--border)] px-3 sm:px-4 py-2 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap"
        >
          <span className="text-xs sm:text-sm font-medium text-[var(--accent)]">Explore:</span>
          {ADMIN_QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs sm:text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-[var(--accent)] underline'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => setDismissed(true)}
            className="ml-1 sm:ml-2 text-[var(--muted)] hover:text-[var(--text)] transition-colors text-lg leading-none"
            aria-label="Dismiss"
          >
            &times;
          </button>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Not authenticated: show demo sign-in prompt
  if (!isAuthenticated) {
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
          <span className="text-white/40">|</span>
          <Link
            href="/login"
            className="underline font-semibold hover:text-white/80 transition-colors text-xs sm:text-sm"
          >
            Sign in to view full implementation
          </Link>
          <span className="text-white/40 hidden sm:inline">|</span>
          <span className="text-[0.65rem] sm:text-xs text-white/70 hidden sm:inline">
            Dashboard, API Docs, Architecture, CMS
          </span>
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

  return null
}

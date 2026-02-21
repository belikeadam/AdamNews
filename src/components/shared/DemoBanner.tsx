'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()

  if (dismissed || isLoading || isAuthenticated) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2 flex-wrap">
      <span>&#128273;</span>
      <span className="font-medium">Demo Mode</span>
      <span className="text-amber-600 dark:text-amber-400">|</span>
      <Link
        href="/login"
        className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
      >
        Click here to try the demo
      </Link>
      <span className="text-amber-600 dark:text-amber-400">|</span>
      <span className="text-xs">One-click sign in available</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
        aria-label="Dismiss"
      >
        &times;
      </button>
    </div>
  )
}

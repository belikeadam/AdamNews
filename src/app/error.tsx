'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="section-label mb-4">Error</p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-4"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Something Went Wrong
        </h1>
        <p className="text-[var(--muted)] mb-8 leading-relaxed">
          We encountered an unexpected error loading this page. Please try again
          or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 border border-[var(--border)] text-[var(--text)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

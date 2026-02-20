'use client'

import { useState } from 'react'

export default function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-300 flex items-center justify-center gap-2 flex-wrap">
      <span>&#128273;</span>
      <span className="font-medium">Demo access</span>
      <span className="text-amber-600 dark:text-amber-400">|</span>
      <span>
        Admin: <code className="font-mono">admin@AdamNews.com</code> /{' '}
        <code className="font-mono">demo1234</code>
      </span>
      <span className="text-amber-600 dark:text-amber-400">|</span>
      <span>
        Reader: <code className="font-mono">reader@AdamNews.com</code> /{' '}
        <code className="font-mono">demo1234</code>
      </span>
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

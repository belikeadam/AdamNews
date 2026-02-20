'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ArchCalloutProps {
  title?: string
  apiCall?: string
  caching?: string
  auth?: string
  rationale?: string
  className?: string
}

export default function ArchCallout({
  title = 'How this works',
  apiCall,
  caching,
  auth,
  rationale,
  className,
}: ArchCalloutProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        'border border-[var(--border)] rounded bg-[var(--surface)]',
        className
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors h-11"
      >
        <span className="text-base">&#9432;</span>
        <span className="font-medium">{title}</span>
        <span
          className={cn(
            'ml-auto transition-transform duration-150',
            open && 'rotate-180'
          )}
        >
          &#9662;
        </span>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1.5 text-xs font-mono text-[var(--muted)]">
          {apiCall && (
            <p>
              <span className="text-[var(--accent)]">API:</span> {apiCall}
            </p>
          )}
          {caching && (
            <p>
              <span className="text-green-600 dark:text-green-400">Cache:</span>{' '}
              {caching}
            </p>
          )}
          {auth && (
            <p>
              <span className="text-amber-600 dark:text-amber-400">Auth:</span>{' '}
              {auth}
            </p>
          )}
          {rationale && (
            <p className="text-[var(--muted)] italic">{rationale}</p>
          )}
        </div>
      )}
    </div>
  )
}

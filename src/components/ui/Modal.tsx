'use client'

import { cn } from '@/lib/utils'
import { useEffect, useCallback } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          'relative bg-[var(--bg)] border border-[var(--border)] rounded-lg shadow-lg max-w-lg w-full mx-4 max-h-[85vh] overflow-y-auto',
          className
        )}
        role="dialog"
        aria-modal
        aria-label={title}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--text)]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded hover:bg-[var(--surface)] text-[var(--muted)]"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

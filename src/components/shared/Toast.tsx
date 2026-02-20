'use client'

import { cn } from '@/lib/utils'
import type { Toast as ToastType } from '@/hooks/useToast'

interface ToastContainerProps {
  toasts: ToastType[]
  onRemove: (id: string) => void
}

export default function ToastContainer({
  toasts,
  onRemove,
}: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'px-4 py-3 rounded shadow-lg border text-sm font-medium flex items-center gap-3 animate-in slide-in-from-right',
            {
              'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300':
                toast.type === 'success',
              'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300':
                toast.type === 'error',
              'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300':
                toast.type === 'info',
            }
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            className="opacity-60 hover:opacity-100"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  )
}

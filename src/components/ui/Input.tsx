'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--text)] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            'w-full h-11 px-3 rounded border bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
            error
              ? 'border-[var(--danger)]'
              : 'border-[var(--border)]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-[var(--danger)]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input

'use client'

import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] hover:scale-[1.02] focus-visible:ring-[var(--accent)]':
              variant === 'primary',
            'bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)] border border-[var(--border)]':
              variant === 'secondary',
            'border border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface)] bg-transparent':
              variant === 'outline',
            'text-[var(--text)] hover:bg-[var(--surface)] bg-transparent':
              variant === 'ghost',
            'bg-[var(--danger)] text-white hover:opacity-90 focus-visible:ring-[var(--danger)]':
              variant === 'danger',
          },
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-5 text-sm': size === 'md',
            'h-12 px-8 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'purple'
  size?: 'sm' | 'md'
  pill?: boolean
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  pill = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase tracking-wider',
        pill
          ? {
              'bg-[var(--surface-2)] text-[var(--muted)] px-3 py-1 rounded-full': variant === 'default',
              'bg-[var(--accent)] text-white px-3 py-1 rounded-full': variant === 'accent',
              'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 px-3 py-1 rounded-full': variant === 'success',
              'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-400 px-3 py-1 rounded-full': variant === 'warning',
              'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400 px-3 py-1 rounded-full': variant === 'danger',
              'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-400 px-3 py-1 rounded-full': variant === 'purple',
            }
          : {
              'text-[var(--muted)]': variant === 'default',
              'text-[var(--accent)]': variant === 'accent',
              'text-green-700 dark:text-green-400': variant === 'success',
              'text-amber-700 dark:text-amber-400': variant === 'warning',
              'text-red-700 dark:text-red-400': variant === 'danger',
              'text-purple-700 dark:text-purple-400': variant === 'purple',
            },
        {
          'text-[0.65rem]': size === 'sm',
          'text-xs': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

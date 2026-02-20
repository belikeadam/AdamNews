import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'purple'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-sm',
        {
          'bg-[var(--surface-2)] text-[var(--muted)]': variant === 'default',
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400':
            variant === 'accent',
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
            variant === 'success',
          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400':
            variant === 'warning',
          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
            variant === 'danger',
          'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400':
            variant === 'purple',
        },
        {
          'px-1.5 py-0.5 text-xs': size === 'sm',
          'px-2 py-1 text-sm': size === 'md',
        },
        className
      )}
    >
      {children}
    </span>
  )
}

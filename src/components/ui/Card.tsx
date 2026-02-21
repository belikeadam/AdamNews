import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function Card({ children, className, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg)] border border-[var(--border)] overflow-hidden',
        hover && 'transition-colors hover:bg-[var(--surface)]',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-3 py-3 sm:px-5 sm:py-4 border-b border-[var(--border)]', className)}>
      {children}
    </div>
  )
}

export function CardContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('px-3 py-3 sm:px-5 sm:py-4', className)}>{children}</div>
}

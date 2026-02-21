'use client'

import { getCategoryColor } from '@/constants/categories'

interface CategoryBadgeProps {
  name: string
  slug: string
  variant?: 'label' | 'pill' | 'dot'
  className?: string
}

export default function CategoryBadge({ name, slug, variant = 'label', className = '' }: CategoryBadgeProps) {
  const colors = getCategoryColor(slug)
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const color = isDark ? colors.darkText : colors.text

  if (variant === 'dot') {
    return (
      <span className={`flex items-center gap-1.5 ${className}`}>
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: colors.primary }}
        />
        <span
          className="text-[0.7rem] font-semibold uppercase tracking-[0.1em]"
          style={{ color }}
        >
          {name}
        </span>
      </span>
    )
  }

  if (variant === 'pill') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider rounded-sm ${className}`}
        style={{
          backgroundColor: isDark ? colors.dark : colors.light,
          color,
        }}
      >
        {name}
      </span>
    )
  }

  // Default: label with colored left border
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] ${className}`}
      style={{ color }}
    >
      <span
        className="w-0.5 h-3 rounded-full"
        style={{ backgroundColor: colors.primary }}
      />
      {name}
    </span>
  )
}

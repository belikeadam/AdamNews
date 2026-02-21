'use client'

import { cn } from '@/lib/utils'
import type { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onSelect: (slug: string | null) => void
}

export default function CategoryFilter({
  categories,
  selected,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="border-b border-[var(--border)]">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
            !selected
              ? 'border-[var(--text)] text-[var(--text)]'
              : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.attributes.slug)}
            className={cn(
              'pb-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              selected === cat.attributes.slug
                ? 'border-[var(--text)] text-[var(--text)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {cat.attributes.name}
          </button>
        ))}
      </div>
    </div>
  )
}

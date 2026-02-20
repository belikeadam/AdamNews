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
    <div className="sticky top-14 z-30 bg-[var(--bg)] border-b border-[var(--border)] overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 h-12 min-w-max">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            'h-8 px-3 rounded text-sm font-medium transition-colors whitespace-nowrap',
            !selected
              ? 'bg-[var(--accent)] text-white'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.attributes.slug)}
            className={cn(
              'h-8 px-3 rounded text-sm font-medium transition-colors whitespace-nowrap',
              selected === cat.attributes.slug
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
            )}
          >
            {cat.attributes.name}
          </button>
        ))}
      </div>
    </div>
  )
}

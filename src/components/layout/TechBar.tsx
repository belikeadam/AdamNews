import Badge from '@/components/ui/Badge'

interface TechBarProps {
  badges: {
    label: string
    tooltip: string
    variant?: 'default' | 'accent' | 'success' | 'warning' | 'purple'
  }[]
}

export default function TechBar({ badges }: TechBarProps) {
  return (
    <div className="bg-[var(--surface)] border-b border-[var(--border)] h-8 flex items-center overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 w-full">
        {badges.map((badge) => (
          <span key={badge.label} title={badge.tooltip}>
            <Badge variant={badge.variant || 'default'} size="sm">
              {badge.label}
            </Badge>
          </span>
        ))}
      </div>
    </div>
  )
}

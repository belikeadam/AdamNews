interface AdSlotProps {
  position: 'banner' | 'sidebar' | 'in-article'
  className?: string
}

const AD_SIZES = {
  banner: { width: 728, height: 90, label: 'Leaderboard — 728×90' },
  sidebar: { width: 300, height: 250, label: 'Medium Rectangle — 300×250' },
  'in-article': { width: 468, height: 60, label: 'Full Banner — 468×60' },
}

export default function AdSlot({ position, className = '' }: AdSlotProps) {
  const { label } = AD_SIZES[position]

  return (
    <div
      className={`flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]/50 text-[var(--muted)] ${className}`}
      style={{
        minHeight: position === 'sidebar' ? 250 : position === 'banner' ? 90 : 60,
      }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="text-center py-4 px-3">
        <p className="text-[0.6rem] uppercase tracking-[0.15em] mb-0.5 opacity-40 font-medium">
          Advertisement
        </p>
        <p className="text-[0.6rem] opacity-30">{label}</p>
      </div>
    </div>
  )
}

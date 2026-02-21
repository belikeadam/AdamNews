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
      className={`flex items-center justify-center border border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] ${className}`}
      style={{
        minHeight: position === 'sidebar' ? 250 : position === 'banner' ? 90 : 60,
      }}
      role="complementary"
      aria-label="Advertisement"
    >
      <div className="text-center py-4 px-3">
        <p className="text-[0.65rem] uppercase tracking-widest mb-1 opacity-60">
          Advertisement
        </p>
        <p className="text-xs opacity-40">{label}</p>
      </div>
    </div>
  )
}

import Badge from '@/components/ui/Badge'

type RenderStrategy = 'SSR' | 'ISR' | 'SSG' | 'CSR'

const STRATEGY_CONFIG: Record<
  RenderStrategy,
  { variant: 'success' | 'warning' | 'accent' | 'purple'; tooltip: string }
> = {
  SSR: {
    variant: 'success',
    tooltip: 'Server-rendered per request — fresh data every time',
  },
  ISR: {
    variant: 'warning',
    tooltip: 'Incrementally Static Regenerated — cached, revalidates every 60s',
  },
  SSG: {
    variant: 'accent',
    tooltip: 'Static Site Generated — built at deploy time',
  },
  CSR: {
    variant: 'purple',
    tooltip: 'Client-Side Rendered — fetched in browser',
  },
}

interface RenderBadgeProps {
  strategy: RenderStrategy
  className?: string
}

export default function RenderBadge({ strategy, className }: RenderBadgeProps) {
  const config = STRATEGY_CONFIG[strategy]

  return (
    <span title={config.tooltip} className={className}>
      <Badge variant={config.variant}>{strategy}</Badge>
    </span>
  )
}

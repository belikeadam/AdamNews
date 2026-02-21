import Card, { CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  sparkline?: number[]
}

export default function MetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  sparkline,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent>
        <p className="text-sm text-[var(--muted)] mb-1">{title}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl sm:text-2xl font-bold text-[var(--text)] truncate">{value}</p>
            {change && (
              <p
                className={cn('text-xs font-medium mt-1', {
                  'text-[var(--success)]': trend === 'up',
                  'text-[var(--danger)]': trend === 'down',
                  'text-[var(--muted)]': trend === 'neutral',
                })}
              >
                {trend === 'up' && '\u2191 '}
                {trend === 'down' && '\u2193 '}
                {change}
              </p>
            )}
          </div>
          {sparkline && (
            <div className="flex items-end gap-0.5 h-8">
              {sparkline.map((v, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1.5 rounded-sm',
                    trend === 'up'
                      ? 'bg-[var(--success)]'
                      : trend === 'down'
                        ? 'bg-[var(--danger)]'
                        : 'bg-[var(--muted)]'
                  )}
                  style={{ height: `${(v / Math.max(...sparkline)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

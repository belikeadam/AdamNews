'use client'

import { cn } from '@/lib/utils'

interface BarChartProps {
  data: { label: string; value: number }[]
  title?: string
  horizontal?: boolean
  color?: string
}

export default function BarChart({
  data,
  title,
  horizontal = false,
  color = 'var(--accent)',
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div>
      {title && (
        <h4 className="text-sm font-medium text-[var(--text)] mb-3">
          {title}
        </h4>
      )}

      {horizontal ? (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted)] w-20 text-right shrink-0">
                {item.label}
              </span>
              <div className="flex-1 h-6 bg-[var(--surface-2)] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="text-xs text-[var(--muted)] w-12">
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end gap-1.5 h-40">
          {data.map((item) => (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className={cn('w-full rounded-t transition-all duration-300')}
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
                title={`${item.label}: ${item.value}`}
              />
              <span className="text-[10px] text-[var(--muted)] truncate w-full text-center">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

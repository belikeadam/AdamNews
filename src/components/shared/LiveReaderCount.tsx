'use client'

import { useState, useEffect } from 'react'

interface LiveReaderCountProps {
  views?: number
  className?: string
}

export default function LiveReaderCount({ views = 0, className = '' }: LiveReaderCountProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Generate a realistic-looking "live" reader count
    // based on views and time of day
    const hour = new Date().getHours()
    const timeMultiplier = hour >= 8 && hour <= 22 ? 1.5 : 0.5
    const base = Math.max(12, Math.floor((views * 0.02 + 15) * timeMultiplier))
    const variance = Math.floor(Math.random() * 20) - 10
    setCount(Math.max(5, base + variance))

    // Simulate fluctuation
    const interval = setInterval(() => {
      setCount(prev => {
        const delta = Math.floor(Math.random() * 5) - 2
        return Math.max(5, prev + delta)
      })
    }, 8000)

    return () => clearInterval(interval)
  }, [views])

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-[var(--muted)] ${className}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className="animate-live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      <span>{count} reading now</span>
    </span>
  )
}

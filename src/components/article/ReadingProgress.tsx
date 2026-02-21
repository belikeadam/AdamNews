'use client'

import { useEffect, useState } from 'react'

interface ReadingProgressProps {
  color?: string
}

export default function ReadingProgress({ color }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight > 0) {
        setProgress(Math.min((scrollTop / docHeight) * 100, 100))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-[2.75rem] left-0 right-0 z-50 h-[2px] bg-transparent pointer-events-none">
      <div
        className="h-full transition-[width] duration-75 ease-linear"
        style={{ width: `${progress}%`, backgroundColor: color || 'var(--accent)' }}
      />
    </div>
  )
}

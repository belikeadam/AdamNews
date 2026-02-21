'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface AdSlotProps {
  position: 'banner' | 'sidebar' | 'in-article'
  className?: string
}

const PROMOS = {
  banner: [
    {
      title: 'Subscribe for ad-free reading',
      description: 'Get unlimited access to premium articles, exclusive content, and zero ads.',
      cta: 'View Plans',
      href: '/plans',
      gradient: 'from-[var(--accent)] to-[#6b0000]',
    },
    {
      title: 'The Morning Briefing',
      description: "Malaysia's top stories delivered to your inbox every morning.",
      cta: 'Subscribe Free',
      href: '#newsletter',
      gradient: 'from-blue-600 to-blue-800',
    },
  ],
  sidebar: [
    {
      title: 'Go Premium',
      description: 'Unlock all articles, API access, and more.',
      cta: 'Upgrade Now',
      href: '/plans',
      gradient: 'from-amber-500 to-amber-700',
    },
  ],
  'in-article': [
    {
      title: 'Enjoying this article?',
      description: 'Subscribe for unlimited access to all our premium content.',
      cta: 'See Plans',
      href: '/plans',
      gradient: 'from-emerald-600 to-emerald-800',
    },
  ],
}

export default function AdSlot({ position, className = '' }: AdSlotProps) {
  const [promoIndex, setPromoIndex] = useState(0)
  const promos = PROMOS[position]

  useEffect(() => {
    setPromoIndex(Math.floor(Math.random() * promos.length))
  }, [promos.length])

  const promo = promos[promoIndex]

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        minHeight: position === 'sidebar' ? 100 : position === 'banner' ? 80 : 56,
      }}
      role="complementary"
      aria-label="Promotion"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${promo.gradient}`} />
      <div className="relative flex items-center justify-between gap-4 px-5 py-4 h-full">
        <div className="flex-1 min-w-0">
          <p className="text-[0.55rem] uppercase tracking-[0.15em] text-white/50 font-medium mb-1">
            Sponsored
          </p>
          <h3 className="text-sm sm:text-base font-bold text-white mb-1" style={{ fontFamily: 'var(--font-headline)' }}>
            {promo.title}
          </h3>
          <p className="text-xs text-white/70 line-clamp-2">
            {promo.description}
          </p>
        </div>
        <Link
          href={promo.href}
          className="flex-shrink-0 px-4 py-2 text-xs font-semibold bg-white/20 hover:bg-white/30 text-white rounded-lg backdrop-blur-sm transition-colors"
        >
          {promo.cta}
        </Link>
      </div>
    </div>
  )
}

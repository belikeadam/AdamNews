'use client'

import Link from 'next/link'
import { ScrollReveal, ScrollStagger, ScrollStaggerItem } from '@/components/motion'

interface AIShowcaseProps {
  firstArticleSlug?: string
}

const AI_FEATURES = [
  {
    icon: '✦',
    title: 'AI Analysis',
    description: 'Instant TL;DR, sentiment, fact-check, entities',
    cta: 'Try on article',
    linkType: 'article' as const,
  },
  {
    icon: '🌐',
    title: 'Translation',
    description: 'One-click English to Bahasa Malaysia',
    cta: 'Try on article',
    linkType: 'article' as const,
  },
  {
    icon: '📰',
    title: 'AI Digest',
    description: 'Personalised daily briefing from your interests',
    cta: 'View digest',
    linkType: 'digest' as const,
  },
  {
    icon: '💬',
    title: 'Ask AI',
    description: 'Chat about any article, grounded answers only',
    cta: 'Try on article',
    linkType: 'article' as const,
  },
]

export default function AIShowcase({ firstArticleSlug }: AIShowcaseProps) {
  const articleLink = firstArticleSlug ? `/articles/${firstArticleSlug}` : '/search'

  return (
    <ScrollReveal className="my-6">
      <div
        className="rounded-xl border border-[var(--border)] overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(var(--accent-rgb, 59, 130, 246), 0.04) 0%, transparent 60%)' }}
      >
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--accent)] text-white text-[0.6rem] font-black">
              AI
            </span>
            <span className="text-[0.6rem] font-bold text-[var(--muted)] uppercase tracking-[0.15em]">
              Powered by Groq LLaMA 3.3 + Gemini Flash
            </span>
          </div>
          <span className="flex-1" />
          <span className="text-[0.55rem] text-[var(--muted)] hidden sm:inline">
            Multi-model routing with automatic failover
          </span>
        </div>

        <div className="p-4">
          <ScrollStagger className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {AI_FEATURES.map((feature) => (
              <ScrollStaggerItem key={feature.title}>
                <Link
                  href={feature.linkType === 'digest' ? '/digest' : articleLink}
                  className="group block h-full p-3.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] hover:bg-[var(--surface)] transition-all"
                >
                  <div className="text-lg mb-2">{feature.icon}</div>
                  <h3 className="text-sm font-semibold text-[var(--text)] mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-[0.7rem] text-[var(--muted)] leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  <span className="text-[0.65rem] font-semibold text-[var(--accent)] group-hover:underline">
                    {feature.cta} →
                  </span>
                </Link>
              </ScrollStaggerItem>
            ))}
          </ScrollStagger>
        </div>

        <div className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)]">
          <span className="text-[0.6rem] text-[var(--muted)]">
            AI features available on all free articles
          </span>
          <Link href="/plans" className="text-[0.6rem] font-semibold text-[var(--accent)] hover:underline">
            Upgrade for premium article AI →
          </Link>
        </div>
      </div>
    </ScrollReveal>
  )
}

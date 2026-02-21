'use client'

import ArticleCard from '@/components/reader/ArticleCard'
import { ScrollReveal, ScrollStagger, ScrollStaggerItem } from '@/components/motion'
import type { Article } from '@/types'

interface RelatedArticlesProps {
  articles: Article[]
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles.length) return null

  return (
    <section className="mt-8 sm:mt-12">
      <ScrollReveal direction="left">
        <div className="flex items-center gap-4 mb-4 sm:mb-6">
          <h2 className="section-label whitespace-nowrap">Related Articles</h2>
          <hr className="flex-1 border-t border-[var(--border)]" />
        </div>
      </ScrollReveal>
      <ScrollStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {articles.map((ra) => (
          <ScrollStaggerItem key={ra.id}>
            <ArticleCard article={ra} />
          </ScrollStaggerItem>
        ))}
      </ScrollStagger>
    </section>
  )
}

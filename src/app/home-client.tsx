'use client'

import { useState } from 'react'
import ArticleCard from '@/components/reader/ArticleCard'
import CategoryFilter from '@/components/reader/CategoryFilter'
import Badge from '@/components/ui/Badge'
import Card, { CardContent } from '@/components/ui/Card'
import type { Article, Category } from '@/types'

interface HomeClientProps {
  articles: Article[]
  categories: Category[]
  trending: Article[]
}

export default function HomeClient({
  articles,
  categories,
  trending,
}: HomeClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered = selectedCategory
    ? articles.filter(
        (a) => a.attributes.category?.data?.attributes?.slug === selectedCategory
      )
    : articles

  return (
    <>
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="grid lg:grid-cols-[1fr,300px] gap-8 mt-6">
        {/* Article grid */}
        <div>
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl mb-2">&#128240;</p>
              <p className="text-[var(--muted)]">
                No articles in this category yet
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden lg:block space-y-4">
          {/* Trending Now */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-[var(--text)] mb-3">
                Trending Now
              </h3>
              <div className="space-y-3">
                {trending.slice(0, 5).map((article, i) => (
                  <div key={article.id} className="flex gap-3">
                    <span className="text-xl font-bold text-[var(--muted)]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)] line-clamp-2">
                        {article.attributes.title}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {article.attributes.readTime || '3 min read'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-[var(--text)] mb-3">
                Core Web Vitals
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">LCP</span>
                  <Badge variant="success">1.2s</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">CLS</span>
                  <Badge variant="success">0.05</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">INP</span>
                  <Badge variant="success">85ms</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted)]">FCP</span>
                  <Badge variant="success">0.8s</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscriber Count */}
          <Card>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-[var(--text)]">1,247</p>
              <p className="text-sm text-[var(--muted)]">Active subscribers</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </>
  )
}

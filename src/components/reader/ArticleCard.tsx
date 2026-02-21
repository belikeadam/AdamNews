import Link from 'next/link'
import { formatDate, getArticleCoverUrl, truncate } from '@/lib/utils'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'horizontal'
}

export default function ArticleCard({ article, variant = 'default' }: ArticleCardProps) {
  const { attributes: a } = article
  const coverUrl = getArticleCoverUrl(
    a.cover?.data?.attributes?.formats?.medium?.url || a.cover?.data?.attributes?.url,
    a.slug,
    800,
    600,
    a.coverUrl
  )
  const categoryName = a.category?.data?.attributes?.name
  const authorName = a.author?.data?.attributes?.name

  if (variant === 'horizontal') {
    return (
      <Link href={`/articles/${a.slug}`} className="group flex gap-4">
        <div className="relative w-28 h-20 flex-shrink-0 overflow-hidden bg-[var(--surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt={a.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          {categoryName && <span className="section-label">{categoryName}</span>}
          <h3 className="headline-md text-base line-clamp-2 mt-0.5 group-hover:text-[var(--accent)] transition-colors">
            {a.title}
          </h3>
          <span className="byline mt-1 block">
            {authorName && `By ${authorName}`}
            {a.publishedAt && ` · ${formatDate(a.publishedAt)}`}
          </span>
        </div>
      </Link>
    )
  }

  if (variant === 'compact') {
    return (
      <Link href={`/articles/${a.slug}`} className="group block pb-5 border-b border-[var(--border)]">
        {categoryName && <span className="section-label">{categoryName}</span>}
        <h3 className="headline-md line-clamp-2 mt-1 mb-1.5 group-hover:text-[var(--accent)] transition-colors">
          {a.title}
        </h3>
        {a.excerpt && (
          <p className="text-sm text-[var(--muted)] line-clamp-2 mb-2 leading-relaxed">
            {truncate(a.excerpt, 100)}
          </p>
        )}
        <span className="byline">
          {authorName && `By ${authorName}`}
          {a.publishedAt && ` · ${formatDate(a.publishedAt)}`}
        </span>
      </Link>
    )
  }

  return (
    <Link href={`/articles/${a.slug}`} className="group block pb-6 border-b border-[var(--border)]">
      <div className="relative aspect-[16/10] overflow-hidden mb-3 bg-[var(--surface-2)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverUrl}
          alt={a.title}
          className="w-full h-full object-cover"
        />
      </div>
      {categoryName && <span className="section-label">{categoryName}</span>}
      <h3 className="headline-md line-clamp-2 mt-1 mb-2 group-hover:text-[var(--accent)] transition-colors">
        {a.title}
      </h3>
      {a.excerpt && (
        <p className="text-sm text-[var(--muted)] line-clamp-2 mb-2 leading-relaxed">
          {truncate(a.excerpt, 120)}
        </p>
      )}
      <span className="byline">
        {authorName && `By ${authorName}`}
        {a.publishedAt && ` · ${formatDate(a.publishedAt)}`}
      </span>
    </Link>
  )
}

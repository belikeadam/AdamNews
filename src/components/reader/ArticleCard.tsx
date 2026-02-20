import Link from 'next/link'
import Image from 'next/image'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import RenderBadge from '@/components/shared/RenderBadge'
import { formatDate, getStrapiMediaUrl, truncate } from '@/lib/utils'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const { attributes: a } = article
  const coverUrl = getStrapiMediaUrl(
    a.cover?.data?.attributes?.formats?.medium?.url ||
      a.cover?.data?.attributes?.url
  )
  const categoryName = a.category?.data?.attributes?.name
  const categoryColor = a.category?.data?.attributes?.color
  const authorName = a.author?.data?.attributes?.name

  return (
    <Link href={`/articles/${a.slug}`}>
      <Card hover className="overflow-hidden h-full flex flex-col">
        <div className="relative aspect-[16/9] bg-[var(--surface-2)]">
          <Image
            src={coverUrl}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            {categoryName && (
              <Badge
                variant="accent"
                className={categoryColor ? `!bg-opacity-90` : ''}
              >
                {categoryName}
              </Badge>
            )}
            {a.premium && <Badge variant="warning">Premium</Badge>}
          </div>
          <div className="absolute top-2 right-2">
            <RenderBadge strategy="ISR" />
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4">
          <h3 className="font-semibold text-[var(--text)] line-clamp-2 mb-2">
            {a.title}
          </h3>
          {a.excerpt && (
            <p className="text-sm text-[var(--muted)] line-clamp-2 mb-3">
              {truncate(a.excerpt, 120)}
            </p>
          )}
          <div className="mt-auto flex items-center gap-2 text-xs text-[var(--muted)]">
            {authorName && <span>{authorName}</span>}
            {a.publishedAt && (
              <>
                <span>&middot;</span>
                <span>{formatDate(a.publishedAt)}</span>
              </>
            )}
            {a.readTime && (
              <>
                <span>&middot;</span>
                <span>{a.readTime}</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

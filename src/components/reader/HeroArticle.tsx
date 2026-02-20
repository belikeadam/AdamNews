import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
import RenderBadge from '@/components/shared/RenderBadge'
import { formatDate, getStrapiMediaUrl } from '@/lib/utils'
import type { Article } from '@/types'

interface HeroArticleProps {
  article: Article
}

export default function HeroArticle({ article }: HeroArticleProps) {
  const { attributes: a } = article
  const coverUrl = getStrapiMediaUrl(
    a.cover?.data?.attributes?.formats?.large?.url ||
      a.cover?.data?.attributes?.url
  )
  const authorName = a.author?.data?.attributes?.name
  const categoryName = a.category?.data?.attributes?.name

  return (
    <Link href={`/articles/${a.slug}`} className="block group">
      <div className="relative rounded-lg overflow-hidden bg-[var(--surface-2)] aspect-[21/9] sm:aspect-[3/1]">
        <Image
          src={coverUrl}
          alt={a.title}
          fill
          sizes="100vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-3">
            {categoryName && (
              <Badge variant="accent">{categoryName}</Badge>
            )}
            {a.premium && <Badge variant="warning">Premium</Badge>}
            <RenderBadge strategy="ISR" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">
            {a.title}
          </h1>
          {a.excerpt && (
            <p className="text-white/80 text-sm sm:text-base line-clamp-2 max-w-2xl mb-3">
              {a.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-white/70 text-sm">
            {authorName && (
              <span className="bg-white/20 px-2 py-0.5 rounded text-white text-xs">
                {authorName}
              </span>
            )}
            {a.publishedAt && <span>{formatDate(a.publishedAt)}</span>}
            {a.readTime && <span>{a.readTime}</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

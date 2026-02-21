import Link from 'next/link'
import Image from 'next/image'
import Badge from '@/components/ui/Badge'
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
      <div className="relative overflow-hidden bg-[var(--surface-2)] aspect-[16/9] sm:aspect-[21/9]">
        {coverUrl && coverUrl !== '/placeholder.svg' ? (
          <Image
            src={coverUrl}
            alt={a.title}
            fill
            sizes="100vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] to-[var(--accent)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              {categoryName && (
                <Badge variant="accent">{categoryName}</Badge>
              )}
              {a.premium && <Badge variant="warning">Premium</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 line-clamp-2 max-w-3xl" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
              {a.title}
            </h1>
            {a.excerpt && (
              <p className="text-white/80 text-sm sm:text-base lg:text-lg line-clamp-2 max-w-2xl mb-4">
                {a.excerpt}
              </p>
            )}
            <div className="flex items-center gap-3 text-white/70 text-sm">
              {authorName && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium">
                  {authorName}
                </span>
              )}
              {a.publishedAt && <span>{formatDate(a.publishedAt)}</span>}
              {a.readTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                  <span>{a.readTime}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

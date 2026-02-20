import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import TechBar from '@/components/layout/TechBar'
import ArticleBody from '@/components/article/ArticleBody'
import PaywallGate from '@/components/article/PaywallGate'
import AuthorBio from '@/components/article/AuthorBio'
import ArticleCard from '@/components/reader/ArticleCard'
import ArchCallout from '@/components/shared/ArchCallout'
import RenderBadge from '@/components/shared/RenderBadge'
import Badge from '@/components/ui/Badge'
import { getArticleBySlug, getRelatedArticles } from '@/lib/api/strapi'
import { formatDate, getStrapiMediaUrl } from '@/lib/utils'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const res = await getArticleBySlug(slug)
    const article = res.data[0]
    if (!article) return { title: 'Article Not Found' }

    return {
      title: article.attributes.title,
      description: article.attributes.excerpt || '',
    }
  } catch {
    return { title: 'Article' }
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params

  let res
  try {
    res = await getArticleBySlug(slug)
  } catch {
    notFound()
  }

  const article = res.data[0]
  if (!article) notFound()

  const { attributes: a } = article
  const categorySlug = a.category?.data?.attributes?.slug
  const author = a.author?.data

  let related = null
  if (categorySlug) {
    try {
      related = await getRelatedArticles(categorySlug, slug)
    } catch {
      // silently fail
    }
  }

  return (
    <>
      <TechBar
        badges={[
          { label: 'ISR \u00b7 60s', tooltip: 'Revalidates every 60 seconds', variant: 'warning' },
          { label: 'Cache-Control: s-maxage=60', tooltip: 'CDN caches for 60s' },
          { label: 'Strapi REST', tooltip: 'Article fetched from Strapi v4' },
        ]}
      />

      <article className="max-w-4xl mx-auto px-4 py-6 pb-20 md:pb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-[var(--muted)] mb-4">
          <Link href="/" className="hover:text-[var(--text)]">
            Home
          </Link>
          <span>&rsaquo;</span>
          {a.category?.data && (
            <>
              <span>{a.category.data.attributes.name}</span>
              <span>&rsaquo;</span>
            </>
          )}
          <span className="text-[var(--text)] truncate">{a.title}</span>
        </nav>

        {/* Render strategy toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <RenderBadge strategy="ISR" />
          <Badge>revalidate: 60s</Badge>
          {a.premium && <Badge variant="warning">Premium</Badge>}
        </div>

        {/* Cover image */}
        {a.cover?.data && (
          <div className="relative aspect-[2/1] rounded-lg overflow-hidden mb-6 bg-[var(--surface-2)]">
            <img
              src={getStrapiMediaUrl(a.cover.data.attributes.url)}
              alt={a.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title and meta */}
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text)] mb-3">
          {a.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)] mb-6">
          {author && (
            <span className="font-medium text-[var(--text)]">
              {author.attributes.name}
            </span>
          )}
          {a.publishedAt && <span>{formatDate(a.publishedAt)}</span>}
          {a.readTime && <span>{a.readTime}</span>}
          <span>{a.views} views</span>
        </div>

        {/* Article body */}
        <ArticleBody
          body={a.body}
          premium={a.premium}
          hasAccess={!a.premium} // TODO: check user plan
        />

        {/* Paywall gate for premium articles */}
        {a.premium && <PaywallGate />}

        {/* Share buttons */}
        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-[var(--border)]">
          <span className="text-sm text-[var(--muted)]">Share:</span>
          <button
            className="h-9 px-3 rounded border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            onClick={() => {}}
          >
            Copy link
          </button>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors flex items-center"
          >
            Twitter/X
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(a.title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3 rounded border border-[var(--border)] text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors flex items-center"
          >
            WhatsApp
          </a>
        </div>

        {/* Author bio */}
        {author && (
          <div className="mt-8">
            <AuthorBio author={author} />
          </div>
        )}

        {/* Architecture callout */}
        <ArchCallout
          apiCall={`GET /api/articles?filters[slug][$eq]=${slug}&populate=*`}
          caching="ISR revalidate: 60s, on-demand via /api/revalidate webhook"
          auth="Public read, premium content gated client-side"
          rationale="ISR enables fast static delivery with near-real-time updates on publish."
          className="mt-6"
        />

        {/* Related articles */}
        {related && related.data.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-[var(--text)] mb-4">
              Related Articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.data.map((ra) => (
                <ArticleCard key={ra.id} article={ra} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}

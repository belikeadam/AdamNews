import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import ArticleBody from '@/components/article/ArticleBody'
import ArticleToolbar from '@/components/article/ArticleToolbar'
import PaywallGate from '@/components/article/PaywallGate'
import AuthorBio from '@/components/article/AuthorBio'
import ReadingProgress from '@/components/article/ReadingProgress'
import ArticleAnalytics from '@/components/article/ArticleAnalytics'
import ArticleReadingTracker from '@/components/article/ArticleReadingTracker'
import RelatedArticles from '@/components/article/RelatedArticles'
import EmojiReactions from '@/components/article/EmojiReactions'
import NextArticleCTA from '@/components/article/NextArticleCTA'
import ShareRow from '@/components/article/ShareRow'
import AdSlot from '@/components/shared/AdSlot'
import LiveReaderCount from '@/components/shared/LiveReaderCount'
import { getArticleBySlug, getRelatedArticles } from '@/lib/api/strapi'
import { formatDate, relativeTime, getArticleCoverUrl } from '@/lib/utils'
import { getCategoryColor } from '@/constants/categories'
import { auth } from '@/lib/auth'

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

    const a = article.attributes
    const coverUrl = getArticleCoverUrl(
      a.cover?.data?.attributes?.url,
      slug,
      1200,
      630,
      a.coverUrl
    )
    const articleUrl = `https://adam-news.vercel.app/articles/${slug}`

    return {
      title: a.title,
      description: a.excerpt || '',
      openGraph: {
        title: a.title,
        description: a.excerpt || '',
        url: articleUrl,
        type: 'article',
        publishedTime: a.publishedAt || undefined,
        authors: a.author?.data?.attributes?.name ? [a.author.data.attributes.name] : undefined,
        images: [{ url: coverUrl, width: 1200, height: 630, alt: a.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: a.title,
        description: a.excerpt || '',
        images: [coverUrl],
      },
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
  const categoryName = a.category?.data?.attributes?.name
  const author = a.author?.data
  const colors = getCategoryColor(categorySlug)

  // Check subscription access for premium articles
  const session = await auth()
  const userPlan = session?.user?.plan || 'free'
  const hasAccess = !a.premium || userPlan === 'premium' || userPlan === 'standard'

  let related = null
  if (categorySlug) {
    try {
      related = await getRelatedArticles(categorySlug, slug)
    } catch {
      // silently fail
    }
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.excerpt || '',
    image: getArticleCoverUrl(a.cover?.data?.attributes?.url, slug, 1200, 630, a.coverUrl),
    datePublished: a.publishedAt || undefined,
    dateModified: a.updatedAt || a.publishedAt || undefined,
    author: author
      ? { '@type': 'Person', name: author.attributes.name }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'The Adam News',
      url: 'https://adam-news.vercel.app',
    },
    mainEntityOfPage: `https://adam-news.vercel.app/articles/${slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgress color={colors.primary} />
      <ArticleAnalytics slug={slug} />
      <ArticleReadingTracker slug={slug} readTime={a.readTime || undefined} />

      {/* Full-bleed cover image */}
      <div className="relative aspect-[5/2] sm:aspect-[2/1] lg:aspect-[3/1] bg-[var(--surface-2)] overflow-hidden">
        <Image
          src={getArticleCoverUrl(a.cover?.data?.attributes?.url, slug, 1200, 800, a.coverUrl)}
          alt={a.title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
      </div>

      <article className="max-w-3xl mx-auto px-4 pb-8 relative -mt-6 sm:-mt-12 z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[var(--muted)] mb-3 sm:mb-6">
          <Link href="/" className="hover:text-[var(--text)] transition-colors flex-shrink-0">
            Home
          </Link>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
          {a.category?.data && (
            <>
              <Link
                href={`/?category=${categorySlug}`}
                className="hover:text-[var(--text)] transition-colors flex-shrink-0 font-medium"
                style={{ color: colors.primary }}
              >
                {categoryName}
              </Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hidden sm:block flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
            </>
          )}
          <span className="hidden sm:inline text-[var(--text)] truncate">{a.title}</span>
        </nav>

        {/* Category label */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          {categoryName && (
            <span className="flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em]" style={{ color: colors.primary }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
              {categoryName}
            </span>
          )}
          {a.premium && <span className="section-label text-amber-700 dark:text-amber-400">Premium</span>}
        </div>

        {/* Title */}
        <h1
          className="text-2xl sm:text-3xl lg:text-[2.75rem] font-bold text-[var(--text)] mb-3 sm:mb-5 leading-tight tracking-tight"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {a.title}
        </h1>

        {/* Byline */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[var(--muted)] mb-3 pb-3 sm:mb-4 sm:pb-4 border-b border-[var(--border)]">
          {author && (
            <span className="inline-flex items-center gap-1.5">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-[0.55rem] font-bold text-white flex-shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                {author.attributes.name[0].toUpperCase()}
              </span>
              <span className="font-medium text-[var(--text)]">
                {author.attributes.name}
              </span>
            </span>
          )}
          {a.publishedAt && (
            <span title={formatDate(a.publishedAt)}>
              {relativeTime(a.publishedAt)}
            </span>
          )}
          {a.readTime && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {a.readTime}
            </span>
          )}
          {a.views !== undefined && a.views > 0 && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {a.views.toLocaleString()} views
            </span>
          )}
          <LiveReaderCount views={a.views} />
        </div>

        {/* Emoji reactions */}
        <div className="mb-4">
          <EmojiReactions slug={slug} views={a.views} />
        </div>

        {/* Sticky article toolbar — font size, save, share */}
        <ArticleToolbar
          slug={slug}
          title={a.title}
          excerpt={a.excerpt || undefined}
          category={categoryName || undefined}
        />

        {/* Premium access banner for subscribers viewing premium content */}
        {a.premium && hasAccess && (
          <div className="flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600 dark:text-emerald-400 flex-shrink-0">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="text-sm text-emerald-700 dark:text-emerald-300">
              Premium article — You have full access with your {userPlan} plan
            </span>
          </div>
        )}

        {/* Article body */}
        <ArticleBody
          body={a.body}
          premium={a.premium}
          hasAccess={hasAccess}
          excerpt={a.excerpt}
        />

        {/* Paywall gate for premium articles without access */}
        {a.premium && !hasAccess && <PaywallGate />}

        {/* In-article ad (only if not gated) */}
        {hasAccess && <AdSlot position="in-article" className="mt-8" />}

        {/* Share row */}
        <ShareRow slug={slug} title={a.title} categoryColor={colors.primary} />

        {/* Author bio */}
        {author && (
          <div className="mt-6 sm:mt-8">
            <AuthorBio author={author} />
          </div>
        )}

        {/* Related articles */}
        {related && related.data.length > 0 && (
          <RelatedArticles articles={related.data} />
        )}
      </article>

      {/* Next article CTA */}
      {related && related.data.length > 0 && (
        <NextArticleCTA articles={related.data} />
      )}
    </>
  )
}

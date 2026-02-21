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
import ArticleCard from '@/components/reader/ArticleCard'
import ArticleReadingTracker from '@/components/article/ArticleReadingTracker'
import RelatedArticles from '@/components/article/RelatedArticles'
import AdSlot from '@/components/shared/AdSlot'
import { getArticleBySlug, getRelatedArticles } from '@/lib/api/strapi'
import { formatDate, relativeTime, getArticleCoverUrl } from '@/lib/utils'
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
      <ReadingProgress />
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
              <Link href={`/?category=${categorySlug}`} className="hover:text-[var(--text)] transition-colors flex-shrink-0">{categoryName}</Link>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="hidden sm:block flex-shrink-0"><polyline points="9 18 15 12 9 6" /></svg>
            </>
          )}
          <span className="hidden sm:inline text-[var(--text)] truncate">{a.title}</span>
        </nav>

        {/* Category label */}
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          {categoryName && <span className="section-label">{categoryName}</span>}
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
            <span className="font-medium text-[var(--text)]">
              By {author.attributes.name}
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
        <div className="flex flex-wrap items-center gap-2 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[var(--border)]">
          <span className="text-xs sm:text-sm font-medium text-[var(--muted)] mr-1">Share this article</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(a.title)}&url=${encodeURIComponent(`https://adam-news.vercel.app/articles/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Share on X"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(a.title + ' — ' + `https://adam-news.vercel.app/articles/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Share on WhatsApp"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://adam-news.vercel.app/articles/${slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
            aria-label="Share on LinkedIn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>

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
    </>
  )
}

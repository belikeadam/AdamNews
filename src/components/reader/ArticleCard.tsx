'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { relativeTime, getArticleCoverUrl, truncate } from '@/lib/utils'
import { getCategoryColor } from '@/constants/categories'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'horizontal'
  showCategory?: boolean
}

function MetaBar({ article }: { article: Article }) {
  const a = article.attributes
  const shares = a.views > 0 ? Math.floor(a.views * 0.15) : 0

  return (
    <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1.5">
      {a.readTime && (
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          {a.readTime}
        </span>
      )}
      {a.views > 0 && (
        <span className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          {a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}k` : a.views}
        </span>
      )}
      {shares > 0 && (
        <span className="flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          {shares}
        </span>
      )}
      {a.premium && (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Premium
        </span>
      )}
      {a.trending && (
        <span className="flex items-center gap-1 text-[var(--accent)] font-medium">
          <span className="animate-flame inline-block">🔥</span>
          Trending
        </span>
      )}
    </div>
  )
}

function BookmarkButton({ article }: { article: Article }) {
  const [saved, setSaved] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedArticles')
      if (raw) {
        const list = JSON.parse(raw) as { slug: string }[]
        setSaved(list.some((a) => a.slug === article.attributes.slug))
      }
    } catch { /* ignore */ }
  }, [article.attributes.slug])

  const toggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const raw = localStorage.getItem('savedArticles')
      const list = raw ? JSON.parse(raw) : []
      const slug = article.attributes.slug
      if (saved) {
        const updated = list.filter((a: { slug: string }) => a.slug !== slug)
        localStorage.setItem('savedArticles', JSON.stringify(updated))
        setSaved(false)
      } else {
        list.unshift({
          slug,
          title: article.attributes.title,
          excerpt: article.attributes.excerpt || '',
          category: article.attributes.category?.data?.attributes?.name || '',
          savedAt: new Date().toISOString(),
        })
        localStorage.setItem('savedArticles', JSON.stringify(list))
        setSaved(true)
        setAnimate(true)
        setTimeout(() => setAnimate(false), 400)
      }
    } catch { /* ignore */ }
  }

  return (
    <motion.button
      onClick={toggle}
      animate={animate ? { scale: [1, 1.3, 1] } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white transition-all duration-200"
      aria-label={saved ? 'Remove from saved' : 'Save article'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    </motion.button>
  )
}

const spring = { type: 'spring' as const, stiffness: 300, damping: 30 }

export default function ArticleCard({ article, variant = 'default', showCategory = true }: ArticleCardProps) {
  const { attributes: a } = article
  const catSlug = a.category?.data?.attributes?.slug
  const colors = getCategoryColor(catSlug)
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
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={spring}
      >
        <Link href={`/articles/${a.slug}`} className="group flex gap-4 py-3.5">
          {/* Category color accent bar */}
          <div
            className="w-0.5 self-stretch rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="relative w-24 h-16 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden bg-[var(--surface-2)]">
            <Image src={coverUrl} alt={a.title} fill sizes="112px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {showCategory && categoryName && (
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.1em]" style={{ color: colors.primary }}>
                  {categoryName}
                </span>
              )}
              {a.premium && <span className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Premium</span>}
              {a.readTime && <span className="text-[0.65rem] text-[var(--muted)]">{a.readTime}</span>}
            </div>
            <h3 className="headline-md text-base line-clamp-2 mt-0.5 group-hover:text-[var(--accent)] transition-colors">
              {a.title}
            </h3>
            <span className="byline mt-1 block">
              {authorName && `By ${authorName}`}
              {a.publishedAt && ` · ${relativeTime(a.publishedAt)}`}
            </span>
          </div>
        </Link>
      </motion.div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileTap={{ scale: 0.98 }}
        whileHover={{ y: -2 }}
        transition={spring}
        className="card-lift"
      >
        <Link href={`/articles/${a.slug}`} className="group flex gap-4 pb-5 border-b border-[var(--border)]">
          {/* Text content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {showCategory && categoryName && (
                <span className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em]" style={{ color: colors.primary }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                  {categoryName}
                </span>
              )}
              {a.premium && <span className="text-[0.6rem] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Premium</span>}
            </div>
            <h3 className="headline-md line-clamp-2 mt-1 mb-1.5 group-hover:text-[var(--accent)] transition-colors">
              {a.title}
            </h3>
            {a.excerpt && (
              <p className="text-sm text-[var(--muted)] line-clamp-2 mb-2 leading-relaxed">
                {truncate(a.excerpt, 100)}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="byline">
                {authorName && `By ${authorName}`}
                {a.publishedAt && ` · ${relativeTime(a.publishedAt)}`}
              </span>
              <MetaBar article={article} />
            </div>
          </div>
          {/* Thumbnail */}
          <div className="relative w-20 h-20 sm:w-28 sm:h-24 flex-shrink-0 overflow-hidden bg-[var(--surface-2)] mt-1">
            <Image
              src={coverUrl}
              alt=""
              fill
              sizes="112px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -3 }}
      transition={spring}
      className="card-lift"
    >
      <Link href={`/articles/${a.slug}`} className="group block pb-6 border-b border-[var(--border)]">
        <div className="relative aspect-[16/10] overflow-hidden mb-3 bg-[var(--surface-2)]">
          {/* Category color top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px] z-10"
            style={{ backgroundColor: colors.primary }}
          />
          <Image
            src={coverUrl}
            alt={a.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
          <BookmarkButton article={article} />
          {a.premium && (
            <span className="absolute top-2.5 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-amber-600 text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-sm">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Premium
            </span>
          )}
          {a.trending && !a.premium && (
            <span
              className="absolute top-2.5 left-2 z-10 flex items-center gap-1 px-2 py-0.5 text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-sm"
              style={{ backgroundColor: colors.primary }}
            >
              <span className="animate-flame inline-block text-[0.5rem]">🔥</span>
              Trending
            </span>
          )}
        </div>

        {categoryName && (
          <span
            className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em]"
            style={{ color: colors.primary }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
            {categoryName}
          </span>
        )}
        <h3 className="headline-md line-clamp-2 mt-1 mb-2 group-hover:text-[var(--accent)] transition-colors">
          {a.title}
        </h3>
        {a.excerpt && (
          <p className="text-sm text-[var(--muted)] line-clamp-2 mb-2 leading-relaxed">
            {truncate(a.excerpt, 120)}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="byline">
            {authorName && `By ${authorName}`}
            {a.publishedAt && ` · ${relativeTime(a.publishedAt)}`}
          </span>
          <MetaBar article={article} />
        </div>

        {/* Read more CTA — slides in on hover */}
        <span
          className="inline-flex items-center gap-1 mt-2 text-[0.65rem] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:gap-1.5"
          style={{ color: colors.primary }}
        >
          Read more
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </Link>
    </motion.div>
  )
}

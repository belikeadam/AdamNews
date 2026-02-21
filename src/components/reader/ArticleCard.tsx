'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { relativeTime, getArticleCoverUrl, truncate } from '@/lib/utils'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'compact' | 'horizontal'
}

function MetaBar({ article }: { article: Article }) {
  const a = article.attributes
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
      {a.trending && (
        <span className="flex items-center gap-1 text-[var(--accent)] font-medium">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          Trending
        </span>
      )}
    </div>
  )
}

function BookmarkButton({ article }: { article: Article }) {
  const [saved, setSaved] = useState(false)

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
      }
    } catch { /* ignore */ }
  }

  return (
    <button
      onClick={toggle}
      className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white/80 hover:bg-black/50 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
      aria-label={saved ? 'Remove from saved' : 'Save article'}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    </button>
  )
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
      <Link href={`/articles/${a.slug}`} className="group flex gap-4 py-4">
        <div className="relative w-24 h-16 sm:w-28 sm:h-20 flex-shrink-0 overflow-hidden bg-[var(--surface-2)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coverUrl} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {categoryName && <span className="section-label">{categoryName}</span>}
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
        <div className="flex items-center justify-between">
          <span className="byline">
            {authorName && `By ${authorName}`}
            {a.publishedAt && ` · ${relativeTime(a.publishedAt)}`}
          </span>
          <MetaBar article={article} />
        </div>
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
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
        />
        <BookmarkButton article={article} />
        {a.trending && (
          <span className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 bg-[var(--accent)] text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-sm">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Trending
          </span>
        )}
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
      <div className="flex items-center justify-between">
        <span className="byline">
          {authorName && `By ${authorName}`}
          {a.publishedAt && ` · ${relativeTime(a.publishedAt)}`}
        </span>
        <MetaBar article={article} />
      </div>
    </Link>
  )
}

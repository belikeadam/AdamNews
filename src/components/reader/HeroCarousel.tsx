'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { getArticleCoverUrl, relativeTime } from '@/lib/utils'
import type { Article } from '@/types'

interface HeroCarouselProps {
  articles: Article[]
  interval?: number
}

export default function HeroCarousel({ articles, interval = 5000 }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const slideCount = articles.length

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slideCount)
  }, [slideCount])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount)
  }, [slideCount])

  useEffect(() => {
    if (isPaused || slideCount <= 1) return
    timerRef.current = setInterval(nextSlide, interval)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, nextSlide, interval, slideCount])

  if (!articles.length) return null

  return (
    <div
      className="relative overflow-hidden bg-[var(--surface-2)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured stories"
    >
      {/* Slides */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1]">
        {articles.map((article, index) => {
          const { attributes: a } = article
          const imgUrl = getArticleCoverUrl(
            a.cover?.data?.attributes?.formats?.large?.url || a.cover?.data?.attributes?.url,
            a.slug,
            1200,
            800,
            a.coverUrl
          )

          return (
            <div
              key={article.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              aria-hidden={index !== currentIndex}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={a.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/5" />
            </div>
          )
        })}

        {/* Content overlay */}
        {(() => {
          const { attributes: a } = articles[currentIndex]
          return (
            <Link href={`/articles/${a.slug}`} className="absolute inset-0 z-20 flex items-end">
              <div className="p-6 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="section-label text-white/80">
                    {a.category?.data?.attributes?.name || 'News'}
                  </span>
                  {a.trending && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                      Trending
                    </span>
                  )}
                  {a.premium && (
                    <span className="px-2 py-0.5 bg-amber-500/80 text-white text-[0.6rem] font-bold uppercase tracking-wider rounded-sm">Premium</span>
                  )}
                </div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white leading-tight line-clamp-2 max-w-3xl mb-3"
                  style={{ fontFamily: 'var(--font-headline)' }}
                >
                  {a.title}
                </h2>
                {a.excerpt && (
                  <p className="text-white/75 text-sm sm:text-base lg:text-lg line-clamp-2 max-w-2xl mb-3">
                    {a.excerpt}
                  </p>
                )}
                {/* Rich byline with metrics */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                  {a.author?.data?.attributes?.name && (
                    <span className="font-medium text-white/70">By {a.author.data.attributes.name}</span>
                  )}
                  {a.publishedAt && <span>{relativeTime(a.publishedAt)}</span>}
                  {a.readTime && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {a.readTime}
                    </span>
                  )}
                  {a.views > 0 && (
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {a.views >= 1000 ? `${(a.views / 1000).toFixed(1)}k` : a.views} views
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })()}
      </div>

      {/* Arrows */}
      {slideCount > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
            aria-label="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full transition-colors"
            aria-label="Next"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* Dots */}
      {slideCount > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/70 w-2'
              }`}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

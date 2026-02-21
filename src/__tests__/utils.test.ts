import { describe, it, expect } from 'vitest'
import {
  cn,
  formatDate,
  readTime,
  truncate,
  relativeTime,
  slugify,
  getStrapiMediaUrl,
  getArticleCoverUrl,
} from '@/lib/utils'

describe('cn (class name merger)', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'active')).toBe('base active')
  })

  it('resolves Tailwind conflicts', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6')
  })
})

describe('formatDate', () => {
  it('formats ISO date to readable string', () => {
    const result = formatDate('2026-01-15T12:00:00.000Z')
    expect(result).toBe('Jan 15, 2026')
  })

  it('handles different months', () => {
    const result = formatDate('2025-12-25T00:00:00.000Z')
    expect(result).toBe('Dec 25, 2025')
  })
})

describe('readTime', () => {
  it('returns 1 min for short text', () => {
    expect(readTime('Hello world')).toBe('1 min read')
  })

  it('calculates based on 200 wpm', () => {
    const text = Array(400).fill('word').join(' ')
    expect(readTime(text)).toBe('2 min read')
  })

  it('rounds up partial minutes', () => {
    const text = Array(250).fill('word').join(' ')
    expect(readTime(text)).toBe('2 min read')
  })
})

describe('truncate', () => {
  it('returns string as-is if under limit', () => {
    expect(truncate('short', 10)).toBe('short')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncate('This is a long string', 10)).toBe('This is a...')
  })

  it('handles exact length', () => {
    expect(truncate('exact', 5)).toBe('exact')
  })
})

describe('relativeTime', () => {
  it('returns "Just now" for recent timestamps', () => {
    const now = new Date().toISOString()
    expect(relativeTime(now)).toBe('Just now')
  })

  it('returns hours for same-day timestamps', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
    expect(relativeTime(threeHoursAgo)).toBe('3h ago')
  })

  it('returns "Yesterday" for one-day-old timestamps', () => {
    const yesterday = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
    expect(relativeTime(yesterday)).toBe('Yesterday')
  })

  it('returns day count for recent dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    expect(relativeTime(threeDaysAgo)).toBe('3 days ago')
  })

  it('falls back to formatted date for old timestamps', () => {
    const result = relativeTime('2024-01-01T00:00:00.000Z')
    expect(result).toMatch(/Jan 1, 2024/)
  })
})

describe('slugify', () => {
  it('converts to lowercase kebab-case', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('strips special characters', () => {
    expect(slugify('Hello, World! #1')).toBe('hello-world-1')
  })

  it('collapses multiple dashes', () => {
    expect(slugify('foo   bar   baz')).toBe('foo-bar-baz')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('getStrapiMediaUrl', () => {
  it('returns placeholder for null', () => {
    expect(getStrapiMediaUrl(null)).toBe('/placeholder.svg')
  })

  it('returns absolute URLs as-is', () => {
    expect(getStrapiMediaUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg')
  })

  it('prepends Strapi URL for relative paths', () => {
    const result = getStrapiMediaUrl('/uploads/photo.jpg')
    expect(result).toContain('/uploads/photo.jpg')
  })
})

describe('getArticleCoverUrl', () => {
  it('prefers external coverUrl', () => {
    const result = getArticleCoverUrl(null, 'test', 800, 600, 'https://cdn.example.com/img.jpg')
    expect(result).toBe('https://cdn.example.com/img.jpg')
  })

  it('falls back to Strapi media', () => {
    const result = getArticleCoverUrl('/uploads/cover.jpg', 'test', 800, 600, null)
    expect(result).toContain('/uploads/cover.jpg')
  })

  it('falls back to Picsum for no images', () => {
    const result = getArticleCoverUrl(null, 'my-article', 800, 600, null)
    expect(result).toContain('picsum.photos/seed/my-article/800/600')
  })
})

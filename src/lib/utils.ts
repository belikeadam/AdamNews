import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function readTime(text: string): string {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return `${minutes} min read`
}

export function getStrapiMediaUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg'
  if (url.startsWith('http')) return url
  return `${process.env.NEXT_PUBLIC_STRAPI_URL}${url}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '...'
}

export function relativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(dateString)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

/**
 * Get a cover image URL for an article.
 * Priority: coverUrl (external URL) → Strapi media → Picsum fallback.
 */
export function getArticleCoverUrl(
  strapiCoverUrl: string | null | undefined,
  slug: string,
  width = 1200,
  height = 800,
  coverUrl?: string | null
): string {
  // 1. External cover URL (e.g. from Dev.to API)
  if (coverUrl && coverUrl.startsWith('http')) return coverUrl
  // 2. Strapi uploaded media
  if (strapiCoverUrl) {
    const url = getStrapiMediaUrl(strapiCoverUrl)
    if (url && url !== '/placeholder.svg') return url
  }
  // 3. Deterministic fallback — no upload/storage needed
  return `https://picsum.photos/seed/${encodeURIComponent(slug)}/${width}/${height}`
}

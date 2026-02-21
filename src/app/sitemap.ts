import type { MetadataRoute } from 'next'
import { getArticles } from '@/lib/api/strapi'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://adam-news.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/plans`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  let articlePages: MetadataRoute.Sitemap = []
  try {
    const res = await getArticles({ pageSize: 100 })
    articlePages = res.data.map((article) => ({
      url: `${SITE_URL}/articles/${article.attributes.slug}`,
      lastModified: new Date(article.attributes.updatedAt || article.attributes.publishedAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // Strapi unavailable — return static pages only
  }

  return [...staticPages, ...articlePages]
}

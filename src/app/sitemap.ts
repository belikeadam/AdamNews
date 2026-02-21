import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://adam-news.vercel.app'
const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'daily', priority: 0.7 },
    { url: `${SITE_URL}/plans`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Dynamic article pages from Strapi
  let articlePages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/articles?fields[0]=slug&fields[1]=updatedAt&pagination[pageSize]=100&sort=publishedAt:desc`,
      { next: { revalidate: 3600 } }
    )
    if (res.ok) {
      const { data } = await res.json()
      articlePages = data.map((article: { attributes: { slug: string; updatedAt: string } }) => ({
        url: `${SITE_URL}/articles/${article.attributes.slug}`,
        lastModified: new Date(article.attributes.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Strapi unavailable — return static pages only
  }

  return [...staticPages, ...articlePages]
}

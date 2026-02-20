/**
 * AdamNews Seed Script
 *
 * Seeds the Strapi database with:
 * - 4 categories
 * - 3 authors
 * - 12 articles (fetched from DEV.to public API)
 *
 * Run: npx ts-node cms/scripts/seed.ts
 * Or: called on first `docker compose up`
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ''

const headers: HeadersInit = {
  'Content-Type': 'application/json',
  ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
}

async function strapiPost(path: string, data: Record<string, unknown>) {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ data }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Strapi POST ${path} failed: ${res.status} — ${text}`)
  }

  return res.json()
}

// Categories
const CATEGORIES = [
  { name: 'Technology', slug: 'technology', color: '#2563eb', description: 'Latest in tech, web development, and programming' },
  { name: 'Business', slug: 'business', color: '#16a34a', description: 'Business strategy, startups, and entrepreneurship' },
  { name: 'Finance', slug: 'finance', color: '#d97706', description: 'Personal finance, investing, and markets' },
  { name: 'Lifestyle', slug: 'lifestyle', color: '#dc2626', description: 'Productivity, wellness, and modern living' },
]

// Authors
const AUTHORS = [
  { name: 'Sarah Chen', role: 'Senior Tech Writer', bio: 'Full-stack developer turned tech writer. Covers web technologies, Next.js, and modern JavaScript.', email: 'sarah@AdamNews.com' },
  { name: 'Marcus Johnson', role: 'Business Editor', bio: 'Former startup founder. Now writes about business strategy, SaaS, and the creator economy.', email: 'marcus@AdamNews.com' },
  { name: 'Priya Sharma', role: 'Finance Columnist', bio: 'CFA and personal finance enthusiast. Makes complex financial concepts accessible.', email: 'priya@AdamNews.com' },
]

async function fetchDevToArticles(tag: string, perPage: number) {
  const res = await fetch(
    `https://dev.to/api/articles?tag=${tag}&per_page=${perPage}`
  )

  if (!res.ok) {
    console.warn(`DEV.to fetch failed for tag=${tag}: ${res.status}`)
    return []
  }

  return res.json()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

async function seed() {
  console.log('Starting AdamNews seed...\n')

  // 1. Create categories
  console.log('Creating categories...')
  const categoryIds: number[] = []
  for (const cat of CATEGORIES) {
    try {
      const res = await strapiPost('/api/categories', cat)
      categoryIds.push(res.data.id)
      console.log(`  + ${cat.name} (id: ${res.data.id})`)
    } catch (e) {
      console.warn(`  ! Skipping ${cat.name}: ${(e as Error).message}`)
    }
  }

  // 2. Create authors
  console.log('\nCreating authors...')
  const authorIds: number[] = []
  for (const author of AUTHORS) {
    try {
      const res = await strapiPost('/api/authors', author)
      authorIds.push(res.data.id)
      console.log(`  + ${author.name} (id: ${res.data.id})`)
    } catch (e) {
      console.warn(`  ! Skipping ${author.name}: ${(e as Error).message}`)
    }
  }

  // 3. Fetch articles from DEV.to
  console.log('\nFetching articles from DEV.to...')
  const jsArticles = await fetchDevToArticles('javascript', 8)
  const webArticles = await fetchDevToArticles('webdev', 4)
  const allDevTo = [...jsArticles, ...webArticles].slice(0, 12)

  console.log(`  Fetched ${allDevTo.length} articles`)

  // 4. Create articles in Strapi
  console.log('\nCreating articles...')
  for (let i = 0; i < allDevTo.length; i++) {
    const devArticle = allDevTo[i]
    const isPremium = [0, 2, 4].includes(i)
    const isTrending = [0, 1].includes(i)
    const categoryId = categoryIds[i % categoryIds.length] || categoryIds[0]
    const authorId = authorIds[i % authorIds.length] || authorIds[0]

    const articleData: Record<string, unknown> = {
      title: devArticle.title,
      slug: slugify(devArticle.title),
      excerpt: devArticle.description || '',
      body: devArticle.body_html || `<p>${devArticle.description || 'Article content here.'}</p>`,
      premium: isPremium,
      trending: isTrending,
      readTime: `${devArticle.reading_time_minutes || 5} min read`,
      views: Math.floor(Math.random() * 3000),
      tags: devArticle.tag_list || [],
      category: categoryId,
      author: authorId,
      publishedAt: new Date().toISOString(),
    }

    try {
      const res = await strapiPost('/api/articles', articleData)
      const flags = [
        isPremium && 'premium',
        isTrending && 'trending',
      ].filter(Boolean).join(', ')
      console.log(
        `  + [${i + 1}/${allDevTo.length}] ${devArticle.title.slice(0, 50)}... ${flags ? `(${flags})` : ''}`
      )
    } catch (e) {
      console.warn(`  ! Failed: ${(e as Error).message}`)
    }
  }

  console.log(
    `\n\u2705 Seeded ${allDevTo.length} articles, ${CATEGORIES.length} categories, ${AUTHORS.length} authors`
  )
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})

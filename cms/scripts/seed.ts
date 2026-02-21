/**
 * AdamNews Seed Script
 *
 * Fetches REAL articles from Dev.to API (free, no auth required)
 * and seeds them into Strapi with proper categories, authors, and cover images.
 *
 * Run: npx ts-node cms/scripts/seed.ts
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
    throw new Error(`POST ${path} failed: ${res.status} — ${text}`)
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
    .slice(0, 80)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ── Dev.to API helpers ──────────────────────────────────────────────

interface DevToArticle {
  id: number
  title: string
  description: string
  body_markdown?: string
  cover_image: string | null
  social_image: string | null
  tag_list: string[]
  tags: string
  user: { name: string; username: string }
  published_at: string
  reading_time_minutes: number
  url: string
  positive_reactions_count: number
}

const TAG_TO_CATEGORY: Record<string, string> = {
  webdev: 'Technology',
  javascript: 'Technology',
  programming: 'Technology',
  react: 'Technology',
  node: 'Technology',
  typescript: 'Technology',
  python: 'Technology',
  devops: 'Technology',
  aws: 'Technology',
  ai: 'Technology',
  machinelearning: 'Technology',
  career: 'Business',
  startup: 'Business',
  productivity: 'Business',
  management: 'Business',
  science: 'Science',
  datascience: 'Science',
  health: 'Science',
  news: 'General',
  discuss: 'General',
  tutorial: 'Technology',
  beginners: 'Technology',
}

function categorizeArticle(tags: string[]): string {
  for (const tag of tags) {
    const cat = TAG_TO_CATEGORY[tag.toLowerCase()]
    if (cat) return cat
  }
  return 'Technology'
}

async function fetchDevToArticles(tag: string, count: number): Promise<DevToArticle[]> {
  const url = `https://dev.to/api/articles?per_page=${count}&tag=${tag}&top=30`
  console.log(`  Fetching dev.to tag=${tag}...`)
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`  ! Dev.to API returned ${res.status} for tag=${tag}`)
    return []
  }
  return res.json()
}

async function fetchDevToArticleBody(id: number): Promise<string> {
  await delay(350) // respect rate limit (~3 req/s)
  const res = await fetch(`https://dev.to/api/articles/${id}`)
  if (!res.ok) return ''
  const article: DevToArticle = await res.json()
  return article.body_markdown || ''
}

// ── Main seed logic ─────────────────────────────────────────────────

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', color: '#2563eb', description: 'Software, hardware, and innovation' },
  { name: 'Business', slug: 'business', color: '#059669', description: 'Startups, careers, and the tech economy' },
  { name: 'Science', slug: 'science', color: '#7c3aed', description: 'Data science, AI research, and discovery' },
  { name: 'General', slug: 'general', color: '#8b0000', description: 'Community discussions and news' },
]

const AUTHOR_ROLES = [
  'Senior Technology Reporter',
  'Business Editor',
  'Staff Writer',
  'Contributing Analyst',
  'Tech Correspondent',
  'Features Writer',
  'Senior Correspondent',
]

async function seed() {
  console.log('Starting The Adam News seed (Dev.to API)...\n')

  // 1. Fetch articles from Dev.to across multiple tags
  console.log('Fetching articles from Dev.to API...')
  const tagQueries = [
    { tag: 'webdev', count: 15 },
    { tag: 'ai', count: 12 },
    { tag: 'career', count: 10 },
    { tag: 'programming', count: 12 },
    { tag: 'productivity', count: 8 },
    { tag: 'datascience', count: 8 },
    { tag: 'discuss', count: 8 },
    { tag: 'news', count: 6 },
  ]

  const allArticles: DevToArticle[] = []
  const seenIds = new Set<number>()

  for (const { tag, count } of tagQueries) {
    const articles = await fetchDevToArticles(tag, count)
    for (const a of articles) {
      if (!seenIds.has(a.id)) {
        seenIds.add(a.id)
        allArticles.push(a)
      }
    }
    await delay(500)
  }

  console.log(`\nFetched ${allArticles.length} unique articles\n`)

  if (allArticles.length === 0) {
    console.error('No articles fetched. Check network / Dev.to API availability.')
    process.exit(1)
  }

  // 2. Fetch full body for each article
  console.log('Fetching full article bodies...')
  for (let i = 0; i < allArticles.length; i++) {
    const body = await fetchDevToArticleBody(allArticles[i].id)
    allArticles[i].body_markdown = body
    process.stdout.write(`  ${i + 1}/${allArticles.length}\r`)
  }
  console.log(`  Done — ${allArticles.length} bodies fetched\n`)

  // 3. Extract unique authors
  const authorMap = new Map<string, { name: string; username: string }>()
  for (const a of allArticles) {
    if (!authorMap.has(a.user.username)) {
      authorMap.set(a.user.username, a.user)
    }
  }
  const uniqueAuthors = Array.from(authorMap.values())

  // 4. Create categories in Strapi
  console.log('Creating categories...')
  const categoryIds: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    try {
      const res = await strapiPost('/api/categories', cat)
      categoryIds[cat.name] = res.data.id
      console.log(`  + ${cat.name} (id: ${res.data.id})`)
    } catch (e) {
      console.warn(`  ! Skipping ${cat.name}: ${(e as Error).message}`)
    }
  }

  // 5. Create authors in Strapi
  console.log('\nCreating authors...')
  const authorIds: Record<string, number> = {}
  for (let ai = 0; ai < uniqueAuthors.length; ai++) {
    const author = uniqueAuthors[ai]
    try {
      const role = AUTHOR_ROLES[ai % AUTHOR_ROLES.length]
      const res = await strapiPost('/api/authors', {
        name: author.name || author.username,
        role,
        bio: `${role} covering technology, business, and innovation. Previously at Dev.to.`,
        email: `${author.username}@devto.community`,
      })
      authorIds[author.username] = res.data.id
      console.log(`  + ${author.name || author.username} (id: ${res.data.id})`)
    } catch (e) {
      console.warn(`  ! Skipping ${author.name}: ${(e as Error).message}`)
    }
  }

  // 6. Create articles in Strapi
  console.log('\nCreating articles...')
  let created = 0

  for (let i = 0; i < allArticles.length; i++) {
    const a = allArticles[i]
    const category = categorizeArticle(a.tag_list)
    const isPremium = i % 5 === 0
    const isTrending = i < 5

    // Clean up body — remove Dev.to liquid tags
    let body = a.body_markdown || a.description || ''
    body = body.replace(/\{%[^%]*%\}/g, '')

    const articleData: Record<string, unknown> = {
      title: a.title,
      slug: slugify(a.title),
      excerpt: a.description || a.title,
      body,
      premium: isPremium,
      trending: isTrending,
      readTime: `${a.reading_time_minutes || 3} min read`,
      views: Math.floor(a.positive_reactions_count * 50 + Math.random() * 2000 + (isTrending ? 5000 : 0) + (isPremium ? 1000 : 0)),
      tags: a.tag_list,
      coverUrl: a.cover_image || a.social_image || null,
      category: categoryIds[category] || categoryIds['Technology'],
      author: authorIds[a.user.username] || Object.values(authorIds)[0],
      publishedAt: a.published_at || new Date().toISOString(),
    }

    try {
      await strapiPost('/api/articles', articleData)
      const flags = [isPremium && 'premium', isTrending && 'trending'].filter(Boolean).join(', ')
      console.log(`  + [${i + 1}/${allArticles.length}] ${a.title.slice(0, 60)}${flags ? ` (${flags})` : ''}`)
      created++
    } catch (e) {
      console.warn(`  ! Failed: ${a.title.slice(0, 40)} — ${(e as Error).message}`)
    }
  }

  console.log(
    `\nDone: ${created} articles, ${CATEGORIES.length} categories, ${uniqueAuthors.length} authors (from Dev.to API)`
  )
}

seed().catch((e) => {
  console.error('Seed failed:', e)
  process.exit(1)
})

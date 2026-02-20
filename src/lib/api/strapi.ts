import type {
  ArticlesResponse,
  CategoriesResponse,
  AuthorsResponse,
  ArticleAttributes,
  StrapiCollectionResponse,
} from '@/types'

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL!
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`
  }
  return headers
}

async function fetchStrapi<T>(
  path: string,
  options?: { revalidate?: number; tags?: string[] }
): Promise<T> {
  const url = `${STRAPI_URL}${path}`
  const res = await fetch(url, {
    headers: getHeaders(),
    next: {
      revalidate: options?.revalidate ?? 60,
      tags: options?.tags,
    },
  })

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`)
  }

  return res.json()
}

export async function getArticles(params?: {
  page?: number
  pageSize?: number
  category?: string
  premium?: boolean
}): Promise<ArticlesResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('populate', '*')
  searchParams.set('sort', 'publishedAt:desc')
  searchParams.set('pagination[page]', String(params?.page ?? 1))
  searchParams.set('pagination[pageSize]', String(params?.pageSize ?? 12))

  if (params?.category) {
    searchParams.set('filters[category][slug][$eq]', params.category)
  }
  if (params?.premium !== undefined) {
    searchParams.set('filters[premium][$eq]', String(params.premium))
  }

  return fetchStrapi<ArticlesResponse>(
    `/api/articles?${searchParams.toString()}`,
    { tags: ['articles'] }
  )
}

export async function getArticleBySlug(
  slug: string
): Promise<StrapiCollectionResponse<ArticleAttributes>> {
  return fetchStrapi<StrapiCollectionResponse<ArticleAttributes>>(
    `/api/articles?filters[slug][$eq]=${slug}&populate=*`,
    { tags: [`article-${slug}`] }
  )
}

export async function getTrendingArticles(): Promise<ArticlesResponse> {
  return fetchStrapi<ArticlesResponse>(
    '/api/articles?filters[trending][$eq]=true&populate=*&pagination[pageSize]=5',
    { tags: ['articles', 'trending'] }
  )
}

export async function getCategories(): Promise<CategoriesResponse> {
  return fetchStrapi<CategoriesResponse>('/api/categories?sort=name:asc', {
    revalidate: 3600,
    tags: ['categories'],
  })
}

export async function getAuthors(): Promise<AuthorsResponse> {
  return fetchStrapi<AuthorsResponse>('/api/authors?populate=*', {
    revalidate: 3600,
    tags: ['authors'],
  })
}

export async function getRelatedArticles(
  categorySlug: string,
  excludeSlug: string
): Promise<ArticlesResponse> {
  return fetchStrapi<ArticlesResponse>(
    `/api/articles?filters[category][slug][$eq]=${categorySlug}&filters[slug][$ne]=${excludeSlug}&populate=*&pagination[pageSize]=3`,
    { tags: ['articles'] }
  )
}

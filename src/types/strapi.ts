// Strapi v4 response wrapper types

export interface StrapiPagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export interface StrapiEntry<T> {
  id: number
  attributes: T
}

export interface StrapiSingleResponse<T> {
  data: StrapiEntry<T>
  meta: Record<string, unknown>
}

export interface StrapiCollectionResponse<T> {
  data: StrapiEntry<T>[]
  meta: { pagination: StrapiPagination }
}

export interface StrapiErrorResponse {
  data: null
  error: {
    status: number
    name: string
    message: string
    details: Record<string, unknown>
  }
}

// Media types
export interface StrapiImageFormat {
  name: string
  hash: string
  ext: string
  mime: string
  width: number
  height: number
  size: number
  url: string
}

export interface StrapiMediaAttributes {
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  createdAt: string
  updatedAt: string
  formats: {
    thumbnail?: StrapiImageFormat
    small?: StrapiImageFormat
    medium?: StrapiImageFormat
    large?: StrapiImageFormat
  } | null
}

export interface StrapiMediaField {
  data: StrapiEntry<StrapiMediaAttributes> | null
}

// Content type attributes
export interface ArticleAttributes {
  title: string
  slug: string
  excerpt: string | null
  body: unknown // Rich text blocks
  cover: StrapiMediaField
  category: { data: StrapiEntry<CategoryAttributes> | null }
  author: { data: StrapiEntry<AuthorAttributes> | null }
  tags: string[] | null
  premium: boolean
  trending: boolean
  views: number
  readTime: string | null
  coverUrl: string | null
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CategoryAttributes {
  name: string
  slug: string
  color: string | null
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthorAttributes {
  name: string
  role: string | null
  avatar: StrapiMediaField
  bio: string | null
  email: string | null
  createdAt: string
  updatedAt: string
}

// Convenience aliases
export type Article = StrapiEntry<ArticleAttributes>
export type Category = StrapiEntry<CategoryAttributes>
export type Author = StrapiEntry<AuthorAttributes>

export type ArticlesResponse = StrapiCollectionResponse<ArticleAttributes>
export type ArticleResponse = StrapiSingleResponse<ArticleAttributes>
export type CategoriesResponse = StrapiCollectionResponse<CategoryAttributes>
export type AuthorsResponse = StrapiCollectionResponse<AuthorAttributes>

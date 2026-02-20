export const STRAPI_BASE = process.env.NEXT_PUBLIC_STRAPI_URL!

export const API = {
  // Strapi REST
  articles: `${STRAPI_BASE}/api/articles`,
  article: (slug: string) =>
    `${STRAPI_BASE}/api/articles?filters[slug][$eq]=${slug}&populate=*`,
  articleById: (id: number) =>
    `${STRAPI_BASE}/api/articles/${id}?populate=*`,
  categories: `${STRAPI_BASE}/api/categories`,
  authors: `${STRAPI_BASE}/api/authors?populate=*`,

  // Strapi GraphQL
  graphql: `${STRAPI_BASE}/graphql`,

  // Next.js internal API routes
  checkout: '/api/stripe/checkout',
  webhook: '/api/stripe/webhook',
  revalidate: '/api/revalidate',
  nextauth: '/api/auth',
} as const

// Server-side Strapi URL (Docker internal network)
export const STRAPI_INTERNAL = process.env.STRAPI_URL || STRAPI_BASE

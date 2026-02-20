const GRAPHQL_URL = `${
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL
}/graphql`
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

interface GraphQLResponse<T> {
  data: T
  errors?: { message: string }[]
}

export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`
  }

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 },
  })

  const json: GraphQLResponse<T> = await res.json()

  if (json.errors) {
    throw new Error(json.errors.map((e) => e.message).join(', '))
  }

  return json.data
}

// Common queries
export const ARTICLES_QUERY = `
  query GetArticles($page: Int, $pageSize: Int) {
    articles(
      pagination: { page: $page, pageSize: $pageSize }
      sort: "publishedAt:desc"
      publicationState: LIVE
    ) {
      data {
        id
        attributes {
          title
          slug
          excerpt
          premium
          trending
          readTime
          publishedAt
          cover {
            data {
              attributes { url formats }
            }
          }
          category {
            data {
              attributes { name slug color }
            }
          }
          author {
            data {
              attributes { name role }
            }
          }
        }
      }
      meta {
        pagination { total page pageSize pageCount }
      }
    }
  }
`

export const ARTICLE_BY_SLUG_QUERY = `
  query GetArticle($slug: String!) {
    articles(filters: { slug: { eq: $slug } }, publicationState: LIVE) {
      data {
        id
        attributes {
          title
          slug
          excerpt
          body
          premium
          trending
          readTime
          views
          tags
          publishedAt
          cover {
            data {
              attributes { url formats alternativeText }
            }
          }
          category {
            data {
              attributes { name slug color }
            }
          }
          author {
            data {
              attributes { name role bio email avatar { data { attributes { url } } } }
            }
          }
        }
      }
    }
  }
`

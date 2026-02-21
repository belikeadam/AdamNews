import { NextResponse } from 'next/server'

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL!
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    // Find article by slug
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`

    const findRes = await fetch(
      `${STRAPI_URL}/api/articles?filters[slug][$eq]=${slug}&fields[0]=views`,
      { headers, cache: 'no-store' }
    )

    if (!findRes.ok) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const findData = await findRes.json()
    const article = findData.data?.[0]
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Increment views
    const currentViews = article.attributes?.views || 0
    const updateRes = await fetch(`${STRAPI_URL}/api/articles/${article.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ data: { views: currentViews + 1 } }),
    })

    if (!updateRes.ok) {
      console.error(`Failed to update views for ${slug}: ${updateRes.status}`)
      return NextResponse.json({ views: currentViews })
    }

    return NextResponse.json({ views: currentViews + 1 })
  } catch (error) {
    console.error('View tracking error:', error)
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
  }
}

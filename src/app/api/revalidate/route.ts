import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

const WEBHOOK_SECRET =
  process.env.STRAPI_WEBHOOK_SECRET || process.env.STRAPI_API_TOKEN

export async function POST(request: Request) {
  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Support both direct calls { slug, tag } and Strapi webhook format { event, model, entry }
    let slug: string | null = null
    let tag: string | null = null

    if (body.slug) {
      // Direct call format (from dashboard editor)
      slug = body.slug
      tag = body.tag || null
    } else if (body.entry?.slug) {
      // Strapi lifecycle webhook format
      // event: "entry.create" | "entry.update" | "entry.delete" | "entry.publish" | "entry.unpublish"
      slug = body.entry.slug
    } else if (body.model === 'category' || body.model === 'author') {
      // Category or author changes — revalidate everything
      tag = body.model === 'category' ? 'categories' : 'authors'
    }

    if (slug) {
      revalidatePath(`/articles/${slug}`, 'page')
      revalidateTag(`article-${slug}`, 'default')
    }

    if (tag) {
      revalidateTag(tag, 'default')
    }

    // Always revalidate the home page and articles list
    revalidatePath('/', 'page')
    revalidateTag('articles', 'default')

    console.log(
      `[Revalidate] slug=${slug || '-'}, tag=${tag || '-'}, event=${body.event || 'manual'}`
    )

    return NextResponse.json({
      revalidated: true,
      slug: slug || null,
      tag: tag || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    )
  }
}

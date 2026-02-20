import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret')
  if (secret !== process.env.STRAPI_API_TOKEN) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { slug, tag } = body

    if (slug) {
      // Revalidate specific article page
      revalidatePath(`/articles/${slug}`, 'page')
      // Next.js 16: revalidateTag requires (tag, profile)
      revalidateTag(`article-${slug}`, 'default')
    }

    if (tag) {
      revalidateTag(tag, 'default')
    }

    // Always revalidate the home page
    revalidatePath('/', 'page')
    revalidateTag('articles', 'default')

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

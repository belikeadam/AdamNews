import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/cache
const mockRevalidatePath = vi.fn()
const mockRevalidateTag = vi.fn()

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}))

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      json: async () => body,
      status: init?.status || 200,
    }),
  },
}))

function makeRequest(body: object, secret = 'test-secret'): Request {
  return new Request('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-webhook-secret': secret,
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/revalidate', () => {
  let POST: (req: Request) => Promise<{ json: () => Promise<Record<string, unknown>>; status: number }>

  beforeEach(async () => {
    vi.clearAllMocks()
    // Reset module cache so WEBHOOK_SECRET re-reads env
    vi.resetModules()
    process.env.STRAPI_WEBHOOK_SECRET = 'test-secret'
    const mod = await import('@/app/api/revalidate/route')
    POST = mod.POST as typeof POST
  })

  it('rejects invalid webhook secret', async () => {
    const req = makeRequest({ slug: 'test' }, 'wrong-secret')
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('revalidates article by slug (direct call)', async () => {
    const req = makeRequest({ slug: 'my-article' })
    const res = await POST(req)
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.revalidated).toBe(true)
    expect(body.slug).toBe('my-article')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/articles/my-article', 'page')
    expect(mockRevalidateTag).toHaveBeenCalledWith('article-my-article', 'default')
  })

  it('handles Strapi webhook format (entry.update)', async () => {
    const req = makeRequest({
      event: 'entry.update',
      model: 'article',
      entry: { slug: 'updated-article' },
    })
    const res = await POST(req)
    const body = await res.json()

    expect(body.slug).toBe('updated-article')
    expect(mockRevalidatePath).toHaveBeenCalledWith('/articles/updated-article', 'page')
  })

  it('revalidates category tag on category change', async () => {
    const req = makeRequest({
      event: 'entry.update',
      model: 'category',
    })
    const res = await POST(req)
    const body = await res.json()

    expect(body.tag).toBe('categories')
    expect(mockRevalidateTag).toHaveBeenCalledWith('categories', 'default')
  })

  it('always revalidates home page and articles tag', async () => {
    const req = makeRequest({ slug: 'any-article' })
    await POST(req)

    expect(mockRevalidatePath).toHaveBeenCalledWith('/', 'page')
    expect(mockRevalidateTag).toHaveBeenCalledWith('articles', 'default')
  })
})

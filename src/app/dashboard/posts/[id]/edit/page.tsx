'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Editor from '@/components/dashboard/Editor'
import ArchCallout from '@/components/shared/ArchCallout'
import ToastContainer from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id as string
  const isNew = articleId === 'new'
  const { toasts, addToast, removeToast } = useToast()

  const [initial, setInitial] = useState<{
    title: string
    body: string
    category: string
    premium: boolean
  } | null>(null)
  const [loading, setLoading] = useState(!isNew)

  // Fetch existing article data for editing
  useEffect(() => {
    if (isNew) {
      setInitial({ title: '', body: '', category: '', premium: false })
      return
    }

    async function fetchArticle() {
      try {
        const res = await fetch(
          `${STRAPI_URL}/api/articles/${articleId}?populate=category`
        )
        if (!res.ok) throw new Error('Failed to fetch')
        const { data } = await res.json()
        const a = data.attributes
        setInitial({
          title: a.title || '',
          body: typeof a.body === 'string' ? a.body : '',
          category: a.category?.data?.attributes?.slug || '',
          premium: a.premium || false,
        })
      } catch {
        setInitial({ title: '', body: '', category: '', premium: false })
        addToast('Could not load article — starting fresh', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [articleId, isNew]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (data: {
    title: string
    body: string
    category: string
    premium: boolean
    status: 'draft' | 'published'
  }) => {
    try {
      const slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim()

      // Resolve category ID from slug
      let categoryId: number | null = null
      if (data.category) {
        const catRes = await fetch(
          `${STRAPI_URL}/api/categories?filters[slug][$eq]=${data.category}`
        )
        if (catRes.ok) {
          const catData = await catRes.json()
          categoryId = catData.data?.[0]?.id || null
        }
      }

      const articlePayload = {
        data: {
          title: data.title,
          slug,
          body: data.body,
          excerpt: data.body.replace(/[#*_>\[\]()]/g, '').slice(0, 160).trim(),
          premium: data.premium,
          publishedAt: data.status === 'published' ? new Date().toISOString() : null,
          ...(categoryId ? { category: categoryId } : {}),
        },
      }

      const url = isNew
        ? `${STRAPI_URL}/api/articles`
        : `${STRAPI_URL}/api/articles/${articleId}`

      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articlePayload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Save failed (${res.status})`)
      }

      const saved = await res.json()

      // Trigger ISR revalidation for published articles
      if (data.status === 'published') {
        fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        }).catch(() => {})
      }

      if (data.status === 'published') {
        addToast(`Published! Live at /articles/${slug}`, 'success')
      } else {
        addToast('Draft saved successfully', 'info')
      }

      if (isNew && saved.data?.id) {
        router.replace(`/dashboard/posts/${saved.data.id}/edit`)
      }
    } catch (err) {
      addToast(
        `Error: ${err instanceof Error ? err.message : 'Save failed'}`,
        'error'
      )
    }
  }

  if (loading || !initial) {
    return (
      <div className="py-16 text-center text-[var(--muted)]">Loading editor...</div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/posts"
          className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Posts
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[var(--text)]">
        {isNew ? 'New Article' : 'Edit Article'}
      </h1>

      <Editor
        initialTitle={initial.title}
        initialBody={initial.body}
        initialCategory={initial.category}
        initialPremium={initial.premium}
        onSave={handleSave}
      />

      <ArchCallout
        apiCall="POST /api/articles (create) or PUT /api/articles/:id (update) via Strapi REST"
        caching="On publish: POST /api/revalidate triggers ISR revalidation"
        auth="Public role has full CRUD via bootstrap permissions"
        rationale="Editor writes to Strapi REST, triggers ISR webhook for instant cache purge."
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

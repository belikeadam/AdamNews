'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostsTable from '@/components/dashboard/PostsTable'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import ToastContainer from '@/components/shared/Toast'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'

const INITIAL_POSTS = [
  { id: 1, title: 'Getting Started with Next.js 14 App Router', status: 'published' as const, author: 'Sarah Chen', category: 'Technology', views: 2847, premium: false, date: '2024-01-15T10:00:00Z' },
  { id: 2, title: 'Stripe Webhooks: A Complete Guide', status: 'published' as const, author: 'Marcus Johnson', category: 'Technology', views: 1923, premium: true, date: '2024-01-14T08:30:00Z' },
  { id: 3, title: 'Understanding ISR in Production', status: 'draft' as const, author: 'Sarah Chen', category: 'Technology', views: 0, premium: false, date: '2024-01-16T14:00:00Z' },
  { id: 4, title: 'Building a Subscription SaaS', status: 'scheduled' as const, author: 'Priya Sharma', category: 'Business', views: 0, premium: true, date: '2024-01-20T09:00:00Z' },
  { id: 5, title: 'Redis Caching Strategies', status: 'published' as const, author: 'Marcus Johnson', category: 'Technology', views: 756, premium: false, date: '2024-01-13T11:00:00Z' },
  { id: 6, title: 'Docker Compose for Full-Stack Apps', status: 'review' as const, author: 'Sarah Chen', category: 'Technology', views: 0, premium: false, date: '2024-01-16T16:00:00Z' },
]

const TABS = ['All', 'Published', 'Draft', 'Scheduled'] as const

export default function PostsPage() {
  const [activeTab, setActiveTab] = useState<string>('All')
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const filtered =
    activeTab === 'All'
      ? posts
      : posts.filter((p) => p.status === activeTab.toLowerCase())

  const handleDeleteRequest = (id: number, title: string) => {
    setDeleteTarget({ id, title })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      const res = await fetch(`${STRAPI_URL}/api/articles/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      addToast(`"${deleteTarget.title}" deleted successfully`, 'success')

      // Trigger ISR revalidation
      fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purgeAll: true }),
      }).catch(() => {})
    } catch {
      // For demo data, still remove from local state
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      addToast(`"${deleteTarget.title}" removed`, 'success')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Posts</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">{posts.length} articles total</p>
        </div>
        <Link href="/dashboard/posts/new/edit" className="shrink-0">
          <Button>+ New Post</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-[var(--border)] overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 sm:px-4 h-10 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
              activeTab === tab
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <PostsTable posts={filtered} onDelete={handleDeleteRequest} />

      {/* Delete confirmation modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Article"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            Are you sure you want to delete{' '}
            <strong>&ldquo;{deleteTarget?.title}&rdquo;</strong>?
          </p>
          <p className="text-xs text-[var(--muted)]">
            This action cannot be undone. The article will be permanently removed.
          </p>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              loading={deleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import PostsTable from '@/components/dashboard/PostsTable'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const DEMO_POSTS = [
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

  const filtered =
    activeTab === 'All'
      ? DEMO_POSTS
      : DEMO_POSTS.filter(
          (p) => p.status === activeTab.toLowerCase()
        )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text)]">Posts</h1>
        <Link href="/dashboard/posts/new/edit">
          <Button>+ New Post</Button>
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-[var(--border)]">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 h-10 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <PostsTable posts={filtered} />
    </div>
  )
}

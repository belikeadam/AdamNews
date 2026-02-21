'use client'

import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

interface Post {
  id: number
  title: string
  status: 'published' | 'draft' | 'scheduled' | 'review'
  author: string
  category: string
  views: number
  premium: boolean
  date: string
}

interface PostsTableProps {
  posts: Post[]
  onDelete?: (id: number, title: string) => void
}

const STATUS_VARIANT = {
  published: 'success' as const,
  draft: 'default' as const,
  scheduled: 'accent' as const,
  review: 'warning' as const,
}

export default function PostsTable({ posts, onDelete }: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-4xl mb-3">&#9997;</p>
        <p className="text-[var(--muted)] mb-4">No articles yet</p>
        <Link href="/dashboard/posts/new/edit">
          <Button>Create your first article</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full text-sm" style={{ minWidth: '480px' }}>
        <thead>
          <tr className="border-b border-[var(--border)] text-left">
            <th className="pb-3 font-medium text-[var(--muted)]">Title</th>
            <th className="pb-3 font-medium text-[var(--muted)] whitespace-nowrap">Status</th>
            <th className="pb-3 font-medium text-[var(--muted)] hidden sm:table-cell">
              Author
            </th>
            <th className="pb-3 font-medium text-[var(--muted)] hidden md:table-cell">
              Category
            </th>
            <th className="pb-3 font-medium text-[var(--muted)] hidden lg:table-cell">
              Views
            </th>
            <th className="pb-3 font-medium text-[var(--muted)] hidden lg:table-cell">
              Date
            </th>
            <th className="pb-3 font-medium text-[var(--muted)] text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="border-b border-[var(--border)] hover:bg-[var(--surface)] transition-colors"
            >
              <td className="py-3 pr-4 max-w-[200px] sm:max-w-none">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-medium text-[var(--text)] line-clamp-1 break-all">
                    {post.title}
                  </span>
                  {post.premium && <Badge variant="warning" className="shrink-0">$</Badge>}
                </div>
              </td>
              <td className="py-3 pr-4">
                <Badge variant={STATUS_VARIANT[post.status]}>
                  {post.status}
                </Badge>
              </td>
              <td className="py-3 pr-4 text-[var(--muted)] hidden sm:table-cell">
                {post.author}
              </td>
              <td className="py-3 pr-4 text-[var(--muted)] hidden md:table-cell">
                {post.category}
              </td>
              <td className="py-3 pr-4 text-[var(--muted)] hidden lg:table-cell">
                {post.views.toLocaleString()}
              </td>
              <td className="py-3 pr-4 text-[var(--muted)] hidden lg:table-cell">
                {formatDate(post.date)}
              </td>
              <td className="py-3 whitespace-nowrap">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="!text-[var(--danger)] hover:!bg-red-50 dark:hover:!bg-red-900/20"
                      onClick={() => onDelete(post.id, post.title)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

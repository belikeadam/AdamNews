'use client'

import Editor from '@/components/dashboard/Editor'
import ArchCallout from '@/components/shared/ArchCallout'

export default function EditPostPage() {
  const handleSave = async (data: {
    title: string
    body: string
    category: string
    premium: boolean
    status: 'draft' | 'published'
  }) => {
    // In production: POST/PUT to Strapi, then trigger ISR revalidation
    console.log('Saving:', data)
    alert(
      data.status === 'published'
        ? 'Article published! Live in ~5s via ISR.'
        : 'Draft saved.'
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text)]">Edit Article</h1>

      <Editor onSave={handleSave} />

      <ArchCallout
        apiCall="POST /api/articles (create) or PUT /api/articles/:id (update) via Strapi REST"
        caching="On publish: POST /api/revalidate?slug=... triggers ISR revalidation"
        auth="Admin token required for Strapi mutations"
        rationale="Tiptap editor for rich text, Strapi for persistence, ISR webhook for instant propagation."
      />
    </div>
  )
}

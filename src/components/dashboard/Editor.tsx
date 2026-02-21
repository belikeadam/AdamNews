'use client'

import { useState, useMemo } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Card, { CardContent, CardHeader } from '@/components/ui/Card'

interface EditorProps {
  initialTitle?: string
  initialBody?: string
  initialCategory?: string
  initialPremium?: boolean
  onSave?: (data: {
    title: string
    body: string
    category: string
    premium: boolean
    status: 'draft' | 'published'
  }) => void
}

export default function Editor({
  initialTitle = '',
  initialBody = '',
  initialCategory = '',
  initialPremium = false,
  onSave,
}: EditorProps) {
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [category, setCategory] = useState(initialCategory)
  const [premium, setPremium] = useState(initialPremium)
  const [saving, setSaving] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [touched, setTouched] = useState(false)

  const wordCount = useMemo(() => {
    const words = body.trim().split(/\s+/).filter(Boolean)
    return words.length
  }, [body])

  const charCount = body.length

  const missingFields = useMemo(() => {
    const missing: string[] = []
    if (!title.trim()) missing.push('Title')
    if (!body.trim()) missing.push('Body')
    if (!category) missing.push('Category')
    return missing
  }, [title, body, category])

  const canPublish = missingFields.length === 0

  const handleSave = async (status: 'draft' | 'published') => {
    setSaving(true)
    await onSave?.({ title, body, category, premium, status })
    setSaving(false)
    setShowPublishConfirm(false)
  }

  const handlePublishClick = () => {
    setTouched(true)
    if (!canPublish) return
    setShowPublishConfirm(true)
  }

  const handleDraftClick = () => {
    setTouched(true)
    if (!title.trim()) return
    handleSave('draft')
  }

  return (
    <>
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Step 1: Write */}
        <div className="space-y-4">
          <div>
            <Input
              id="title"
              placeholder="Article title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="!text-2xl !h-14 font-bold border-none !shadow-none !ring-0 px-0"
            />
            {touched && !title.trim() && (
              <p className="text-xs text-[var(--danger)] mt-1">Title is required</p>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)] font-bold">
                  B
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)] italic">
                  I
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)]">
                  H1
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)]">
                  H2
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)]">
                  &#128279;
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)]">
                  &#128444;
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)]">
                  &ldquo;&rdquo;
                </button>
                <button className="px-2 py-1 rounded hover:bg-[var(--surface-2)]">
                  &lt;/&gt;
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Start writing your article..."
                className="w-full min-h-[400px] bg-transparent text-[var(--text)] placeholder:text-[var(--muted)] resize-y focus:outline-none"
              />
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <p className="text-xs text-[var(--muted)]">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'} &middot; {charCount.toLocaleString()} chars
                </p>
                {touched && !body.trim() && (
                  <p className="text-xs text-[var(--danger)]">Body is required</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center">
            <p className="text-[var(--muted)] text-sm">
              Drop cover image here or click to upload
            </p>
          </div>
        </div>

        {/* Step 2: Configure */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-[var(--text)]">Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full h-11 px-3 rounded border bg-[var(--bg)] text-[var(--text)] ${
                    touched && !category
                      ? 'border-[var(--danger)]'
                      : 'border-[var(--border)]'
                  }`}
                >
                  <option value="">Select category</option>
                  <option value="technology">Technology</option>
                  <option value="business">Business</option>
                  <option value="science">Science</option>
                  <option value="general">General</option>
                </select>
                {touched && !category && (
                  <p className="text-xs text-[var(--danger)] mt-1">Category is required to publish</p>
                )}
              </div>

              <Input id="seo-title" label="SEO Title" placeholder="SEO title..." />
              <Input
                id="meta-desc"
                label="Meta Description"
                placeholder="Brief description..."
              />

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--text)]">
                  Premium article
                </label>
                <button
                  onClick={() => setPremium(!premium)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    premium ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${
                      premium ? 'translate-x-4' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="text-xs text-[var(--muted)] bg-[var(--surface)] rounded p-2">
                ISR revalidation: 60s &middot; Cache-Control: s-maxage=60,
                stale-while-revalidate
              </div>
            </CardContent>
          </Card>

          {/* Validation summary */}
          {touched && missingFields.length > 0 && (
            <div className="rounded-lg border border-[var(--danger)] bg-red-50 dark:bg-red-900/10 px-3 py-2">
              <p className="text-xs font-medium text-[var(--danger)]">
                Required to publish: {missingFields.join(', ')}
              </p>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handlePublishClick}
              loading={saving}
              disabled={touched && !canPublish}
            >
              Publish &rarr;
            </Button>
            <Button
              variant="outline"
              onClick={handleDraftClick}
              loading={saving}
            >
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Publish confirmation modal */}
      <Modal
        open={showPublishConfirm}
        onClose={() => !saving && setShowPublishConfirm(false)}
        title="Publish Article"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text)]">
            You&apos;re about to publish <strong>&ldquo;{title}&rdquo;</strong>.
            It will be live on the site immediately.
          </p>
          <div className="text-xs text-[var(--muted)] space-y-1 bg-[var(--surface)] rounded-lg p-3">
            <p><strong>Category:</strong> {category}</p>
            <p><strong>Words:</strong> {wordCount}</p>
            <p><strong>Premium:</strong> {premium ? 'Yes' : 'No'}</p>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPublishConfirm(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave('published')}
              loading={saving}
            >
              Confirm &amp; Publish
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

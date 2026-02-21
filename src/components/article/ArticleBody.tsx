interface ArticleBodyProps {
  body: unknown
  premium: boolean
  hasAccess: boolean
  excerpt?: string | null
}

/** Convert markdown string to HTML */
function markdownToHtml(md: string): string {
  let html = md

  // Fenced code blocks (```lang\n...\n```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trimEnd()
    return `\n<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>\n`
  })

  // Images ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')

  // Headings (### before ## before #)
  html = html.replace(/^### (.+)$/gm, '</p><h3>$1</h3><p>')
  html = html.replace(/^## (.+)$/gm, '</p><h2>$1</h2><p>')
  html = html.replace(/^# (.+)$/gm, '</p><h1>$1</h1><p>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline code (but not already inside <code>)
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // Wrap in paragraphs: split on double newlines
  html = '<p>' + html + '</p>'
  html = html.replace(/\n\n+/g, '</p><p>')
  html = html.replace(/\n/g, '<br />')

  // Clean up: don't wrap block elements in <p>
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>\s*<(h[1-6]|blockquote|hr|ul|ol|pre|img)/g, '<$1')
  html = html.replace(/<\/(h[1-6]|blockquote|ul|ol|pre)>\s*<\/p>/g, '</$1>')
  html = html.replace(/<img ([^>]+)\/>\s*<\/p>/g, '<img $1/>')
  html = html.replace(/<p><br \/>/g, '<p>')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*?<\/li>(?:<br \/>)?)+)/g, '<ul>$1</ul>')
  html = html.replace(/<br \/><\/ul>/g, '</ul>')

  return html
}

function bodyToHtml(body: unknown): string {
  if (typeof body === 'string') {
    // Already HTML (has tags and no markdown headings)
    if (/<[a-z][\s\S]*>/i.test(body) && !/^#{1,3} /m.test(body)) {
      return body
    }
    return markdownToHtml(body)
  }

  if (Array.isArray(body)) {
    // Strapi rich text blocks
    return body
      .map((block: { type?: string; level?: number; children?: { text?: string; bold?: boolean; italic?: boolean }[] }) => {
        const text = block.children?.map((c) => {
          let t = c.text || ''
          if (c.bold) t = `<strong>${t}</strong>`
          if (c.italic) t = `<em>${t}</em>`
          return t
        }).join('') || ''

        if (block.type === 'heading') {
          const level = block.level || 2
          return `<h${level}>${text}</h${level}>`
        }
        return `<p>${text}</p>`
      })
      .join('')
  }

  return '<p>Article content unavailable.</p>'
}

/** Strip HTML tags to get plain text length */
function textLength(html: string): number {
  return html.replace(/<[^>]*>/g, '').trim().length
}

export default function ArticleBody({
  body,
  premium,
  hasAccess,
  excerpt,
}: ArticleBodyProps) {
  const htmlContent = bodyToHtml(body)
  const contentLength = textLength(htmlContent)
  const isShortContent = contentLength < 300

  // For premium without access, show teaser then cut off
  let displayContent = htmlContent
  if (premium && !hasAccess) {
    if (isShortContent) {
      // Short body — show it all as teaser, paywall goes right below
      displayContent = htmlContent
    } else {
      // Longer body — truncate at 4 blocks
      const blockRegex = /<\/(p|h[1-6]|blockquote|ul|ol)>/g
      const matches = [...htmlContent.matchAll(blockRegex)]
      if (matches.length > 4) {
        const cutoff = (matches[3].index ?? 0) + matches[3][0].length
        displayContent = htmlContent.slice(0, cutoff)
      }
    }
  }

  // Check if excerpt duplicates the body content
  const bodyPlainText = htmlContent.replace(/<[^>]*>/g, '').trim()
  const excerptText = (excerpt || '').trim()
  const excerptIsDuplicate = !excerptText || bodyPlainText.startsWith(excerptText.slice(0, 40))

  return (
    <div className="relative">
      {/* Lead excerpt only if different from body */}
      {!excerptIsDuplicate && (
        <p className="text-xl leading-relaxed text-[var(--muted)] mb-6 italic border-l-4 border-[var(--accent)] pl-4">
          {excerpt}
        </p>
      )}

      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />

      {/* Fade overlay for premium gated content */}
      {premium && !hasAccess && !isShortContent && (
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
      )}
    </div>
  )
}

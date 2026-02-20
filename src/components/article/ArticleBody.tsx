interface ArticleBodyProps {
  body: unknown
  premium: boolean
  hasAccess: boolean
}

export default function ArticleBody({
  body,
  premium,
  hasAccess,
}: ArticleBodyProps) {
  // Strapi rich text blocks — render as HTML
  // In production, use @strapi/blocks-react-renderer
  const htmlContent =
    typeof body === 'string'
      ? body
      : Array.isArray(body)
        ? body
            .map((block: { type?: string; children?: { text?: string }[] }) => {
              if (block.type === 'paragraph') {
                return `<p>${block.children?.map((c) => c.text || '').join('') || ''}</p>`
              }
              if (block.type === 'heading') {
                return `<h2>${block.children?.map((c) => c.text || '').join('') || ''}</h2>`
              }
              return `<p>${block.children?.map((c) => c.text || '').join('') || ''}</p>`
            })
            .join('')
        : '<p>Article content unavailable.</p>'

  // For premium without access, truncate
  const paragraphs = htmlContent.split('</p>')
  const truncated =
    premium && !hasAccess
      ? paragraphs.slice(0, 3).join('</p>') + '</p>'
      : htmlContent

  return (
    <div className="relative">
      <div
        className="prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: truncated }}
      />

      {premium && !hasAccess && (
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--bg)] to-transparent pointer-events-none" />
      )}
    </div>
  )
}

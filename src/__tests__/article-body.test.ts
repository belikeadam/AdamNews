import { describe, it, expect } from 'vitest'

// Test the markdown conversion logic directly
// We extract and test the pure function, not the React component

function markdownToHtml(md: string): string {
  let html = md

  // Fenced code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').trimEnd()
    return `\n<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>\n`
  })

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />')

  // Headings
  html = html.replace(/^### (.+)$/gm, '</p><h3>$1</h3><p>')
  html = html.replace(/^## (.+)$/gm, '</p><h2>$1</h2><p>')
  html = html.replace(/^# (.+)$/gm, '</p><h1>$1</h1><p>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')

  // Lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // Paragraphs
  html = '<p>' + html + '</p>'
  html = html.replace(/\n\n+/g, '</p><p>')
  html = html.replace(/\n/g, '<br />')

  // Clean up
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

describe('markdownToHtml', () => {
  it('converts headings', () => {
    expect(markdownToHtml('# Title')).toContain('<h1>Title</h1>')
    expect(markdownToHtml('## Subtitle')).toContain('<h2>Subtitle</h2>')
    expect(markdownToHtml('### Section')).toContain('<h3>Section</h3>')
  })

  it('converts bold and italic', () => {
    expect(markdownToHtml('**bold**')).toContain('<strong>bold</strong>')
    expect(markdownToHtml('*italic*')).toContain('<em>italic</em>')
    expect(markdownToHtml('***both***')).toContain('<strong><em>both</em></strong>')
  })

  it('converts inline code', () => {
    expect(markdownToHtml('use `console.log`')).toContain('<code>console.log</code>')
  })

  it('converts fenced code blocks', () => {
    const md = '```js\nconst x = 1\n```'
    const result = markdownToHtml(md)
    expect(result).toContain('<pre><code class="language-js">')
    expect(result).toContain('const x = 1')
  })

  it('converts links', () => {
    const result = markdownToHtml('[Click here](https://example.com)')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('Click here</a>')
  })

  it('converts images', () => {
    const result = markdownToHtml('![alt text](https://img.com/photo.jpg)')
    expect(result).toContain('<img src="https://img.com/photo.jpg" alt="alt text"')
  })

  it('converts blockquotes', () => {
    expect(markdownToHtml('> A quote')).toContain('<blockquote><p>A quote</p></blockquote>')
  })

  it('converts unordered lists', () => {
    const result = markdownToHtml('- Item 1\n- Item 2')
    expect(result).toContain('<li>Item 1</li>')
    expect(result).toContain('<li>Item 2</li>')
  })

  it('converts horizontal rules', () => {
    expect(markdownToHtml('---')).toContain('<hr />')
  })

  it('escapes HTML in code blocks', () => {
    const md = '```html\n<div>test</div>\n```'
    const result = markdownToHtml(md)
    expect(result).toContain('&lt;div&gt;')
  })
})

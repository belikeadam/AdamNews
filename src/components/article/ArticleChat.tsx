'use client'

import { useState, useRef, useEffect } from 'react'
import type { AIChatResponse } from '@/types/ai'

interface Props {
  slug: string
  title: string
  content: string
}

interface Message {
  role: 'user' | 'ai'
  text: string
  source?: string
}

const SUGGESTED_QUESTIONS = [
  'Summarize this in one sentence',
  'What does this mean for Malaysia?',
  'Who are the key people mentioned?',
]

export default function ArticleChat({ slug, title, content }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [questionsAsked, setQuestionsAsked] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const askQuestion = async (question: string) => {
    if (!question.trim() || loading || questionsAsked >= 5) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setQuestionsAsked(prev => prev + 1)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          content: content.slice(0, 6000),
          question,
        }),
      })

      if (res.status === 429) {
        setMessages(prev => [...prev, { role: 'ai', text: 'Rate limited. Please try again in a moment.' }])
        setLoading(false)
        return
      }

      const { data } = await res.json() as { data: AIChatResponse }
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.answer,
        source: data.sourceReference,
      }])
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    askQuestion(input)
  }

  return (
    <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            AI
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-[var(--text)]">Ask About This Article</div>
            <div className="text-[0.65rem] text-[var(--muted)] tracking-wide">
              TAP TO ASK QUESTIONS · ANSWERS FROM ARTICLE ONLY
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {questionsAsked > 0 && (
            <span className="text-[0.65rem] text-[var(--muted)]">{questionsAsked}/5</span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className={`text-[var(--muted)] transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 animate-slide-up">
          {/* Suggested Questions */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => askQuestion(q)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="space-y-3 mb-3 max-h-80 overflow-y-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--text)]'
                    }`}
                  >
                    {msg.text}
                    {msg.source && (
                      <div className="mt-1.5 pt-1.5 border-t border-[var(--border)] text-[0.65rem] text-[var(--muted)] italic">
                        Source: {msg.source}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--surface-2)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--muted)]">
                    <div className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          {questionsAsked < 5 ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question about this article..."
                disabled={loading}
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 cursor-pointer"
              >
                →
              </button>
            </form>
          ) : (
            <p className="text-xs text-center text-[var(--muted)] py-2">
              You&apos;ve reached the question limit for this article. Refresh to ask more.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

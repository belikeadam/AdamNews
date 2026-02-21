'use client'

import { useState } from 'react'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setState('loading')

    // Simulate API call — in production, POST to a newsletter service (Mailchimp, Resend, etc.)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setState('success')
    setEmail('')
  }

  if (state === 'success') {
    return (
      <div className="bg-[var(--surface)] p-6 border border-[var(--border)]">
        <div className="text-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            You&apos;re subscribed!
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Check your inbox for a confirmation email.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface)] p-6 border border-[var(--border)]">
      <h3
        className="text-lg font-semibold mb-2"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        The Morning Briefing
      </h3>
      <p className="text-sm text-[var(--muted)] mb-4">
        Get the day&apos;s top stories delivered every morning.
      </p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="w-full h-10 px-3 border border-[var(--border)] bg-[var(--bg)] text-sm mb-2 focus:outline-none focus:border-[var(--text)]"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="w-full h-10 bg-[var(--text)] text-[var(--bg)] text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </form>
    </div>
  )
}

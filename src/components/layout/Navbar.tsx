'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { NAV_ITEMS } from '@/constants/nav'
import { SITE_NAME_UPPER } from '@/constants/meta'
import { signOut } from 'next-auth/react'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [today, setToday] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = stored === 'dark' || (!stored && prefersDark)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)

    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }))
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <>
      <header>
        {/* Top utility bar */}
        <div className="border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="hidden sm:inline" suppressHydrationWarning>{today}</span>
            <span className="sm:hidden text-[0.65rem]" suppressHydrationWarning>{today}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="hover:text-[var(--text)] transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
              <span className="text-[var(--border)]">|</span>
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link href="/dashboard" className="hover:text-[var(--text)] transition-colors">Dashboard</Link>
                    )}
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-[var(--text)] transition-colors">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="hover:text-[var(--text)] transition-colors">Sign in</Link>
                    <Link href="/plans" className="font-medium text-[var(--text)] hover:text-[var(--accent)] transition-colors">Subscribe</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Centered masthead */}
        <div className="py-5 md:py-7 text-center border-b-2 border-[var(--rule)]">
          <Link href="/" className="inline-block">
            <h1
              className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--text)]"
              style={{ fontFamily: 'var(--font-headline)' }}
            >
              {SITE_NAME_UPPER}
            </h1>
          </Link>
          <p className="text-[0.65rem] text-[var(--muted)] mt-1 tracking-[0.2em] uppercase">
            Independent Journalism Since 2024
          </p>
        </div>

        {/* Section navigation — sticky */}
        <nav className="border-b border-[var(--border)] sticky top-0 z-40 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-center gap-0 h-11 overflow-x-auto scrollbar-hide">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors whitespace-nowrap border-b-2 border-transparent hover:border-[var(--text)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center justify-between h-11">
              <span
                className="text-sm font-semibold tracking-tight"
                style={{ fontFamily: 'var(--font-headline)' }}
              >
                {SITE_NAME_UPPER}
              </span>
              <button
                onClick={() => setDrawerOpen(true)}
                className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Open menu"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 right-0 w-80 h-full bg-[var(--bg)] border-l border-[var(--border)] shadow-2xl animate-slide-right overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-headline)' }}>
                {SITE_NAME_UPPER}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* News Categories */}
            <div className="px-4 pt-5 pb-2">
              <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)] font-medium mb-2 px-1">
                News Categories
              </h3>
              <nav className="space-y-0">
                <Link href="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  All Stories
                </Link>
                <Link href="/?category=technology" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  Technology
                </Link>
                <Link href="/?category=business" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  Business
                </Link>
                <Link href="/?category=science" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2"/><line x1="8.5" y1="2" x2="15.5" y2="2"/><line x1="7" y1="16" x2="17" y2="16"/></svg>
                  Science
                </Link>
                <Link href="/?category=general" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
                  General
                </Link>
              </nav>
            </div>

            <hr className="mx-4 border-[var(--border)]" />

            {/* Tools & Resources */}
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)] font-medium mb-2 px-1">
                Tools &amp; Resources
              </h3>
              <nav className="space-y-0">
                <Link href="/search" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Search &amp; Archive
                </Link>
                <Link href="/plans" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Plans &amp; Pricing
                </Link>
                <Link href="/api-docs" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                  API Documentation
                </Link>
              </nav>
            </div>

            <hr className="mx-4 border-[var(--border)]" />

            {/* Account */}
            <div className="px-4 pt-4 pb-4">
              <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)] font-medium mb-2 px-1">
                Account
              </h3>
              {isAuthenticated ? (
                <div className="space-y-1">
                  <p className="text-xs text-[var(--muted)] px-3 py-1">{user?.email}</p>
                  {isAdmin && (
                    <Link href="/dashboard" onClick={() => setDrawerOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                      Dashboard
                    </Link>
                  )}
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors w-full text-left">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mt-1">
                  <Link href="/login" onClick={() => setDrawerOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                      Sign in
                    </button>
                  </Link>
                  <Link href="/plans" onClick={() => setDrawerOpen(false)}>
                    <button className="w-full px-3 py-2.5 text-sm bg-[var(--text)] text-[var(--bg)] font-medium hover:opacity-90 transition-opacity">
                      Subscribe
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <div className="px-4 pb-6">
              <hr className="border-[var(--border)] mb-4" />
              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors w-full text-left"
              >
                {isDark ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

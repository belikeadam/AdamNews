'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SITE_NAME_UPPER } from '@/constants/meta'
import { signOut } from 'next-auth/react'

interface NavbarProps {
  categories?: { name: string; slug: string }[]
}

const STATIC_CATEGORIES = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Business', slug: 'business' },
  { name: 'Science', slug: 'science' },
  { name: 'General', slug: 'general' },
]

// Shared nav link data — single source of truth for desktop + mobile
const TOOL_LINKS = [
  { href: '/search', label: 'Search & Archive', icon: 'search' },
  { href: '/plans', label: 'Plans & Pricing', icon: 'credit-card' },
  { href: '/api-docs', label: 'API Documentation', icon: 'code' },
] as const

// Reusable icon component
function NavIcon({ name }: { name: string }) {
  const p = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    case 'article': return <svg {...p}><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/></svg>
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'credit-card': return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    case 'code': return <svg {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'dashboard': return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'sign-in': return <svg {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    case 'sign-out': return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    case 'moon': return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    default: return null
  }
}

export default function Navbar({ categories }: NavbarProps) {
  const { isAuthenticated, isAdmin, user, plan } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [today, setToday] = useState('')

  const cats = categories && categories.length > 0 ? categories : STATIC_CATEGORIES
  const activeCategory = pathname === '/' ? searchParams.get('category') : null
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

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

  // Close drawer on ANY navigation (path or search params change)
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname, searchParams])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  // DRY drawer link — closes drawer on click
  const DrawerLink = ({ href, icon, children, active }: { href: string; icon: string; children: React.ReactNode; active?: boolean }) => (
    <Link
      href={href}
      onClick={closeDrawer}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
        active
          ? 'text-[var(--text)] bg-[var(--surface)]'
          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
      }`}
    >
      <NavIcon name={icon} />
      {children}
    </Link>
  )

  return (
    <>
      <header>
        {/* Top utility bar */}
        <div className="border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-xs text-[var(--muted)]">
            <span className="hidden sm:inline" suppressHydrationWarning>{today}</span>
            <span className="sm:hidden text-[0.65rem]" suppressHydrationWarning>{today}</span>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="hover:text-[var(--text)] transition-colors" aria-label="Toggle theme">
                <NavIcon name={isDark ? 'sun' : 'moon'} />
              </button>
              <span className="text-[var(--border)]">|</span>
              <a href={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/admin`} target="_blank" rel="noopener noreferrer" className="hidden md:inline hover:text-[var(--text)] transition-colors">
                CMS Admin
              </a>
              <span className="hidden md:inline text-[var(--border)]">|</span>
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/account" className="hover:text-[var(--text)] transition-colors">
                      {user?.name?.split(' ')[0] || 'Account'}
                      <span className="ml-1 text-[0.6rem] uppercase tracking-wider text-[var(--accent)]">({plan})</span>
                    </Link>
                    {isAdmin && <Link href="/dashboard" className="hover:text-[var(--text)] transition-colors">Dashboard</Link>}
                    <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:text-[var(--text)] transition-colors">Sign out</button>
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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-headline)' }}>
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
            {/* Desktop — uses same cats data */}
            <div className="hidden md:flex items-center justify-center gap-0 h-11 overflow-x-auto scrollbar-hide">
              <Link href="/" className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${pathname === '/' && !activeCategory ? 'text-[var(--text)] border-[var(--text)]' : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--text)]'}`}>
                Home
              </Link>
              {cats.map((cat) => (
                <Link key={cat.slug} href={`/?category=${cat.slug}`} className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${activeCategory === cat.slug ? 'text-[var(--text)] border-[var(--text)]' : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--text)]'}`}>
                  {cat.name}
                </Link>
              ))}
              {TOOL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${pathname === link.href ? 'text-[var(--text)] border-[var(--text)]' : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--text)]'}`}>
                  {link.label.split(' & ')[0]}
                </Link>
              ))}
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center justify-between h-11">
              <span className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
                {SITE_NAME_UPPER}
              </span>
              <button onClick={() => setDrawerOpen(true)} className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors" aria-label="Open menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={closeDrawer} />
          <div className="absolute top-0 right-0 w-80 h-full bg-[var(--bg)] border-l border-[var(--border)] shadow-2xl animate-slide-right overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-bold text-[var(--text)]" style={{ fontFamily: 'var(--font-headline)' }}>{SITE_NAME_UPPER}</span>
              <button onClick={closeDrawer} className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors" aria-label="Close menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Categories — dynamic from Strapi via DrawerLink */}
            <div className="px-4 pt-5 pb-2">
              <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)] font-medium mb-2 px-1">
                News Categories
              </h3>
              <nav className="space-y-0">
                <DrawerLink href="/" icon="home" active={pathname === '/' && !searchParams.get('category')}>
                  All Stories
                </DrawerLink>
                {cats.map((cat) => (
                  <DrawerLink key={cat.slug} href={`/?category=${cat.slug}`} icon="article" active={searchParams.get('category') === cat.slug}>
                    {cat.name}
                  </DrawerLink>
                ))}
              </nav>
            </div>

            <hr className="mx-4 border-[var(--border)]" />

            {/* Tools — uses shared TOOL_LINKS */}
            <div className="px-4 pt-4 pb-2">
              <h3 className="text-[0.65rem] uppercase tracking-[0.15em] text-[var(--muted)] font-medium mb-2 px-1">
                Tools &amp; Resources
              </h3>
              <nav className="space-y-0">
                {TOOL_LINKS.map((link) => (
                  <DrawerLink key={link.href} href={link.href} icon={link.icon} active={pathname === link.href}>
                    {link.label}
                  </DrawerLink>
                ))}
                <a
                  href={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeDrawer}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors"
                >
                  <NavIcon name="dashboard" />
                  CMS Admin
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-40"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
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
                  <div className="px-3 py-2 border border-[var(--border)] bg-[var(--surface)] mb-2">
                    <p className="text-sm font-medium text-[var(--text)]">{user?.name || 'User'}</p>
                    <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                    <span className="inline-block mt-1 text-[0.65rem] uppercase tracking-wider text-[var(--accent)] font-medium">
                      {plan} plan
                    </span>
                  </div>
                  <DrawerLink href="/account" icon="sign-in" active={pathname === '/account'}>
                    My Account
                  </DrawerLink>
                  {isAdmin && <DrawerLink href="/dashboard" icon="dashboard">Dashboard</DrawerLink>}
                  <button onClick={() => { signOut({ callbackUrl: '/' }); closeDrawer() }} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors w-full text-left">
                    <NavIcon name="sign-out" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mt-1">
                  <Link href="/login" onClick={closeDrawer}>
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm border border-[var(--border)] hover:bg-[var(--surface)] transition-colors">
                      <NavIcon name="sign-in" />
                      Sign in
                    </button>
                  </Link>
                  <Link href="/plans" onClick={closeDrawer}>
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
              <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors w-full text-left">
                <NavIcon name={isDark ? 'sun' : 'moon'} />
                {isDark ? 'Light mode' : 'Dark mode'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

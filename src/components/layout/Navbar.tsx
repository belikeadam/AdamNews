'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SITE_NAME_UPPER } from '@/constants/meta'
import { SITE_TAGLINE } from '@/constants/site'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import PrayerTimeWidget from '@/components/widgets/PrayerTimeWidget'
import WeatherWidget from '@/components/widgets/WeatherWidget'
import { getCategoryColor } from '@/constants/categories'

interface NavbarProps {
  categories?: { name: string; slug: string }[]
}

const STATIC_CATEGORIES = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Business', slug: 'business' },
  { name: 'Science', slug: 'science' },
  { name: 'General', slug: 'general' },
]

// Desktop tool links
const TOOL_LINKS = [
  { href: '/search', label: 'Search & Archive', icon: 'search' },
  { href: '/plans', label: 'Plans & Pricing', icon: 'credit-card' },
  { href: '/api-docs', label: 'API Documentation', icon: 'code' },
  { href: '/architecture', label: 'Architecture', icon: 'dashboard' },
] as const

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'home': return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'credit-card': return <svg {...p}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
    case 'code': return <svg {...p}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'dashboard': return <svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'sign-in': return <svg {...p}><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
    case 'sign-out': return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'sun': return <svg {...p}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    case 'moon': return <svg {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    case 'bookmark': return <svg {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
    case 'trending': return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
    case 'chevron-right': return <svg {...p}><polyline points="9 18 15 12 9 6"/></svg>
    case 'user': return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'star': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    default: return null
  }
}

export default function Navbar({ categories }: NavbarProps) {
  const { isAuthenticated, isAdmin, user, plan } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [today, setToday] = useState('')
  const [drawerSearch, setDrawerSearch] = useState('')
  const [savedCount, setSavedCount] = useState(0)

  const cats = categories && categories.length > 0 ? categories : STATIC_CATEGORIES
  const activeCategory = pathname === '/' ? searchParams.get('category') : null
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const isDashboard = pathname.startsWith('/dashboard')

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

    try {
      const raw = localStorage.getItem('savedArticles')
      if (raw) setSavedCount(JSON.parse(raw).length)
    } catch { /* ignore */ }
  }, [])

  // Refresh saved count when drawer opens
  useEffect(() => {
    if (drawerOpen) {
      try {
        const raw = localStorage.getItem('savedArticles')
        if (raw) setSavedCount(JSON.parse(raw).length)
        else setSavedCount(0)
      } catch { /* ignore */ }
    }
  }, [drawerOpen])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname, searchParams])

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const handleDrawerSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (drawerSearch.trim()) {
      router.push(`/search?q=${encodeURIComponent(drawerSearch.trim())}`)
      closeDrawer()
      setDrawerSearch('')
    }
  }

  return (
    <>
      <header>
        {/* Top utility bar — hidden on mobile in dashboard */}
        <div className={`border-b border-[var(--border)]${isDashboard ? ' hidden md:block' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 h-8 flex items-center justify-between text-xs text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline" suppressHydrationWarning>{today}</span>
              <span className="sm:hidden text-[0.65rem]" suppressHydrationWarning>{today}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <PrayerTimeWidget />
              <span className="text-[var(--border)] hidden sm:inline">|</span>
              <WeatherWidget />
              <span className="text-[var(--border)]">|</span>
              <button onClick={toggleTheme} className="hover:text-[var(--text)] transition-colors" aria-label="Toggle theme">
                <NavIcon name={isDark ? 'sun' : 'moon'} />
              </button>
              <span className="hidden md:inline text-[var(--border)]">|</span>
              {isAdmin && (
                <>
                  <a href={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/admin`} target="_blank" rel="noopener noreferrer" className="hidden md:inline hover:text-[var(--text)] transition-colors">
                    CMS
                  </a>
                  <span className="hidden md:inline text-[var(--border)]">|</span>
                </>
              )}
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

        {/* Centered masthead — hidden on mobile in dashboard */}
        <div className={`py-5 md:py-7 text-center border-b-2 border-[var(--rule)]${isDashboard ? ' hidden md:block' : ''}`}>
          <Link href="/" className="inline-block">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--text)]" style={{ fontFamily: 'var(--font-headline)' }}>
              {SITE_NAME_UPPER}
            </h1>
          </Link>
          <p className="text-[0.65rem] text-[var(--muted)] mt-1 tracking-[0.2em] uppercase">
            {SITE_TAGLINE}
          </p>
        </div>

        {/* Section navigation — sticky */}
        <nav className="border-b border-[var(--border)] sticky top-0 z-40 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto px-4">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-center gap-0 h-11 overflow-x-auto scrollbar-hide">
              <Link href="/" className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${pathname === '/' && !activeCategory ? 'text-[var(--text)] border-[var(--text)]' : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--text)]'}`}>
                Home
              </Link>
              {cats.map((cat) => {
                const colors = getCategoryColor(cat.slug)
                const isActive = activeCategory === cat.slug
                return (
                  <Link
                    key={cat.slug}
                    href={`/?category=${cat.slug}`}
                    className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'text-[var(--text)]'
                        : 'text-[var(--muted)] border-transparent hover:text-[var(--text)]'
                    }`}
                    style={{ borderBottomColor: isActive ? colors.primary : 'transparent' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
                    {cat.name}
                  </Link>
                )
              })}
              {TOOL_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${pathname === link.href ? 'text-[var(--text)] border-[var(--text)]' : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:border-[var(--text)]'}`}>
                  {link.label.split(' & ')[0]}
                </Link>
              ))}
            </div>

            {/* Mobile sticky bar */}
            <div className="flex md:hidden items-center justify-between h-11">
              <span className="text-sm font-semibold tracking-tight" style={{ fontFamily: 'var(--font-headline)' }}>
                {SITE_NAME_UPPER}
              </span>
              <div className="flex items-center gap-1">
                <Link href="/search" className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors" aria-label="Search">
                  <NavIcon name="search" />
                </Link>
                <button onClick={() => setDrawerOpen(true)} className="h-9 w-9 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors" aria-label="Open menu">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Mobile drawer — redesigned for reader engagement       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeDrawer}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100 || info.velocity.x > 500) closeDrawer()
              }}
              className="absolute top-0 right-0 w-[85vw] max-w-[320px] h-full bg-[var(--bg)] border-l border-[var(--border)] shadow-2xl flex flex-col"
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <Link href="/" onClick={closeDrawer} className="font-bold text-lg text-[var(--text)]" style={{ fontFamily: 'var(--font-headline)' }}>
                  {SITE_NAME_UPPER}
                </Link>
                <button onClick={closeDrawer} className="h-8 w-8 flex items-center justify-center rounded-full bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] transition-colors" aria-label="Close menu">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* ── Scrollable content ── */}
              <div className="flex-1 overflow-y-auto">
                {/* Search */}
                <div className="px-5 pt-5 pb-3">
                  <form onSubmit={handleDrawerSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        value={drawerSearch}
                        onChange={(e) => setDrawerSearch(e.target.value)}
                        placeholder="Search articles..."
                        className="w-full h-11 pl-10 pr-4 text-sm rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all placeholder:text-[var(--muted)]"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                        <NavIcon name="search" />
                      </div>
                    </div>
                  </form>
                </div>

                {/* Category chips */}
                <div className="px-5 pb-4">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href="/"
                      onClick={closeDrawer}
                      className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        pathname === '/' && !activeCategory
                          ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                          : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)]'
                      }`}
                    >
                      Home
                    </Link>
                    {cats.map((cat) => {
                      const colors = getCategoryColor(cat.slug)
                      const isActive = activeCategory === cat.slug
                      return (
                        <Link
                          key={cat.slug}
                          href={`/?category=${cat.slug}`}
                          onClick={closeDrawer}
                          className={`px-3.5 py-1.5 text-xs font-medium rounded-full border transition-all flex items-center gap-1.5 ${
                            isActive
                              ? 'text-white'
                              : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--text)]'
                          }`}
                          style={isActive ? { backgroundColor: colors.primary, borderColor: colors.primary } : undefined}
                        >
                          {!isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />}
                          {cat.name}
                        </Link>
                      )
                    })}
                  </div>
                </div>

                {/* ── Your reading ── */}
                <div className="px-5 py-3">
                  <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--muted)] font-semibold mb-2">
                    Your Reading
                  </h3>
                  <Link
                    href="/saved"
                    onClick={closeDrawer}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-lg transition-all ${
                      pathname === '/saved'
                        ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                        : 'text-[var(--text)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface)]">
                      <NavIcon name="bookmark" size={14} />
                    </div>
                    <span className="flex-1 text-sm font-medium">Saved Articles</span>
                    {savedCount > 0 && (
                      <span className="text-[0.65rem] font-bold bg-[var(--accent)] text-white px-2 py-0.5 rounded-full min-w-[22px] text-center">
                        {savedCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/search?sort=trending"
                    onClick={closeDrawer}
                    className="flex items-center gap-3 px-3.5 py-3 rounded-lg text-[var(--text)] hover:bg-[var(--surface)] transition-all"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface)]">
                      <NavIcon name="trending" size={14} />
                    </div>
                    <span className="flex-1 text-sm font-medium">Trending Now</span>
                    <span className="text-[var(--muted)]">
                      <NavIcon name="chevron-right" size={14} />
                    </span>
                  </Link>
                </div>

                {/* ── Local info (prayer + weather for mobile) ── */}
                <div className="mx-5 px-4 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                  <div className="flex items-center justify-between">
                    <PrayerTimeWidget />
                    <span className="text-[var(--border)]">·</span>
                    <WeatherWidget />
                  </div>
                </div>

                {/* ── Explore ── */}
                <div className="px-5 py-4">
                  <h3 className="text-[0.6rem] uppercase tracking-[0.15em] text-[var(--muted)] font-semibold mb-2">
                    Explore
                  </h3>
                  <nav className="space-y-0.5">
                    <Link
                      href="/search"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                        pathname === '/search'
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <NavIcon name="search" size={15} />
                      Search & Archive
                    </Link>
                    <Link
                      href="/plans"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                        pathname === '/plans'
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <NavIcon name="star" size={15} />
                      Plans & Pricing
                    </Link>
                    {/* Developer tools — visible to all users (matches desktop nav) */}
                    <Link
                      href="/api-docs"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                        pathname === '/api-docs'
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <NavIcon name="code" size={15} />
                      API Docs
                    </Link>
                    <Link
                      href="/architecture"
                      onClick={closeDrawer}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all ${
                        pathname === '/architecture'
                          ? 'bg-[var(--accent-light)] text-[var(--accent)] font-medium'
                          : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      <NavIcon name="dashboard" size={15} />
                      Architecture
                    </Link>
                    {/* Admin-only CMS link */}
                    {isAdmin && (
                      <a
                        href={`${process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'}/admin`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={closeDrawer}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-all"
                      >
                        <NavIcon name="dashboard" size={15} />
                        <span className="flex-1">CMS Admin</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    )}
                  </nav>
                </div>
              </div>

              {/* ── Footer area (fixed at bottom) ── */}
              <div className="border-t border-[var(--border)] bg-[var(--surface)]/50">
                {/* Theme toggle */}
                <div className="px-5 py-3">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg hover:bg-[var(--surface)] transition-all"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface)]">
                      <NavIcon name={isDark ? 'sun' : 'moon'} size={14} />
                    </div>
                    <span className="flex-1 text-sm text-[var(--text)] text-left font-medium">
                      {isDark ? 'Light mode' : 'Dark mode'}
                    </span>
                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isDark ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
                      <motion.div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                        animate={{ left: isDark ? '22px' : '2px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </div>
                  </button>
                </div>

                {/* Account section */}
                <div className="px-5 pb-5">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link
                        href="/account"
                        onClick={closeDrawer}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] transition-all"
                      >
                        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-sm font-bold">
                          {(user?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text)] truncate">{user?.name || 'User'}</p>
                          <p className="text-[0.65rem] text-[var(--accent)] font-medium uppercase tracking-wider">{plan} plan</p>
                        </div>
                        <span className="text-[var(--muted)]">
                          <NavIcon name="chevron-right" size={14} />
                        </span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          onClick={closeDrawer}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-[var(--muted)] bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
                        >
                          <NavIcon name="dashboard" size={12} />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => { signOut({ callbackUrl: '/' }); closeDrawer() }}
                        className="w-full px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--danger)] transition-colors text-center"
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <Link href="/login" onClick={closeDrawer} className="block">
                        <div className="flex items-center justify-center gap-2.5 w-full px-4 py-3 rounded-lg text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors">
                          <NavIcon name="sign-in" size={16} />
                          Sign in
                        </div>
                      </Link>
                      <Link href="/plans" onClick={closeDrawer} className="block">
                        <div className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium border-2 border-[var(--text)] text-[var(--text)] hover:bg-[var(--text)] hover:text-[var(--bg)] transition-all">
                          <NavIcon name="star" size={14} />
                          Subscribe
                        </div>
                      </Link>
                      <p className="text-[0.65rem] text-center text-[var(--muted)]">
                        One-click demo login available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

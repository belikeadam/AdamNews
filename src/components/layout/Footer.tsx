import Link from 'next/link'
import { SITE_NAME, SITE_NAME_UPPER } from '@/constants/meta'
import { SITE_TAGLINE } from '@/constants/site'

export default function Footer() {
  return (
    <footer className="border-t-2 border-[var(--rule)] mt-16">
      {/* Masthead repeat */}
      <div className="py-8 text-center border-b border-[var(--border)]">
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--text)]"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          {SITE_NAME_UPPER}
        </Link>
        <p className="text-xs text-[var(--muted)] mt-1 tracking-[0.15em] uppercase">
          {SITE_TAGLINE}
        </p>
      </div>

      {/* Section links */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
        <Link href="/" className="hover:text-[var(--text)] transition-colors">Home</Link>
        <Link href="/plans" className="hover:text-[var(--text)] transition-colors">Plans</Link>
        <Link href="/api-docs" className="hover:text-[var(--text)] transition-colors">API Docs</Link>
        <Link href="/architecture" className="hover:text-[var(--text)] transition-colors">Architecture</Link>
        <Link href="/login" className="hover:text-[var(--text)] transition-colors">Sign In</Link>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

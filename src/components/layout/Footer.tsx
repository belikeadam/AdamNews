import Link from 'next/link'
import { SITE_NAME, SITE_NAME_UPPER } from '@/constants/meta'
import { SITE_TAGLINE } from '@/constants/site'

const CATEGORIES = [
  { name: 'Technology', slug: 'technology', color: '#2563eb' },
  { name: 'Business', slug: 'business', color: '#059669' },
  { name: 'Science', slug: 'science', color: '#7c3aed' },
  { name: 'General', slug: 'general', color: '#8b0000' },
]

const COMPANY_LINKS = [
  { href: '/plans', label: 'Plans & Pricing' },
  { href: '/api-docs', label: 'API Docs' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
]

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/belikeadam/AdamNews',
    icon: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/belikeadam',
    icon: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
  },
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/belikeadam',
    icon: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231z" fill="currentColor" stroke="none" />,
  },
]

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

      {/* Footer grid */}
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
        {/* Categories */}
        <div>
          <h4 className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-[var(--muted)] mb-3">
            Categories
          </h4>
          <nav className="space-y-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/?category=${cat.slug}`}
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-[var(--muted)] mb-3">
            Platform
          </h4>
          <nav className="space-y-2">
            {COMPANY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Connect */}
        <div className="col-span-2 sm:col-span-1">
          <h4 className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold text-[var(--muted)] mb-3">
            Connect
          </h4>
          <nav className="space-y-2">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {link.icon}
                </svg>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Tech stack badge */}
          <div className="mt-6 flex flex-wrap gap-1.5">
            {['Next.js', 'React', 'Strapi', 'Stripe', 'Tailwind'].map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-[0.6rem] font-medium text-[var(--muted)] border border-[var(--border)] rounded-full"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border)] bg-[var(--surface)] py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--muted)]">
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--text)] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[var(--text)] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[var(--text)] transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-[var(--text)] transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

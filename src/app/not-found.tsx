import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="section-label mb-4">404</p>
        <h1
          className="text-4xl sm:text-5xl font-bold text-[var(--text)] mb-4"
          style={{ fontFamily: 'var(--font-headline)' }}
        >
          Page Not Found
        </h1>
        <p className="text-[var(--muted)] mb-8 leading-relaxed">
          The story you&apos;re looking for may have been moved, removed, or
          never existed. Try searching or return to the homepage.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 border border-[var(--border)] text-[var(--text)] text-sm font-medium hover:bg-[var(--surface)] transition-colors"
          >
            Search Articles
          </Link>
        </div>
      </div>
    </div>
  )
}

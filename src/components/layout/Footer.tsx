import { SITE_NAME } from '@/constants/meta'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--muted)]">
          <p>
            &copy; {new Date().getFullYear()} {SITE_NAME}. Built with Next.js,
            Strapi &amp; Stripe.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[var(--text)] transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-[var(--text)] transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-[var(--text)] transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

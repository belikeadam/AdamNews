import { Metadata } from 'next'
import { SITE_NAME } from '@/constants/meta'

export const metadata: Metadata = {
  title: 'Contact',
}

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1
        className="headline-xl mb-2"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        Contact Us
      </h1>
      <p className="text-[var(--muted)] mb-10 leading-relaxed">
        Have a tip, correction, or question? We&apos;d love to hear from you.
      </p>

      <div className="grid sm:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
              Editorial
            </h2>
            <p className="text-[var(--muted)] text-sm">
              News tips, corrections, and story ideas
            </p>
            <a href="mailto:editorial@adamnews.com" className="text-[var(--accent)] text-sm hover:underline">
              editorial@adamnews.com
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
              Subscriptions
            </h2>
            <p className="text-[var(--muted)] text-sm">
              Billing, account access, and plan changes
            </p>
            <a href="mailto:support@adamnews.com" className="text-[var(--accent)] text-sm hover:underline">
              support@adamnews.com
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--text)] uppercase tracking-wider mb-1">
              Advertising
            </h2>
            <p className="text-[var(--muted)] text-sm">
              Display ads, sponsored content, and partnerships
            </p>
            <a href="mailto:ads@adamnews.com" className="text-[var(--accent)] text-sm hover:underline">
              ads@adamnews.com
            </a>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] p-6">
          <h2
            className="text-lg font-semibold text-[var(--text)] mb-1"
            style={{ fontFamily: 'var(--font-headline)' }}
          >
            {SITE_NAME}
          </h2>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mb-4">
            Independent Journalism Since 2024
          </p>
          <div className="space-y-2 text-sm text-[var(--muted)]">
            <p>Kuala Lumpur, Malaysia</p>
            <p>
              General inquiries:{' '}
              <a href="mailto:hello@adamnews.com" className="text-[var(--accent)] hover:underline">
                hello@adamnews.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

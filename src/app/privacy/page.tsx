import { Metadata } from 'next'
import { SITE_NAME } from '@/constants/meta'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1
        className="headline-xl mb-2"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        Privacy Policy
      </h1>
      <p className="byline mb-8">Last updated: February 2026</p>

      <div className="prose-news space-y-6 text-[var(--muted)] leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Information We Collect
          </h2>
          <p>
            When you create an account with {SITE_NAME}, we collect your name, email address, and
            authentication credentials. If you subscribe to a paid plan, payment processing is handled
            securely by Stripe — we never store your card details directly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            How We Use Your Information
          </h2>
          <p>
            We use your information to provide access to our journalism, process subscriptions,
            send editorial newsletters you&apos;ve opted into, and improve the reading experience.
            We do not sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Cookies
          </h2>
          <p>
            We use essential cookies for authentication and session management. Analytics cookies
            help us understand how readers engage with our content. You can disable non-essential
            cookies in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Data Retention
          </h2>
          <p>
            We retain your account data for as long as your account is active. If you request
            deletion, we will remove your personal data within 30 days, except where required
            by law.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Contact
          </h2>
          <p>
            For privacy-related inquiries, reach us at{' '}
            <a href="mailto:privacy@adamnews.com" className="text-[var(--accent)] hover:underline">
              privacy@adamnews.com
            </a>.
          </p>
        </section>
      </div>
    </div>
  )
}

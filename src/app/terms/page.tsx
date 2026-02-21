import { Metadata } from 'next'
import { SITE_NAME } from '@/constants/meta'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1
        className="headline-xl mb-2"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        Terms of Service
      </h1>
      <p className="byline mb-8">Last updated: February 2026</p>

      <div className="prose-news space-y-6 text-[var(--muted)] leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Acceptance of Terms
          </h2>
          <p>
            By accessing and using {SITE_NAME}, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Subscriptions & Billing
          </h2>
          <p>
            Paid subscriptions are billed on a recurring basis (monthly or annual) through Stripe.
            You may cancel at any time from your account dashboard. Cancellations take effect at
            the end of the current billing period. We offer a 30-day money-back guarantee on
            all new subscriptions.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Content & Intellectual Property
          </h2>
          <p>
            All articles, images, and editorial content published on {SITE_NAME} are protected
            by copyright. You may share links freely, but reproducing full articles requires
            written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            User Conduct
          </h2>
          <p>
            You agree not to misuse the service, including attempting to access premium content
            without a valid subscription, scraping content, or interfering with other users&apos;
            experience.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Limitation of Liability
          </h2>
          <p>
            {SITE_NAME} is provided &quot;as is&quot; without warranty of any kind. We are not
            liable for any damages arising from your use of the service, including but not
            limited to direct, indirect, incidental, or consequential damages.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[var(--text)] mb-2" style={{ fontFamily: 'var(--font-headline)' }}>
            Changes to Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of the service after
            changes constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>
    </div>
  )
}

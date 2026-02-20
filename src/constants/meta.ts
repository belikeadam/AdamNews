export const SITE_NAME = 'AdamNews'
export const SITE_DESCRIPTION =
  'A modern news platform built with Next.js, Strapi, and Stripe. Showcasing ISR, server components, and real-time content management.'
export const SITE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

export const DEFAULT_META = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website' as const,
    locale: 'en_US',
    siteName: SITE_NAME,
  },
} as const

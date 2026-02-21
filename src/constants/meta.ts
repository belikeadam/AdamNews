export const SITE_NAME = 'The Adam News'
export const SITE_NAME_UPPER = 'THE ADAM NEWS'
export const SITE_DESCRIPTION =
  'Independent journalism and in-depth reporting. Breaking news, analysis, and opinion.'
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

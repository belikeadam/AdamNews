import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isStripeApi = nextUrl.pathname.startsWith('/api/stripe')

      if (isOnDashboard) {
        if (!isLoggedIn) return false
        // Check admin role from token
        const role = (auth as { user?: { role?: string } })?.user?.role
        if (role !== 'admin') {
          return Response.redirect(new URL('/', nextUrl))
        }
        return true
      }

      if (isStripeApi && !nextUrl.pathname.includes('webhook')) {
        return isLoggedIn
      }

      return true
    },
  },
}

import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
        token.plan = (user as { plan?: string }).plan
      }
      return token
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isStripeApi = nextUrl.pathname.startsWith('/api/stripe')

      if (isOnDashboard) {
        if (!isLoggedIn) return false
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
    session({ session, token }) {
      if (token) {
        session.user.role = token.role as string
        session.user.plan = token.plan as string
      }
      return session
    },
  },
}

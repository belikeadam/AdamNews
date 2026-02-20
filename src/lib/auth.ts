import NextAuth from 'next-auth'
import { authConfig } from '@/auth.config'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import type { UserRole, UserPlan } from '@/types'

// Demo users for development
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@AdamNews.com',
    password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.1u', // demo1234
    name: 'Admin User',
    role: 'admin' as UserRole,
    plan: 'premium' as UserPlan,
  },
  {
    id: '2',
    email: 'reader@AdamNews.com',
    password: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu.1u', // demo1234
    name: 'Reader User',
    role: 'user' as UserRole,
    plan: 'free' as UserPlan,
  },
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        // Check demo users first
        const demoUser = DEMO_USERS.find((u) => u.email === email)
        if (demoUser) {
          const isValid = await bcrypt.compare(password, demoUser.password)
          if (!isValid) return null
          return {
            id: demoUser.id,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
            plan: demoUser.plan,
          }
        }

        // TODO: Check Strapi users in production
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role: UserRole }).role
        token.plan = (user as { plan: UserPlan }).plan
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = (token.id as string) || ''
        session.user.role = (token.role as UserRole) || 'user'
        session.user.plan = (token.plan as UserPlan) || 'free'
      }
      return session
    },
  },
})

import type { DefaultSession } from 'next-auth'

export type UserRole = 'admin' | 'user'
export type UserPlan = 'free' | 'standard' | 'premium'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      plan: UserPlan
    } & DefaultSession['user']
  }

  interface User {
    role: UserRole
    plan: UserPlan
  }
}

// JWT augmentation is handled in src/lib/auth.ts via callback typing

'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'admin',
    isPremium:
      session?.user?.plan === 'premium' ||
      session?.user?.plan === 'standard',
    plan: session?.user?.plan ?? 'free',
  }
}

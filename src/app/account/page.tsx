'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import Card, { CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import type { UserPlan } from '@/types'

const PLAN_DETAILS: Record<string, { name: string; color: 'success' | 'accent' | 'warning'; features: string[] }> = {
  free: {
    name: 'Reader (Free)',
    color: 'success',
    features: ['5 articles/month', 'Breaking news alerts', 'Newsletter'],
  },
  standard: {
    name: 'Standard',
    color: 'accent',
    features: ['Unlimited articles', 'No ads', 'Offline reading', 'Priority support'],
  },
  premium: {
    name: 'Premium',
    color: 'warning',
    features: ['Everything in Standard', 'Exclusive reports', 'Weekly briefing', 'API access'],
  },
}

function AccountContent() {
  const { user, isAuthenticated, isLoading, plan } = useAuth()
  const { update } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)
  const [upgradedPlan, setUpgradedPlan] = useState<string | null>(null)

  // Handle post-checkout success
  useEffect(() => {
    const checkout = searchParams.get('checkout')
    const newPlan = searchParams.get('plan') as UserPlan | null

    if (checkout === 'success' && newPlan && ['standard', 'premium'].includes(newPlan)) {
      setShowSuccess(true)
      setUpgradedPlan(newPlan)
      // Update the JWT session with the new plan
      update({ plan: newPlan })
      // Clean URL without triggering re-render loop
      window.history.replaceState({}, '', '/account')
    }
  }, [searchParams, update])

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?callbackUrl=/account')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading || !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="border border-[var(--border)] p-6 mb-6 space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <div className="border border-[var(--border)] p-6 space-y-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  const currentPlan = upgradedPlan || plan
  const planInfo = PLAN_DETAILS[currentPlan] || PLAN_DETAILS.free

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 pb-10">
      <h1
        className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-6"
        style={{ fontFamily: 'var(--font-headline)' }}
      >
        My Account
      </h1>

      {/* Success banner after checkout */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
          <div className="flex items-start gap-3">
            <span className="text-green-600 text-xl">&#10003;</span>
            <div>
              <p className="font-semibold text-green-800 dark:text-green-300">
                Subscription activated!
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                You&apos;re now on the <strong>{PLAN_DETAILS[upgradedPlan || 'standard']?.name}</strong> plan.
                Enjoy unlimited access to premium content.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Profile card */}
      <Card className="mb-6">
        <CardContent>
          <h2 className="font-semibold text-[var(--text)] mb-4 text-sm uppercase tracking-wider">
            Profile
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Name</span>
              <span className="text-sm font-medium text-[var(--text)]">{user?.name || '—'}</span>
            </div>
            <hr className="border-[var(--border)]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Email</span>
              <span className="text-sm font-medium text-[var(--text)]">{user?.email || '—'}</span>
            </div>
            <hr className="border-[var(--border)]" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Role</span>
              <Badge variant={user?.role === 'admin' ? 'accent' : 'success'} size="sm">
                {user?.role || 'user'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription card */}
      <Card className="mb-6">
        <CardContent>
          <h2 className="font-semibold text-[var(--text)] mb-4 text-sm uppercase tracking-wider">
            Subscription
          </h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-[var(--text)]">{planInfo.name}</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                {currentPlan === 'free' ? 'No active subscription' : 'Active subscription via Stripe'}
              </p>
            </div>
            <Badge variant={planInfo.color} size="md" pill>
              {currentPlan === 'free' ? 'Free' : 'Active'}
            </Badge>
          </div>

          <div className="bg-[var(--surface)] p-3 mb-4">
            <p className="text-xs font-medium text-[var(--muted)] mb-2 uppercase tracking-wider">
              Plan includes
            </p>
            <ul className="space-y-1.5">
              {planInfo.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-[var(--text)]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {currentPlan === 'free' ? (
            <Link href="/plans">
              <Button variant="primary" className="w-full">
                Upgrade your plan
              </Button>
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link href="/plans" className="flex-1">
                <Button variant="outline" className="w-full">
                  Change plan
                </Button>
              </Link>
              <Button variant="outline" className="flex-1" disabled>
                Manage billing
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/">
          <Card hover className="h-full">
            <CardContent className="py-4 text-center">
              <p className="text-sm font-medium text-[var(--text)]">Browse articles</p>
              <p className="text-xs text-[var(--muted)] mt-1">Read the latest news</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/saved">
          <Card hover className="h-full">
            <CardContent className="py-4 text-center">
              <p className="text-sm font-medium text-[var(--text)]">Saved articles</p>
              <p className="text-xs text-[var(--muted)] mt-1">Your bookmarks</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-10">
          <div className="h-8 w-40 bg-[var(--surface-2)] animate-pulse rounded mb-6" />
          <div className="border border-[var(--border)] p-6 mb-6 space-y-4">
            <div className="h-4 w-20 bg-[var(--surface-2)] animate-pulse rounded" />
            <div className="h-5 w-full bg-[var(--surface-2)] animate-pulse rounded" />
            <div className="h-5 w-3/4 bg-[var(--surface-2)] animate-pulse rounded" />
          </div>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const DEMO_ACCOUNTS = [
  {
    label: 'Admin Demo',
    description: 'Full access — dashboard, CMS editor, premium content',
    email: 'admin@AdamNews.com',
    password: 'demo1234',
    badge: 'Admin + Premium',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  {
    label: 'Reader Demo',
    description: 'Free tier — browse articles, test subscription upgrade',
    email: 'reader@AdamNews.com',
    password: 'demo1234',
    badge: 'Free Plan',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
]

export default function DemoLoginButtons() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDemoLogin = async (email: string, password: string) => {
    setLoading(email)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setLoading(null)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider text-center">
        Quick Demo Access
      </p>
      {DEMO_ACCOUNTS.map((account) => (
        <button
          key={account.email}
          onClick={() => handleDemoLogin(account.email, account.password)}
          disabled={loading !== null}
          className="w-full text-left px-4 py-3 border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--surface)] transition-all group disabled:opacity-50"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
              {loading === account.email ? 'Signing in...' : account.label}
            </span>
            <span className={`text-[0.6rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${account.badgeColor}`}>
              {account.badge}
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">{account.description}</p>
        </button>
      ))}
    </div>
  )
}

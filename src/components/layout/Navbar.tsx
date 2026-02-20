'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { NAV_ITEMS } from '@/constants/nav'
import { SITE_NAME } from '@/constants/meta'
import Button from '@/components/ui/Button'
import { signOut } from 'next-auth/react'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-[var(--text)]">
            {SITE_NAME}
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
              )}
              <span className="text-sm text-[var(--muted)] hidden sm:inline">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/plans">
                <Button size="sm">Subscribe</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

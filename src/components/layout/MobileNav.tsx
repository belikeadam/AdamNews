'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export default function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (pathname.startsWith('/dashboard')) return null

  // Dynamic nav items based on auth state
  // While loading, show neutral "Account" to prevent flash of "Sign in"
  const items = [
    { label: 'Home', href: '/', icon: 'Home' },
    { label: 'Search', href: '/search', icon: 'Search' },
    { label: 'Saved', href: '/saved', icon: 'Bookmark' },
    ...(isAuthenticated && isAdmin
      ? [{ label: 'Dashboard', href: '/dashboard', icon: 'Dashboard' }]
      : []),
    ...(isLoading
      ? [{ label: 'Account', href: '#', icon: 'User' }]
      : isAuthenticated
        ? [{ label: 'Account', href: '/account', icon: 'User' }]
        : [{ label: 'Sign in', href: '/login', icon: 'User' }]),
  ]

  // Deduplicate if admin (Dashboard + Account both go to /dashboard)
  const uniqueItems = items.filter(
    (item, index, self) => index === self.findIndex((t) => t.href === item.href)
  )

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)]/80 backdrop-blur-lg border-t border-[var(--border)] safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {uniqueItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[48px] text-xs font-medium transition-colors relative',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)]'
              )}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[var(--accent)]" />
              )}
              <span className="w-5 h-5">{getIcon(item.icon, isActive)}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function getIcon(name: string, active: boolean) {
  const strokeWidth = active ? 2.5 : 2
  const props = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (name) {
    case 'Home':
      return (
        <svg {...props}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'Search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      )
    case 'CreditCard':
      return (
        <svg {...props}>
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      )
    case 'Bookmark':
      return (
        <svg {...props}>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )
    case 'Dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    case 'User':
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

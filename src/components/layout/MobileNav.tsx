'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MOBILE_NAV } from '@/constants/nav'
import { cn } from '@/lib/utils'

export default function MobileNav() {
  const pathname = usePathname()

  // Hide on dashboard pages (dashboard has its own nav)
  if (pathname.startsWith('/dashboard')) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg)] border-t border-[var(--border)] safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {MOBILE_NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-[44px] text-xs transition-colors',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--muted)]'
              )}
            >
              <span className="text-lg">{getIcon(item.icon)}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function getIcon(name: string) {
  switch (name) {
    case 'Home':
      return '\u2302'
    case 'CreditCard':
      return '\u2B1A'
    case 'Code':
      return '\u27E8/\u27E9'
    case 'User':
      return '\u263A'
    default:
      return '\u25CF'
  }
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV } from '@/constants/nav'
import { cn } from '@/lib/utils'

export default function DashboardMobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden flex border-b border-[var(--border)] bg-[var(--surface)] overflow-x-auto">
      {DASHBOARD_NAV.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
              isActive
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            <span className="text-sm">{getIcon(item.icon)}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function getIcon(name: string) {
  switch (name) {
    case 'LayoutDashboard':
      return '\u25A6'
    case 'FileText':
      return '\u2756'
    case 'BarChart3':
      return '\u2587'
    case 'Users':
      return '\u263B'
    default:
      return '\u25CF'
  }
}

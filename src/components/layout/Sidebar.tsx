'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DASHBOARD_NAV } from '@/constants/nav'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-[var(--border)] bg-[var(--surface)] min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-1 p-3">
        {DASHBOARD_NAV.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' &&
              pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 h-11 rounded text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]'
              )}
            >
              <span className="text-base">{getIcon(item.icon)}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
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

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'

export default function DashboardFAB() {
  const pathname = usePathname()

  // Hide on the editor page itself (redundant there)
  if (pathname.includes('/edit')) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Link
        href="/dashboard/posts/new/edit"
        className="group flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 h-14 px-4 sm:px-5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="text-sm font-semibold whitespace-nowrap max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-200">
          New Article
        </span>
      </Link>
    </motion.div>
  )
}

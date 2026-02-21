import Sidebar from '@/components/layout/Sidebar'
import DashboardMobileNav from '@/components/layout/DashboardMobileNav'
import DashboardFAB from '@/components/dashboard/DashboardFAB'
import TechBar from '@/components/layout/TechBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* TechBar: hidden on mobile, visible on desktop for reviewers */}
      <div className="hidden md:block">
        <TechBar
          badges={[
            { label: 'CSR', tooltip: 'Client-side rendered dashboard', variant: 'purple' },
            { label: 'Protected', tooltip: 'Middleware guards — admin only' },
            { label: 'Admin only', tooltip: 'Requires role === admin in JWT' },
            { label: 'NextAuth v5', tooltip: 'Session managed by Auth.js' },
          ]}
        />
      </div>
      <DashboardMobileNav />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </div>
      <DashboardFAB />
    </>
  )
}

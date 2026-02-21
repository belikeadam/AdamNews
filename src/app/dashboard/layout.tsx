import Sidebar from '@/components/layout/Sidebar'
import DashboardMobileNav from '@/components/layout/DashboardMobileNav'
import TechBar from '@/components/layout/TechBar'
import DemoBanner from '@/components/shared/DemoBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TechBar
        badges={[
          { label: 'CSR', tooltip: 'Client-side rendered dashboard', variant: 'purple' },
          { label: 'Protected', tooltip: 'Middleware guards — admin only' },
          { label: 'Admin only', tooltip: 'Requires role === admin in JWT' },
          { label: 'NextAuth v5', tooltip: 'Session managed by Auth.js' },
        ]}
      />
      <DemoBanner />
      <DashboardMobileNav />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </div>
    </>
  )
}

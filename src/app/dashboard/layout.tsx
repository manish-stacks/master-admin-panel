import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="cms-layout">
      <Sidebar user={user!} />
      <div className="cms-main">
        <Topbar user={user!} />
        <main className="cms-content page-fade">
          {children}
        </main>
      </div>
    </div>
  )
}

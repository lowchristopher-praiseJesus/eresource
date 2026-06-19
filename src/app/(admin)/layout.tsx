import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={session.user?.email ?? ''} />
      <main className="md:ml-60 pt-14 md:pt-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}

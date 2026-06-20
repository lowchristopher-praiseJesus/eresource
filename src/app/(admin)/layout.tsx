import { auth } from '@/lib/auth'
import { Sidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Login page lives in its own (admin-login) route group and never reaches
  // this layout, so every request here is an authenticated admin page.
  const session = await auth()

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={session?.user?.email ?? ''} />
      <main className="md:ml-60 pt-14 md:pt-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}

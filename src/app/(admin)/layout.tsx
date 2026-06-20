import { headers } from 'next/headers'
import { Sidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Read auth state from request headers stamped by the middleware.
  // This is more reliable than calling auth() here, which can return null
  // on the first render after login due to NextAuth v5 JWT timing.
  const h = await headers()
  const pathname = h.get('x-pathname') ?? ''
  const userEmail = h.get('x-user-email') ?? ''

  // Login page — render without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar userEmail={userEmail} />
      <main className="md:ml-60 pt-14 md:pt-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  )
}

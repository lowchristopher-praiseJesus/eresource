import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

// Admin auth proxy — wraps NextAuth's auth() to protect /admin/* routes
export const proxy = auth((req) => {
  // Forward auth state as request headers so server components can read
  // them via headers() without a second auth() call (which can miss on
  // the first render after login due to NextAuth v5 JWT timing).
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)
  if (req.auth?.user?.email) {
    requestHeaders.set('x-user-email', req.auth.user.email)
  }

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  if (isAdminRoute) {
    const isLoginPage = req.nextUrl.pathname === '/admin/login'
    const isAuthenticated = !!req.auth

    if (!isLoginPage && !isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }

    if (isLoginPage && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url))
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } })
})

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}

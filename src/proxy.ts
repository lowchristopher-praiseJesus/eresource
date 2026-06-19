import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Admin auth proxy — wraps NextAuth's auth() to protect /admin/* routes
export const proxy = auth((req) => {
  const response = NextResponse.next()

  // Stamp x-pathname on every response so the public layout can
  // derive the active category for context-aware header search (M4)
  response.headers.set('x-pathname', req.nextUrl.pathname)

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

  return response
})

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}

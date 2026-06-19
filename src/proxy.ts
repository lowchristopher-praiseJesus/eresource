import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const proxy = auth((req) => {
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isAuthenticated = !!req.auth

  if (!isLoginPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}

'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const NAV_LINKS = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/resources', label: 'Resources' },
]

interface SidebarProps {
  userEmail: string
}

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4">
        <p className="text-base font-semibold tracking-tight">eResource</p>
        <p className="text-xs text-slate-500 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 px-3">
        {NAV_LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium mb-1 transition-colors ${
              pathname === href || pathname.startsWith(href + '/')
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <Separator className="mb-4" />
        <p className="text-xs text-slate-500 mb-3 truncate px-1">{userEmail}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 z-10">
        {navContent}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-10">
        <p className="text-sm font-semibold">eResource Admin</p>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          className="p-2 rounded-md hover:bg-slate-100"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
            <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
            <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
          </svg>
        </button>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-60 bg-white flex flex-col shadow-xl">
            {navContent}
          </aside>
        </div>
      )}
    </>
  )
}

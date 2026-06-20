'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface HeaderProps {
  activeCategory?: string
}

export function Header({ activeCategory }: HeaderProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    const params = new URLSearchParams({ q })
    if (activeCategory) params.set('category', activeCategory)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <header className="sticky top-0 z-10 bg-hero shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 flex items-center gap-4">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight flex-shrink-0 min-w-0 text-[oklch(0.97_0.008_60)]"
        >
          eResource
        </Link>
        <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-xl">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="w-full bg-white border-[oklch(0.90_0.010_40)] placeholder:text-[oklch(0.60_0.008_40)]"
          />
        </form>
      </div>
    </header>
  )
}

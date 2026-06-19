'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

export function Header() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-6">
        <Link href="/" className="text-lg font-semibold tracking-tight flex-shrink-0">
          eResource
        </Link>
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search resources…"
            className="w-full"
          />
        </form>
      </div>
    </header>
  )
}

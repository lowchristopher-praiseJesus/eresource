import { db } from '@/lib/db'
import { ResourceCard } from '@/components/public/resource-card'
import { TopicToc } from '@/components/public/topic-toc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Film, Music, FileText, Image as ImageIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'eResource' }

export const dynamic = 'force-dynamic'

const CATEGORY_TILES = [
  {
    label: 'Videos',
    href: '/videos',
    description: 'Sermons, lectures, worship',
    Icon: Film,
    bg: 'bg-blue-50',
    color: 'text-blue-500',
  },
  {
    label: 'Audio',
    href: '/audio',
    description: 'Podcasts, music, recordings',
    Icon: Music,
    bg: 'bg-purple-50',
    color: 'text-purple-500',
  },
  {
    label: 'Documents',
    href: '/documents',
    description: 'PDFs, study materials, notes',
    Icon: FileText,
    bg: 'bg-amber-50',
    color: 'text-amber-500',
  },
  {
    label: 'Pictures',
    href: '/pictures',
    description: 'Photos, graphics, artwork',
    Icon: ImageIcon,
    bg: 'bg-green-50',
    color: 'text-green-500',
  },
] as const

export default async function HomePage() {
  const [pinned, recent, topics] = await Promise.all([
    db.resource.findMany({
      where: { isPinned: true },
      orderBy: { pinnedOrder: 'asc' },
      take: 6,
    }),
    db.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    db.topic.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { resources: true } } },
    }),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Hero */}
      <section className="text-center py-16">
        <h1 className="text-5xl font-bold tracking-tight">eResource</h1>
        <p className="mt-3 text-lg text-slate-600">
          Your ministry's digital resource library
        </p>
        <form action="/search" method="get" className="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <Input name="q" placeholder="Search resources…" className="flex-1" />
          <Button type="submit" className="sm:w-auto">Search</Button>
        </form>
      </section>

      {/* Table of Contents */}
      <TopicToc topics={topics} />

      {/* Featured (only if any pinned resources exist) */}
      {pinned.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pinned.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Category */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORY_TILES.map(({ label, href, description, Icon, bg, color }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col items-center text-center gap-2"
            >
              <div className={`p-3 rounded-full ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <span className="font-medium text-sm">{label}</span>
              <span className="text-xs text-slate-600">{description}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Added */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Recently Added</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recent.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

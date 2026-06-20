import { db } from '@/lib/db'
import { ResourceCard } from '@/components/public/resource-card'
import { TopicToc } from '@/components/public/topic-toc'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Film, Music, FileText, Image as ImageIcon, Search } from 'lucide-react'
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
    <>
      {/* Hero — full-width burgundy, flows seamlessly from header */}
      <section className="bg-hero text-center py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <p className="text-lg text-[oklch(0.80_0.01_15)]">
            Your ministry&apos;s digital resource library
          </p>
          <form
            action="/search"
            method="get"
            className="mt-10 max-w-2xl mx-auto flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[oklch(0.60_0.008_40)] pointer-events-none" />
              <Input
                name="q"
                placeholder="Search resources…"
                className="w-full pl-9 bg-white border-[oklch(0.90_0.010_40)] placeholder:text-[oklch(0.60_0.008_40)]"
              />
            </div>
            <Button type="submit" className="sm:w-auto">Search</Button>
          </form>
        </div>
      </section>

      {/* Body content — warm cream background from global tokens */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Table of Contents */}
        <TopicToc topics={topics} />

        {/* Featured — gold ornament marks this as the highlight section */}
        {pinned.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-5">
              <span className="text-[oklch(0.74_0.13_75)] mr-2" aria-hidden="true">✦</span>
              Featured
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {pinned.map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>
        )}

        {/* Browse by Category */}
        <section>
          <h2 className="text-2xl font-semibold mb-5">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORY_TILES.map(({ label, href, description, Icon, bg, color }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-[oklch(0.90_0.010_40)] p-6 hover:border-[oklch(0.85_0.015_40)] hover:shadow-md hover:scale-[1.02] transition-all duration-150 flex flex-col items-center text-center gap-2"
              >
                <div className={`p-3 rounded-full ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <span className="font-semibold text-sm">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Added */}
        {recent.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold mb-5">Recently Added</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recent.map(r => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}

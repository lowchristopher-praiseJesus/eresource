import { db } from '@/lib/db'
import { type Resource, Prisma } from '@prisma/client'
import { ResourceCard } from '@/components/public/resource-card'
import { CategoryFilter } from '@/components/public/category-filter'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Search' }

const VALID_CATEGORIES = ['VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE'] as const
type ValidCategory = typeof VALID_CATEGORIES[number]

const CATEGORY_LINKS = [
  { label: 'Videos', href: '/videos' },
  { label: 'Audio', href: '/audio' },
  { label: 'Documents', href: '/documents' },
  { label: 'Pictures', href: '/pictures' },
] as const

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>
}) {
  const { q, category } = await searchParams
  const query = q?.trim() ?? ''
  const categoryParam: ValidCategory | null = VALID_CATEGORIES.includes(
    category as ValidCategory
  )
    ? (category as ValidCategory)
    : null

  let results: Resource[] = []

  if (query) {
    try {
      const raw = await db.$queryRaw<Resource[]>(
        Prisma.sql`
          SELECT id, name, description, tags, category, "resourceType", "fileKey",
                 "youtubeUrl", "mimeType", "fileSizeBytes", "isPinned", "pinnedOrder",
                 "likeCount", "createdAt", "updatedAt"
          FROM "Resource"
          WHERE search_vector @@ plainto_tsquery('english', ${query})
          ORDER BY ts_rank(search_vector, plainto_tsquery('english', ${query})) DESC
          LIMIT 50
        `
      )
      results = categoryParam ? raw.filter(r => r.category === categoryParam) : raw
    } catch {
      const fallback = await db.resource.findMany({
        where: { name: { contains: query, mode: 'insensitive' } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      results = categoryParam
        ? fallback.filter(r => r.category === categoryParam)
        : fallback
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          {query && (
            <p className="text-sm text-slate-500 mt-1">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <CategoryFilter currentCategory={categoryParam ?? 'all'} />
      </div>

      {!query && (
        <p className="text-slate-500">Enter a search term to find resources.</p>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">No results for &quot;{query}&quot;</p>
          <p className="text-slate-400 mt-2">Try browsing by category</p>
          <div className="flex gap-3 justify-center mt-4">
            {CATEGORY_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 rounded border border-slate-200 text-sm hover:bg-slate-50 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map(r => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}

export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { type Resource, Prisma } from '@prisma/client'
import { ResourceCard } from '@/components/public/resource-card'
import { CategoryFilter } from '@/components/public/category-filter'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  return { title: query ? `Results for "${query}"` : 'Search' }
}

const VALID_CATEGORIES = ['VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE'] as const
type ValidCategory = typeof VALID_CATEGORIES[number]
const LIMIT = 24

const CATEGORY_LINKS = [
  { label: 'Videos', href: '/videos' },
  { label: 'Audio', href: '/audio' },
  { label: 'Documents', href: '/documents' },
  { label: 'Pictures', href: '/pictures' },
] as const

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>
}) {
  const { q, category, page: pageStr } = await searchParams
  const query = q?.trim() ?? ''
  const categoryParam: ValidCategory | null = VALID_CATEGORIES.includes(
    category as ValidCategory
  )
    ? (category as ValidCategory)
    : null

  const parsedPage = parseInt(pageStr ?? '1', 10)
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage)

  let results: Resource[] = []
  let total = 0

  if (query) {
    try {
      const categoryClause = categoryParam
        ? Prisma.sql`AND category = ${categoryParam}::"Category"`
        : Prisma.sql``

      const [rows, countRows] = await Promise.all([
        db.$queryRaw<Resource[]>(
          Prisma.sql`
            SELECT id, name, description, tags, category, "resourceType", "fileKey",
                   "youtubeUrl", "mimeType", "fileSizeBytes", "isPinned", "pinnedOrder",
                   "likeCount", "createdAt", "updatedAt"
            FROM "Resource"
            WHERE search_vector @@ plainto_tsquery('english', ${query})
            ${categoryClause}
            ORDER BY ts_rank(search_vector, plainto_tsquery('english', ${query})) DESC
            LIMIT ${LIMIT} OFFSET ${(page - 1) * LIMIT}
          `
        ),
        db.$queryRaw<[{ count: bigint }]>(
          Prisma.sql`
            SELECT COUNT(*) as count
            FROM "Resource"
            WHERE search_vector @@ plainto_tsquery('english', ${query})
            ${categoryClause}
          `
        ),
      ])
      results = rows
      total = Number(countRows[0]?.count ?? 0)
    } catch {
      const where = {
        name: { contains: query, mode: 'insensitive' as const },
        ...(categoryParam ? { category: categoryParam } : {}),
      }
      const [fallback, count] = await Promise.all([
        db.resource.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * LIMIT,
          take: LIMIT,
        }),
        db.resource.count({ where }),
      ])
      results = fallback
      total = count
    }
  }

  const totalPages = Math.ceil(total / LIMIT)

  function pageUrl(p: number): string {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (categoryParam) params.set('category', categoryParam)
    if (p > 1) params.set('page', String(p))
    return `/search?${params.toString()}`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          {query && (
            <p className="text-sm text-slate-600 mt-1">
              {total} result{total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <CategoryFilter currentCategory={categoryParam ?? 'all'} currentQuery={query} />
      </div>

      {!query && (
        <p className="text-slate-500">Enter a search term to find resources.</p>
      )}

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-600 text-lg">No results for &quot;{query}&quot;</p>
          <p className="text-slate-600 mt-2">Try browsing by category</p>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              {page > 1 ? (
                <Link
                  href={pageUrl(page - 1)}
                  className="px-4 py-2 rounded border border-slate-200 text-sm hover:bg-slate-50 transition-colors"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="px-4 py-2 rounded border border-slate-100 text-sm text-slate-300">
                  ← Previous
                </span>
              )}
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageUrl(page + 1)}
                  className="px-4 py-2 rounded border border-slate-200 text-sm hover:bg-slate-50 transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-4 py-2 rounded border border-slate-100 text-sm text-slate-300">
                  Next →
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

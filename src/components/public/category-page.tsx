import { type Category } from '@prisma/client'
import { db } from '@/lib/db'
import { ResourceCard } from '@/components/public/resource-card'
import { SortSelector } from '@/components/public/sort-selector'
import Link from 'next/link'

const CATEGORY_DISPLAY: Record<Category, string> = {
  VIDEO: 'Videos',
  AUDIO: 'Audio',
  DOCUMENT: 'Documents',
  PICTURE: 'Pictures',
}

const SORT_OPTIONS = {
  newest: { createdAt: 'desc' as const },
  oldest: { createdAt: 'asc' as const },
  liked:  { likeCount: 'desc' as const },
}

type SortKey = keyof typeof SORT_OPTIONS
const VALID_SORTS = ['newest', 'oldest', 'liked'] as const

function parseSortParam(s: string | undefined): SortKey {
  return (VALID_SORTS as readonly string[]).includes(s ?? '') ? (s as SortKey) : 'newest'
}

const LIMIT = 24

function pageUrl(page: number, sort: string): string {
  const params = new URLSearchParams({ page: String(page) })
  if (sort !== 'newest') params.set('sort', sort)
  return `?${params.toString()}`
}

interface CategoryPageProps {
  category: Category
  searchParams: Promise<{ page?: string; sort?: string }>
}

export async function CategoryPage({ category, searchParams }: CategoryPageProps) {
  const { page: pageStr, sort: sortStr } = await searchParams

  const parsedPage = parseInt(pageStr ?? '1', 10)
  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage)
  const sort = parseSortParam(sortStr)

  const [resources, total] = await Promise.all([
    db.resource.findMany({
      where: { category },
      orderBy: SORT_OPTIONS[sort],
      skip: (page - 1) * LIMIT,
      take: LIMIT,
    }),
    db.resource.count({ where: { category } }),
  ])

  const totalPages = Math.ceil(total / LIMIT)
  const label = CATEGORY_DISPLAY[category]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="text-sm text-slate-500 mt-1">
            {total} resource{total !== 1 ? 's' : ''}
          </p>
        </div>
        <SortSelector currentSort={sort} />
      </div>

      {resources.length === 0 ? (
        <p className="text-slate-500 py-16 text-center">No {label.toLowerCase()} resources yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {resources.map(r => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={pageUrl(page - 1, sort)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={pageUrl(page + 1, sort)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm hover:bg-slate-50 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

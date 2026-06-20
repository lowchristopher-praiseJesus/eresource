import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { ResourceTable } from '@/components/admin/resource-table'
import type { Category } from '@prisma/client'

const VALID_CATEGORIES: Category[] = ['VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE']

interface Props {
  searchParams: Promise<{ page?: string; category?: string; search?: string }>
}

export default async function ResourcesPage({ searchParams }: Props) {
  const { page: pageStr, category, search } = await searchParams

  const parsed = parseInt(pageStr ?? '1', 10)
  const page = Math.max(1, isNaN(parsed) ? 1 : parsed)
  const limit = 20

  const validCategory = category && (VALID_CATEGORIES as string[]).includes(category)
    ? category as Category
    : undefined

  const where = {
    ...(validCategory ? { category: validCategory } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [resources, total, pinnedCount] = await Promise.all([
    db.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.resource.count({ where }),
    db.resource.count({ where: { isPinned: true } }),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Resources</h1>
        <Button render={<Link href="/admin/resources/new" />}>
          Add Resource
        </Button>
      </div>

      <ResourceTable
        resources={resources}
        total={total}
        page={page}
        totalPages={Math.ceil(total / limit)}
        currentCategory={validCategory}
        currentSearch={search}
        pinnedCount={pinnedCount}
      />
    </div>
  )
}

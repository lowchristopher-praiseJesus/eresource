import Link from 'next/link'
import { db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Category } from '@prisma/client'

const CATEGORY_LABELS: Record<Category, string> = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  PICTURE: 'Picture',
}

const ALL_CATEGORIES: Category[] = ['VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE']

export default async function DashboardPage() {
  const [total, categoryCounts, recent] = await Promise.all([
    db.resource.count(),
    db.resource.groupBy({ by: ['category'], _count: { _all: true } }),
    db.resource.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ])

  const countMap: Partial<Record<Category, number>> = {}
  for (const row of categoryCounts) {
    countMap[row.category] = row._count._all
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{total}</p>
          </CardContent>
        </Card>
        {ALL_CATEGORIES.map(cat => (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {CATEGORY_LABELS[cat]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{countMap[cat] ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recently added */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recently Added</h2>
        <Button render={<Link href="/admin/resources" />} variant="outline" size="sm">
          View all
        </Button>
      </div>

      <div className="rounded-md border divide-y">
        {recent.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-slate-500">No resources yet</p>
            <Button render={<Link href="/admin/resources/new" />} className="mt-3" size="sm">
              Add your first resource
            </Button>
          </div>
        ) : recent.map(resource => (
          <div key={resource.id} className="flex items-center gap-4 p-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{resource.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {new Date(resource.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            <Badge variant="secondary" className="flex-shrink-0">
              {CATEGORY_LABELS[resource.category]}
            </Badge>
            <Button
              render={<Link href={`/admin/resources/${resource.id}/edit`} />}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              Edit
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

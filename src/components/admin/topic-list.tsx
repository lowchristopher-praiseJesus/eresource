'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface TopicRow {
  id: string
  name: string
  slug: string
  order: number
  _count: { resources: number }
}

interface TopicListProps {
  topics: TopicRow[]
}

export function TopicList({ topics }: TopicListProps) {
  const router = useRouter()

  async function move(id: string, direction: 'up' | 'down') {
    const idx = topics.findIndex(t => t.id === id)
    const neighbor = direction === 'up' ? topics[idx - 1] : topics[idx + 1]
    if (!neighbor) return

    await fetch(`/api/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: neighbor.order }),
    })
    router.refresh()
  }

  async function handleDelete(id: string, name: string, resourceCount: number) {
    if (resourceCount > 0) return
    if (!window.confirm(`Delete topic "${name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 px-4 py-12 text-center text-slate-500">
        No topics yet. Add one to get started.
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left w-10">#</th>
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left hidden md:table-cell">Slug</th>
            <th className="px-4 py-3 text-right w-24">Resources</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {topics.map((topic, idx) => (
            <tr key={topic.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-400">{topic.order}</td>
              <td className="px-4 py-3 font-medium text-slate-800">{topic.name}</td>
              <td className="px-4 py-3 text-slate-400 font-mono text-xs hidden md:table-cell">
                {topic.slug}
              </td>
              <td className="px-4 py-3 text-right text-slate-500">{topic._count.resources}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => move(topic.id, 'up')}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={idx === topics.length - 1}
                    onClick={() => move(topic.id, 'down')}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/admin/topics/${topic.id}/edit`} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={topic._count.resources > 0}
                    title={
                      topic._count.resources > 0
                        ? 'Reassign resources first'
                        : undefined
                    }
                    onClick={() => handleDelete(topic.id, topic.name, topic._count.resources)}
                    className="text-red-500 hover:text-red-700 disabled:opacity-40"
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

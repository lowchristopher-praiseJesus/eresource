import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface Topic {
  id: string
  name: string
  slug: string
  order: number
  _count: { resources: number }
}

interface TopicTocProps {
  topics: Topic[]
}

export function TopicToc({ topics }: TopicTocProps) {
  if (topics.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Browse by Topic</h2>
      <div className="rounded-lg border border-slate-200 divide-y divide-slate-100">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.slug}`}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 w-5 text-right shrink-0">{topic.order}.</span>
              <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">
                {topic.name}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400">
                {topic._count.resources} {topic._count.resources === 1 ? 'resource' : 'resources'}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

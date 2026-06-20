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
      <h2 className="text-2xl font-semibold mb-5">Browse by Topic</h2>
      <div className="rounded-lg border border-[oklch(0.90_0.010_40)] divide-y divide-[oklch(0.93_0.008_40)]">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/topic/${topic.slug}`}
            className="flex items-center justify-between px-5 py-3.5 hover:bg-accent transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-primary font-medium w-5 text-right shrink-0">
                {topic.order}.
              </span>
              <span className="text-sm font-medium text-foreground">
                {topic.name}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-muted-foreground">
                {topic._count.resources} {topic._count.resources === 1 ? 'resource' : 'resources'}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

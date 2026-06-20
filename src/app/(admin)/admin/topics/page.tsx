import Link from 'next/link'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { TopicList } from '@/components/admin/topic-list'

export default async function TopicsPage() {
  const topics = await db.topic.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { resources: true } } },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Topics</h1>
        <Button render={<Link href="/admin/topics/new" />}>
          Add Topic
        </Button>
      </div>
      <TopicList topics={topics} />
    </div>
  )
}

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { TopicForm } from '@/components/admin/topic-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditTopicPage({ params }: Props) {
  const { id } = await params
  const topic = await db.topic.findUnique({ where: { id } })
  if (!topic) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">Edit Topic</h1>
      <TopicForm topic={topic} />
    </div>
  )
}

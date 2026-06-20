import { db } from '@/lib/db'
import { NewResourceForm } from '@/components/admin/new-resource-form'

export default async function NewResourcePage() {
  const allTopics = await db.topic.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Add Resource</h1>
      <NewResourceForm allTopics={allTopics} />
    </div>
  )
}

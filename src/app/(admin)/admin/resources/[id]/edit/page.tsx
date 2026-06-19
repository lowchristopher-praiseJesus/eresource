import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { EditResourceForm } from '@/components/admin/edit-resource-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditResourcePage({ params }: Props) {
  const { id } = await params
  const resource = await db.resource.findUnique({ where: { id } })
  if (!resource) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Edit Resource</h1>
      <EditResourceForm resource={resource} />
    </div>
  )
}

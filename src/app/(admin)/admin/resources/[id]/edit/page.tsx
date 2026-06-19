export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Edit Resource: {id}</h1>
    </main>
  )
}

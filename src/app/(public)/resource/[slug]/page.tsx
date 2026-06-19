export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Resource: {slug}</h1>
    </main>
  )
}

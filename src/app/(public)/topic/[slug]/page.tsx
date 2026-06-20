import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { ResourceCard } from '@/components/public/resource-card'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const topic = await db.topic.findUnique({ where: { slug } })
  return { title: topic ? `${topic.name} — eResource` : 'Topic — eResource' }
}

export const dynamic = 'force-dynamic'

export default async function TopicPage({ params }: Props) {
  const { slug } = await params
  const topic = await db.topic.findUnique({
    where: { slug },
    include: {
      resources: {
        include: { resource: true },
        orderBy: { resource: { createdAt: 'desc' } },
      },
    },
  })
  if (!topic) notFound()

  const resources = topic.resources.map((rt) => rt.resource)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mt-2">{topic.name}</h1>
      {topic.description && (
        <p className="mt-2 text-slate-600">{topic.description}</p>
      )}
      <p className="mt-1 text-sm text-slate-400">
        {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
      </p>

      {resources.length === 0 ? (
        <p className="mt-12 text-center text-slate-500">
          No resources have been added to this topic yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} backHref={`/topic/${slug}`} />
          ))}
        </div>
      )}
    </div>
  )
}

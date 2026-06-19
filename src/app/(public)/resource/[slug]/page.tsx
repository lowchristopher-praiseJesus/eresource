import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MediaPlayer } from '@/components/public/media-player'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Metadata } from 'next'

const CATEGORY_LABELS = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  PICTURE: 'Picture',
} as const

const CATEGORY_HREFS = {
  VIDEO: '/videos',
  AUDIO: '/audio',
  DOCUMENT: '/documents',
  PICTURE: '/pictures',
} as const

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).slug.split('-')[0]
  const resource = await db.resource.findUnique({ where: { id } })
  return { title: resource?.name ?? 'Resource' }
}

export default async function ResourcePage({ params }: Props) {
  const { slug } = await params
  const id = slug.split('-')[0]
  const resource = await db.resource.findUnique({ where: { id } })
  if (!resource) notFound()

  const categoryLabel = CATEGORY_LABELS[resource.category]
  const categoryHref = CATEGORY_HREFS[resource.category]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link href={categoryHref} className="hover:text-slate-900 transition-colors">
          {categoryLabel}
        </Link>
        <span className="mx-2">›</span>
        <span className="text-slate-900">{resource.name}</span>
      </nav>

      {/* Media */}
      <MediaPlayer resource={resource} />

      {/* Metadata */}
      <div className="mt-8 space-y-4">
        <h1 className="text-3xl font-semibold">{resource.name}</h1>
        {resource.description && (
          <p className="text-slate-600 leading-relaxed">{resource.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{categoryLabel}</Badge>
          {resource.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-400 pt-2 border-t border-slate-100">
          <span>♥ {resource.likeCount}</span>
          <span>
            {new Date(resource.createdAt).toLocaleDateString('en-SG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  )
}

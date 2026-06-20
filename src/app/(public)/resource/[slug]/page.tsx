export const revalidate = 300 // 5-minute ISR — allows BFCache so media playback isn't interrupted

import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { MediaPlayer } from '@/components/public/media-player'
import { Badge } from '@/components/ui/badge'
import { LikeButton } from '@/components/public/like-button'
import { DownloadButton } from '@/components/public/download-button'
import { CopyLinkButton } from '@/components/public/copy-link-button'
import { ResourceCard } from '@/components/public/resource-card'
import { getFileUrl } from '@/lib/utils'
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

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ from?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).slug.split('-')[0]
  const resource = await db.resource.findUnique({ where: { id } })
  return { title: resource?.name ?? 'Resource' }
}

export default async function ResourcePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { from } = await searchParams
  const id = slug.split('-')[0]

  const resource = await db.resource.findUnique({ where: { id } })
  if (!resource) notFound()

  const [relatedResources, backTopic] = await Promise.all([
    db.resource.findMany({
      where: { category: resource.category, id: { not: id } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    from?.startsWith('/topic/')
      ? db.topic.findUnique({ where: { slug: from.slice('/topic/'.length) } })
      : null,
  ])

  const categoryLabel = CATEGORY_LABELS[resource.category]
  const categoryHref = CATEGORY_HREFS[resource.category]
  const backHref = backTopic ? from! : categoryHref
  const backLabel = backTopic ? backTopic.name : categoryLabel
  const isFile = resource.resourceType !== 'YOUTUBE'
  const fileUrl = resource.fileKey ? getFileUrl(resource.fileKey) : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6">
        <Link href={backHref} className="hover:text-slate-900 transition-colors">
          {backLabel}
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

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <LikeButton resourceId={resource.id} initialCount={resource.likeCount} />
          {isFile && fileUrl && (
            <DownloadButton fileUrl={fileUrl} name={resource.name} />
          )}
          <CopyLinkButton />
        </div>

        <div className="text-sm text-slate-600 pt-2 border-t border-slate-100">
          {new Date(resource.createdAt).toLocaleDateString('en-SG', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>

      {/* Related resources */}
      {relatedResources.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">More {categoryLabel} resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedResources.map(r => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

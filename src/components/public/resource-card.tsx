import Link from 'next/link'
import { type Resource } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Film, Music, FileText, Image as ImageIcon, Heart } from 'lucide-react'
import { getFileUrl, slugify } from '@/lib/utils'

function resourceUrl(resource: Resource): string {
  return `/resource/${resource.id}-${slugify(resource.name)}`
}

function youtubeThumbUrl(url: string): string {
  const id = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1] ?? ''
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`
}

const CATEGORY_ICONS = {
  VIDEO:    { Icon: Film,      bg: 'bg-blue-50',   color: 'text-blue-500' },
  AUDIO:    { Icon: Music,     bg: 'bg-purple-50', color: 'text-purple-500' },
  DOCUMENT: { Icon: FileText,  bg: 'bg-amber-50',  color: 'text-amber-500' },
  PICTURE:  { Icon: ImageIcon, bg: 'bg-green-50',  color: 'text-green-500' },
} as const

const CATEGORY_LABELS = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  PICTURE: 'Picture',
} as const

export function ResourceCard({ resource }: { resource: Resource }) {
  const { Icon, bg, color } = CATEGORY_ICONS[resource.category]
  const extraTags = resource.tags.length > 3 ? resource.tags.length - 3 : 0

  return (
    <Link
      href={resourceUrl(resource)}
      className="group block rounded-lg border border-[oklch(0.90_0.010_40)] overflow-hidden hover:border-[oklch(0.85_0.015_40)] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-150"
    >
      {/* Thumbnail */}
      <div className={`h-40 flex items-center justify-center ${bg} relative overflow-hidden`}>
        {resource.category === 'PICTURE' && resource.fileKey ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getFileUrl(resource.fileKey)}
            alt={resource.name}
            className="object-cover w-full h-full"
          />
        ) : resource.resourceType === 'YOUTUBE' && resource.youtubeUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youtubeThumbUrl(resource.youtubeUrl)}
            alt={resource.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <Icon className={`h-12 w-12 ${color}`} />
        )}
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        <p className="font-semibold text-sm line-clamp-2">{resource.name}</p>
        {resource.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{resource.description}</p>
        )}
        <div>
          <Badge variant="secondary">{CATEGORY_LABELS[resource.category]}</Badge>
        </div>
        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                +{extraTags}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-[oklch(0.74_0.13_75)]" fill="currentColor" />
            {resource.likeCount}
          </span>
          <span>
            {new Date(resource.createdAt).toLocaleDateString('en-SG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  )
}

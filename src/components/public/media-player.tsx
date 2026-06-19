'use client'

import { type Resource } from '@prisma/client'
import { getFileUrl } from '@/lib/utils'
import { FileText } from 'lucide-react'

function extractYoutubeId(url: string): string | null {
  return url.match(/(?:v=|youtu\.be\/)([^&\s]+)/)?.[1] ?? null
}

export function MediaPlayer({ resource }: { resource: Resource }) {
  const { resourceType, mimeType, fileKey, name, youtubeUrl } = resource

  if (resourceType === 'YOUTUBE' && youtubeUrl) {
    const videoId = extractYoutubeId(youtubeUrl)
    if (!videoId) return null
    return (
      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={name}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          className="w-full h-full"
        />
      </div>
    )
  }

  if (!fileKey) return null
  const src = getFileUrl(fileKey)

  if (mimeType?.startsWith('video/')) {
    return (
      <video controls src={src} className="w-full rounded-lg bg-black" />
    )
  }

  if (mimeType?.startsWith('audio/')) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
        <audio controls src={src} className="w-full" />
      </div>
    )
  }

  if (mimeType === 'application/pdf') {
    return (
      <iframe
        src={src}
        title={name}
        className="w-full h-[80vh] rounded-lg border border-slate-200"
      />
    )
  }

  if (mimeType?.startsWith('image/')) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} className="max-w-full mx-auto rounded-lg" />
    )
  }

  // Fallback: TXT, DOCX, DOC — download button added in M5
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-lg border border-slate-200 bg-slate-50">
      <FileText className="h-12 w-12 text-slate-400" />
      <p className="text-sm text-slate-500">Download to view this file</p>
    </div>
  )
}

import type { Category } from '@prisma/client'

const MIME_TO_CATEGORY: Record<string, Category> = {
  'video/mp4': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'audio/mpeg': 'AUDIO',
  'audio/wav': 'AUDIO',
  'audio/aac': 'AUDIO',
  'audio/ogg': 'AUDIO',
  'application/pdf': 'DOCUMENT',
  'text/plain': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'image/jpeg': 'PICTURE',
  'image/png': 'PICTURE',
  'image/gif': 'PICTURE',
  'image/webp': 'PICTURE',
}

export function categoryFromMime(mimeType: string): Category | null {
  return MIME_TO_CATEGORY[mimeType] ?? null
}

export function isValidYoutubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/.test(url)
}

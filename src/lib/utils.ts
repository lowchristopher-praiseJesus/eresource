import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getFileUrl(key: string): string {
  // In development, files are served from /public so use a relative URL.
  // Absolute localhost URLs break when the server is accessed from a mobile
  // device on the same network (localhost resolves to the device, not the server).
  if (process.env.NODE_ENV === 'development') {
    return `/${key}`
  }
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function getFileUrl(key: string): string {
  return `${process.env.R2_PUBLIC_URL}/${key}`
}

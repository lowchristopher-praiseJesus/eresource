import { headers } from 'next/headers'
import { Header } from '@/components/public/header'

const CATEGORY_MAP: Record<string, string> = {
  '/videos':    'VIDEO',
  '/audio':     'AUDIO',
  '/documents': 'DOCUMENT',
  '/pictures':  'PICTURE',
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const activeCategory = CATEGORY_MAP[pathname] ?? undefined

  return (
    <>
      <Header activeCategory={activeCategory} />
      <main>{children}</main>
    </>
  )
}

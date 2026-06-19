import { CategoryPage } from '@/components/public/category-page'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Pictures' }

export default function PicturesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  return <CategoryPage category="PICTURE" searchParams={searchParams} />
}

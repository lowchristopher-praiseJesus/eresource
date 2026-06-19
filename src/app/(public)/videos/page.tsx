import { CategoryPage } from '@/components/public/category-page'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Videos' }

export default function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  return <CategoryPage category="VIDEO" searchParams={searchParams} />
}

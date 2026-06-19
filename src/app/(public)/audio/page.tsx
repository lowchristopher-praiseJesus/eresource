import { CategoryPage } from '@/components/public/category-page'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Audio' }

export default function AudioPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  return <CategoryPage category="AUDIO" searchParams={searchParams} />
}

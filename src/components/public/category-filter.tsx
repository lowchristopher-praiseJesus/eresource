'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function CategoryFilter({ currentCategory }: { currentCategory: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleChange(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={currentCategory} onValueChange={handleChange}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        <SelectItem value="VIDEO">Videos</SelectItem>
        <SelectItem value="AUDIO">Audio</SelectItem>
        <SelectItem value="DOCUMENT">Documents</SelectItem>
        <SelectItem value="PICTURE">Pictures</SelectItem>
      </SelectContent>
    </Select>
  )
}

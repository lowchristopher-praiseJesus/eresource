'use client'

import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CategoryFilterProps {
  currentCategory: string
  currentQuery: string
}

export function CategoryFilter({ currentCategory, currentQuery }: CategoryFilterProps) {
  const router = useRouter()

  function handleChange(value: string | null) {
    const params = new URLSearchParams()
    if (currentQuery) params.set('q', currentQuery)
    if (value && value !== 'all') params.set('category', value)
    router.push(`/search?${params.toString()}`)
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

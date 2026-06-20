'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Resource, Category } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { DeleteDialog } from '@/components/admin/delete-dialog'

const CATEGORY_LABELS: Record<Category, string> = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  PICTURE: 'Picture',
}

interface ResourceTableProps {
  resources: Resource[]
  total: number
  page: number
  totalPages: number
  currentCategory?: string
  currentSearch?: string
  pinnedCount: number
}

export function ResourceTable({
  resources, total, page, totalPages, currentCategory, currentSearch, pinnedCount,
}: ResourceTableProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [searchValue, setSearchValue] = useState(currentSearch ?? '')
  const [pinningId, setPinningId] = useState<string | null>(null)

  function buildUrl(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    if (currentCategory) params.set('category', currentCategory)
    if (searchValue) params.set('search', searchValue)
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined) params.set(k, v)
      else params.delete(k)
    })
    return `/admin/resources?${params.toString()}`
  }

  function handleCategoryChange(value: string | null) {
    const params = new URLSearchParams()
    if (value && value !== 'all') params.set('category', value)
    if (searchValue) params.set('search', searchValue)
    router.push(`/admin/resources?${params.toString()}`)
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const params = new URLSearchParams()
      if (currentCategory) params.set('category', currentCategory)
      if (searchValue) params.set('search', searchValue)
      router.push(`/admin/resources?${params.toString()}`)
    }
  }

  async function togglePin(resource: Resource) {
    const isPinning = !resource.isPinned
    const body: Record<string, unknown> = { isPinned: isPinning }
    await fetch(`/api/resources/${resource.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    router.refresh()
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search by name… (press Enter)"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="max-w-xs"
        />
        <Select value={currentCategory ?? 'all'} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="VIDEO">Video</SelectItem>
            <SelectItem value="AUDIO">Audio</SelectItem>
            <SelectItem value="DOCUMENT">Document</SelectItem>
            <SelectItem value="PICTURE">Picture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-slate-500 mb-3">
        {total} resource{total !== 1 ? 's' : ''}
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Likes</TableHead>
              <TableHead>Pinned</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-10">
                  No resources found
                </TableCell>
              </TableRow>
            ) : resources.map(resource => (
              <TableRow key={resource.id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {resource.name}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{CATEGORY_LABELS[resource.category]}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                    {resource.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs font-normal">
                        +{resource.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{resource.likeCount}</TableCell>
                <TableCell>{resource.isPinned ? '📌' : '—'}</TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {new Date(resource.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pinningId === resource.id || (!resource.isPinned && pinnedCount >= 6)}
                      title={!resource.isPinned && pinnedCount >= 6 ? 'Max 6 pinned' : undefined}
                      onClick={async () => {
                        setPinningId(resource.id)
                        await togglePin(resource)
                        setPinningId(null)
                      }}
                    >
                      {resource.isPinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button variant="outline" size="sm" render={<Link href={`/admin/resources/${resource.id}/edit`} />}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget({ id: resource.id, name: resource.name })}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => router.push(buildUrl({ page: String(page - 1) }))}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => router.push(buildUrl({ page: String(page + 1) }))}
          >
            Next
          </Button>
        </div>
      )}

      {deleteTarget && (
        <DeleteDialog
          resourceId={deleteTarget.id}
          resourceName={deleteTarget.name}
          open={true}
          onOpenChange={open => { if (!open) setDeleteTarget(null) }}
        />
      )}
    </>
  )
}

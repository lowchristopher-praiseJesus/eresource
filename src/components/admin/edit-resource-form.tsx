'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ResourceForm } from '@/components/admin/resource-form'
import type { Resource, Category } from '@prisma/client'

interface EditResourceFormProps {
  resource: Resource
}

export function EditResourceForm({ resource }: EditResourceFormProps) {
  const router = useRouter()
  const [name, setName] = useState(resource.name)
  const [description, setDescription] = useState(resource.description ?? '')
  const [tagsInput, setTagsInput] = useState(resource.tags.join(', '))
  const [category, setCategory] = useState<Category | ''>(resource.category)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) { setError('Name is required'); return }
    if (!category) { setError('Category is required'); return }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 20)

    setSubmitting(true)
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          tags,
          category,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Failed to update')
      }
      router.push('/admin/resources')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 p-3 bg-slate-50 rounded-md">
          <p className="text-xs text-slate-500">
            {resource.resourceType === 'YOUTUBE'
              ? `YouTube URL: ${resource.youtubeUrl}`
              : `File: ${resource.fileKey}`}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            The file or URL cannot be changed. Delete and re-add to replace.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ResourceForm
            name={name}
            description={description}
            tagsInput={tagsInput}
            category={category}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTagsInputChange={setTagsInput}
            onCategoryChange={setCategory}
            disabled={submitting}
          />

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/resources')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

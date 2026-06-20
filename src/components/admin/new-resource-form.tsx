'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { UploadZone, type UploadResult } from '@/components/admin/upload-zone'
import { YoutubeInput } from '@/components/admin/youtube-input'
import { ResourceForm } from '@/components/admin/resource-form'
import { categoryFromMime } from '@/lib/category'
import type { Category } from '@prisma/client'

type Mode = 'file' | 'youtube'

interface NewResourceFormProps {
  allTopics: { id: string; name: string }[]
}

export function NewResourceForm({ allTopics }: NewResourceFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('file')
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleModeChange(newMode: Mode) {
    setMode(newMode)
    setUploadResult(null)
    setYoutubeUrl('')
  }

  function handleUploadComplete(result: UploadResult) {
    setUploadResult(result)
    const detected = categoryFromMime(result.mimeType)
    if (detected && !category) setCategory(detected)
  }

  function handleTitleFetched(title: string) {
    if (!name) setName(title)
    if (!category) setCategory('VIDEO')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!name.trim()) { setSubmitError('Name is required'); return }
    if (!category) { setSubmitError('Category is required'); return }
    if (mode === 'file' && !uploadResult) { setSubmitError('Please upload a file first'); return }
    if (mode === 'youtube' && !youtubeUrl) { setSubmitError('Please enter a YouTube URL'); return }

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean).slice(0, 20)

    setSubmitting(true)
    try {
      const body = mode === 'file'
        ? {
            resourceType: 'FILE',
            fileKey: uploadResult!.key,
            mimeType: uploadResult!.mimeType,
            fileSizeBytes: uploadResult!.fileSizeBytes,
            name: name.trim(),
            description: description.trim() || undefined,
            tags,
            category,
            topicIds: selectedTopicIds,
          }
        : {
            resourceType: 'YOUTUBE',
            youtubeUrl,
            name: name.trim(),
            description: description.trim() || undefined,
            tags,
            category,
            topicIds: selectedTopicIds,
          }

      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Failed to save resource')
      }
      router.push('/admin/resources')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save resource')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === 'file' ? 'default' : 'outline'}
            onClick={() => handleModeChange('file')}
          >
            Upload File
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'youtube' ? 'default' : 'outline'}
            onClick={() => handleModeChange('youtube')}
          >
            Add YouTube URL
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'file' ? (
            <UploadZone onUploadComplete={handleUploadComplete} disabled={submitting} />
          ) : (
            <YoutubeInput
              url={youtubeUrl}
              onUrlChange={setYoutubeUrl}
              onTitleFetched={handleTitleFetched}
              disabled={submitting}
            />
          )}

          <ResourceForm
            name={name}
            description={description}
            tagsInput={tagsInput}
            category={category}
            allTopics={allTopics}
            selectedTopicIds={selectedTopicIds}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTagsInputChange={setTagsInput}
            onCategoryChange={setCategory}
            onTopicIdsChange={setSelectedTopicIds}
            disabled={submitting}
          />

          {submitError && (
            <p className="text-sm text-red-600" role="alert">{submitError}</p>
          )}

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
              {submitting ? 'Saving…' : 'Publish Resource'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

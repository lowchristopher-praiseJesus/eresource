'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { Topic } from '@prisma/client'

interface TopicFormProps {
  topic?: Topic
}

export function TopicForm({ topic }: TopicFormProps) {
  const router = useRouter()
  const [name, setName] = useState(topic?.name ?? '')
  const [description, setDescription] = useState(topic?.description ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Name is required'); return }

    setSubmitting(true)
    try {
      const url = topic ? `/api/topics/${topic.id}` : '/api/topics'
      const method = topic ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Failed to save topic')
      }
      router.push('/admin/topics')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save topic')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="topic-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="topic-name"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={100}
          disabled={submitting}
          placeholder="e.g. Spiritual Preparation"
        />
        <p className="text-xs text-slate-500 text-right">{name.length}/100</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="topic-description">Description</Label>
        <Textarea
          id="topic-description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={300}
          disabled={submitting}
          placeholder="Optional description shown in the TOC…"
          rows={3}
        />
        <p className="text-xs text-slate-500 text-right">{description.length}/300</p>
      </div>

      {topic && (
        <div className="space-y-2">
          <Label>URL Slug</Label>
          <Input value={topic.slug} readOnly className="bg-slate-50 text-slate-500" />
          <p className="text-xs text-slate-400">Slug is set on creation and cannot be changed.</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : topic ? 'Save Changes' : 'Create Topic'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/topics')}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}

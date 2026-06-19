'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { isValidYoutubeUrl } from '@/lib/category'

interface YoutubeInputProps {
  url: string
  onUrlChange: (url: string) => void
  onTitleFetched: (title: string) => void
  disabled?: boolean
}

export function YoutubeInput({ url, onUrlChange, onTitleFetched, disabled }: YoutubeInputProps) {
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const isValid = isValidYoutubeUrl(url)

  async function handleFetchTitle() {
    setFetchError('')
    setFetching(true)
    try {
      const res = await fetch(`/api/youtube-oembed?url=${encodeURIComponent(url)}`)
      if (!res.ok) throw new Error('Could not fetch title')
      const data = await res.json() as { title: string }
      onTitleFetched(data.title)
    } catch {
      setFetchError('Could not fetch title automatically — enter it manually below')
    } finally {
      setFetching(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="yt-url">YouTube URL</Label>
        <div className="flex gap-2">
          <Input
            id="yt-url"
            type="url"
            value={url}
            onChange={e => { onUrlChange(e.target.value); setFetchError('') }}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={disabled}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleFetchTitle}
            disabled={!isValid || fetching || !!disabled}
          >
            {fetching ? 'Fetching…' : 'Fetch Title'}
          </Button>
        </div>
        {url && !isValid && (
          <p className="text-xs text-red-600">
            Enter a valid YouTube URL (youtube.com/watch?v= or youtu.be/)
          </p>
        )}
        {fetchError && (
          <p className="text-xs text-amber-600">{fetchError}</p>
        )}
      </div>
    </div>
  )
}

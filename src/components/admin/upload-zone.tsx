'use client'

import { useRef, useState } from 'react'
import { Progress } from '@/components/ui/progress'

const ACCEPTED_TYPES = [
  'video/mp4', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg',
  'application/pdf', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
].join(',')

export interface UploadResult {
  key: string
  mimeType: string
  fileSizeBytes: number
}

interface UploadZoneProps {
  onUploadComplete: (result: UploadResult) => void
  disabled?: boolean
}

export function UploadZone({ onUploadComplete, disabled }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState('')
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError('')
    setFileName(file.name)
    setProgress(0)

    try {
      const presignRes = await fetch('/api/upload/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSizeBytes: file.size,
        }),
      })
      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({})) as { error?: string }
        throw new Error(err.error ?? 'Could not get upload URL')
      }
      const { url, key } = await presignRes.json() as { url: string; key: string }

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => (xhr.status === 200 ? resolve() : reject(new Error('Upload failed')))
        xhr.onerror = () => reject(new Error('Upload failed'))
        xhr.open('PUT', url)
        xhr.setRequestHeader('Content-Type', file.type)
        xhr.send(file)
      })

      setProgress(100)
      onUploadComplete({ key, mimeType: file.type, fileSizeBytes: file.size })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setProgress(null)
      setFileName('')
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload file"
        className={[
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
          dragging ? 'border-slate-500 bg-slate-50' : 'border-slate-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-slate-400',
        ].join(' ')}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file && !disabled) handleFile(file)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          disabled={disabled}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {fileName && progress === 100 ? (
          <div>
            <p className="text-sm font-medium text-green-700">Upload complete</p>
            <p className="text-xs text-slate-500 mt-1">{fileName}</p>
          </div>
        ) : fileName ? (
          <p className="text-sm text-slate-700">Uploading: <strong>{fileName}</strong></p>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700">Drag &amp; drop a file here</p>
            <p className="text-xs text-slate-500 mt-1">or click to browse</p>
            <p className="text-xs text-slate-400 mt-2">MP4, MP3, PDF, PNG, and more · up to 500 MB</p>
          </>
        )}
      </div>

      {progress !== null && progress < 100 && (
        <div className="space-y-1">
          <Progress value={progress} />
          <p className="text-xs text-slate-500 text-right">{progress}%</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  )
}

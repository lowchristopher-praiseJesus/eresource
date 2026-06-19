'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'

interface DeleteDialogProps {
  resourceId: string
  resourceName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDialog({ resourceId, resourceName, open, onOpenChange }: DeleteDialogProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setError('')
    setDeleting(true)
    try {
      const res = await fetch(`/api/resources/${resourceId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      onOpenChange(false)
      router.refresh()
    } catch {
      setError('Failed to delete. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Resource</DialogTitle>
          <DialogDescription>
            Are you sure? This will permanently remove the resource and its file from storage. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium text-slate-900">
          &ldquo;{resourceName}&rdquo;
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Resource } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const CATEGORY_LABELS: Record<Resource['category'], string> = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'Document',
  PICTURE: 'Picture',
}

function SortableItem({
  resource,
  onUnpin,
}: {
  resource: Resource
  onUnpin: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: resource.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-md border border-slate-200"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 text-sm font-medium truncate">{resource.name}</span>
      <Badge variant="secondary" className="flex-shrink-0">
        {CATEGORY_LABELS[resource.category]}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        className="flex-shrink-0"
        onClick={() => onUnpin(resource.id)}
      >
        Unpin
      </Button>
    </div>
  )
}

export function PinnedManager({ initialResources }: { initialResources: Resource[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialResources)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(r => r.id === active.id)
    const newIndex = items.findIndex(r => r.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)

    setSaving(true)
    try {
      await Promise.all(
        reordered.map((r, i) =>
          fetch(`/api/resources/${r.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pinnedOrder: i + 1 }),
          })
        )
      )
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  async function handleUnpin(id: string) {
    setItems(prev => prev.filter(r => r.id !== id))
    await fetch(`/api/resources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPinned: false }),
    })
    router.refresh()
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">
        No pinned resources — pin up to 6 from the{' '}
        <a href="/admin/resources" className="underline">Resources page</a>.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {saving && (
        <p className="text-xs text-slate-400">Saving order…</p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map(r => r.id)} strategy={verticalListSortingStrategy}>
          {items.map(resource => (
            <SortableItem key={resource.id} resource={resource} onUnpin={handleUnpin} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

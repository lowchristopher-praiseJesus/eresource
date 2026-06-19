'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { Category } from '@prisma/client'

const CATEGORY_LABELS: Record<Category, string> = {
  VIDEO: 'Video',
  AUDIO: 'Audio',
  DOCUMENT: 'PDF & Document',
  PICTURE: 'Picture',
}

export interface ResourceFormProps {
  name: string
  description: string
  tagsInput: string
  category: Category | ''
  onNameChange: (v: string) => void
  onDescriptionChange: (v: string) => void
  onTagsInputChange: (v: string) => void
  onCategoryChange: (v: Category) => void
  disabled?: boolean
}

export function ResourceForm({
  name, description, tagsInput, category,
  onNameChange, onDescriptionChange, onTagsInputChange, onCategoryChange,
  disabled = false,
}: ResourceFormProps) {
  const chips = tagsInput.split(',').map(t => t.trim()).filter(Boolean)

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="res-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="res-name"
          value={name}
          onChange={e => onNameChange(e.target.value)}
          maxLength={200}
          disabled={disabled}
          placeholder="e.g. Sunday Sermon — June 2026"
        />
        <p className="text-xs text-slate-500 text-right">{name.length}/200</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="res-description">Description</Label>
        <Textarea
          id="res-description"
          value={description}
          onChange={e => onDescriptionChange(e.target.value)}
          maxLength={2000}
          disabled={disabled}
          placeholder="Optional description visible to users…"
          rows={3}
        />
        <p className="text-xs text-slate-500 text-right">{description.length}/2000</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="res-tags">Tags</Label>
        <Input
          id="res-tags"
          value={tagsInput}
          onChange={e => onTagsInputChange(e.target.value)}
          disabled={disabled}
          placeholder="sermon, worship, 2026 (comma-separated)"
        />
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {chips.slice(0, 20).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="res-category">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select
          value={category}
          onValueChange={v => onCategoryChange(v as Category)}
          disabled={disabled}
        >
          <SelectTrigger id="res-category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

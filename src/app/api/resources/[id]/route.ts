import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { r2 } from '@/lib/r2'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  category: z.enum(['VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE']).optional(),
  isPinned: z.boolean().optional(),
  pinnedOrder: z.number().int().positive().nullable().optional(),
  topicIds: z.array(z.string()).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.resource.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { topicIds, ...resourceData } = parsed.data
  const data: z.infer<typeof updateSchema> = { ...resourceData }

  // Enforce max-6 pinned when pinning a previously-unpinned resource
  if (data.isPinned === true && !existing.isPinned) {
    // Non-atomic count check: acceptable for single-admin deployments
    const pinnedCount = await db.resource.count({ where: { isPinned: true } })
    if (pinnedCount >= 6) {
      return NextResponse.json(
        { error: 'Maximum 6 resources can be pinned' },
        { status: 400 }
      )
    }
  }

  // Auto-assign pinnedOrder when pinning without an explicit order
  if (data.isPinned === true && data.pinnedOrder === undefined) {
    const maxOrderResult = await db.resource.aggregate({
      where: { isPinned: true },
      _max: { pinnedOrder: true },
    })
    data.pinnedOrder = (maxOrderResult._max.pinnedOrder ?? 0) + 1
  }

  // Clear pinnedOrder when unpinning
  if (data.isPinned === false) {
    data.pinnedOrder = null
  }

  const resource = await db.resource.update({
    where: { id },
    data: {
      ...data,
      ...(topicIds !== undefined
        ? {
            topics: {
              deleteMany: {},
              create: topicIds.map(topicId => ({ topicId })),
            },
          }
        : {}),
    },
  })
  return NextResponse.json({ resource })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.resource.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (existing.fileKey && process.env.R2_ACCESS_KEY_ID !== 'placeholder') {
    try {
      await r2.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: existing.fileKey,
      }))
    } catch (err) {
      // Log but don't block — DB record is the source of truth
      console.warn('R2 delete failed (resource DB record will still be removed):', err)
    }
  }

  await db.resource.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}

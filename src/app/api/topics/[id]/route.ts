import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).nullable().optional(),
  order: z.number().int().positive().optional(),
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

  const existing = await db.topic.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { order, ...rest } = parsed.data

  if (order !== undefined && order !== existing.order) {
    const neighbor = await db.topic.findFirst({ where: { order } })
    if (neighbor && neighbor.id !== id) {
      await db.topic.update({ where: { id: neighbor.id }, data: { order: existing.order } })
    }
  }

  const topic = await db.topic.update({
    where: { id },
    data: { ...rest, ...(order !== undefined ? { order } : {}) },
  })
  return NextResponse.json({ topic })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const existing = await db.topic.findUnique({
    where: { id },
    include: { _count: { select: { resources: true } } },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (existing._count.resources > 0) {
    return NextResponse.json(
      { error: 'Cannot delete: topic has resources assigned. Reassign them first.' },
      { status: 409 }
    )
  }

  await db.topic.delete({ where: { id } })
  return new NextResponse(null, { status: 204 })
}

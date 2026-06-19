import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const resource = await db.resource.findUnique({
    where: { id },
    select: { id: true },
  })
  if (!resource) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await db.resource.update({
    where: { id },
    data: { likeCount: { increment: 1 } },
    select: { likeCount: true },
  })
  return NextResponse.json({ likeCount: updated.likeCount })
}

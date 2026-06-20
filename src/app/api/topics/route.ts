import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base
  let i = 2
  while (await db.topic.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`
  }
  return slug
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional(),
})

export async function GET() {
  const topics = await db.topic.findMany({
    orderBy: { order: 'asc' },
    include: { _count: { select: { resources: true } } },
  })
  return NextResponse.json({ topics })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { name, description } = parsed.data

  const existing = await db.topic.findFirst({ where: { name } })
  if (existing) return NextResponse.json({ error: 'A topic with this name already exists' }, { status: 409 })

  const maxOrder = await db.topic.aggregate({ _max: { order: true } })
  const order = (maxOrder._max.order ?? 0) + 1
  const slug = await uniqueSlug(slugify(name))

  const topic = await db.topic.create({ data: { name, description, slug, order } })
  return NextResponse.json({ topic }, { status: 201 })
}

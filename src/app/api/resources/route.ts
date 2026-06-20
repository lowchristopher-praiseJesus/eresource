import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { categoryFromMime, isValidYoutubeUrl } from '@/lib/category'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Category } from '@prisma/client'

const CATEGORIES = ['VIDEO', 'AUDIO', 'DOCUMENT', 'PICTURE'] as const

const fileBodySchema = z.object({
  resourceType: z.literal('FILE'),
  fileKey: z.string().min(1),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().positive(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  category: z.enum(CATEGORIES).optional(),
  topicIds: z.array(z.string()).optional(),
})

const youtubeBodySchema = z.object({
  resourceType: z.literal('YOUTUBE'),
  youtubeUrl: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  category: z.enum(CATEGORIES).optional(),
  topicIds: z.array(z.string()).optional(),
})

const createSchema = z.discriminatedUnion('resourceType', [fileBodySchema, youtubeBodySchema])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const data = parsed.data

  if (data.resourceType === 'FILE') {
    const detected = data.category ?? categoryFromMime(data.mimeType)
    if (!detected) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    const resource = await db.resource.create({
      data: {
        name: data.name,
        description: data.description,
        tags: data.tags ?? [],
        category: detected,
        resourceType: 'FILE',
        fileKey: data.fileKey,
        mimeType: data.mimeType,
        fileSizeBytes: data.fileSizeBytes,
        ...(data.topicIds?.length
          ? { topics: { create: data.topicIds.map(topicId => ({ topicId })) } }
          : {}),
      },
    })
    return NextResponse.json({ resource }, { status: 201 })
  } else {
    if (!isValidYoutubeUrl(data.youtubeUrl)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    const category: Category = data.category ?? 'VIDEO'
    const resource = await db.resource.create({
      data: {
        name: data.name,
        description: data.description,
        tags: data.tags ?? [],
        category,
        resourceType: 'YOUTUBE',
        youtubeUrl: data.youtubeUrl,
        ...(data.topicIds?.length
          ? { topics: { create: data.topicIds.map(topicId => ({ topicId })) } }
          : {}),
      },
    })
    return NextResponse.json({ resource }, { status: 201 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)))
  const categoryParam = searchParams.get('category')
  const search = searchParams.get('search')

  const where = {
    ...(categoryParam && (CATEGORIES as readonly string[]).includes(categoryParam)
      ? { category: categoryParam as Category }
      : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [resources, total] = await Promise.all([
    db.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.resource.count({ where }),
  ])

  return NextResponse.json({ resources, total, page, totalPages: Math.ceil(total / limit) })
}

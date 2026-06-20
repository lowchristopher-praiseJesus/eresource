import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db', () => ({
  db: {
    topic: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { GET, POST } from '@/app/api/topics/route'

const mockSession = { user: { id: '1', email: 'admin@test.com' } }
const mockTopic = {
  id: 'topic1',
  name: 'Spiritual Preparation',
  slug: 'spiritual-preparation',
  description: null,
  order: 2,
  createdAt: new Date('2026-06-20'),
  _count: { resources: 3 },
}

function makePost(body: unknown) {
  return new NextRequest('http://localhost/api/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('GET /api/topics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with topics ordered by order ASC', async () => {
    vi.mocked(db.topic.findMany).mockResolvedValueOnce([mockTopic] as any)
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.topics).toHaveLength(1)
    expect(body.topics[0].name).toBe('Spiritual Preparation')
    expect(db.topic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { order: 'asc' } })
    )
  })
})

describe('POST /api/topics', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await POST(makePost({ name: 'New Topic' }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 400 when name is missing', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    const res = await POST(makePost({}))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid input' })
  })

  it('returns 409 when topic name already exists', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findFirst).mockResolvedValueOnce(mockTopic as any)
    const res = await POST(makePost({ name: 'Spiritual Preparation' }))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'A topic with this name already exists' })
  })

  it('returns 201 and creates topic with auto-generated slug and order', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findFirst).mockResolvedValueOnce(null)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce(null) // slug unique check
    vi.mocked(db.topic.aggregate).mockResolvedValueOnce({ _max: { order: 9 } } as any)
    const created = { ...mockTopic, name: 'New Topic', slug: 'new-topic', order: 10 }
    vi.mocked(db.topic.create).mockResolvedValueOnce(created as any)
    const res = await POST(makePost({ name: 'New Topic' }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.topic.name).toBe('New Topic')
    expect(db.topic.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'new-topic', order: 10 }),
      })
    )
  })
})

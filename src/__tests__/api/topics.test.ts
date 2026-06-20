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
    $transaction: vi.fn(),
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

import { PATCH, DELETE } from '@/app/api/topics/[id]/route'

const mockParams = { params: Promise.resolve({ id: 'topic1' }) }

function makePatch(body: unknown) {
  return new NextRequest('http://localhost/api/topics/topic1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
function makeDelete() {
  return new NextRequest('http://localhost/api/topics/topic1', { method: 'DELETE' })
}

describe('PATCH /api/topics/[id]', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await PATCH(makePatch({ name: 'Updated' }), mockParams)
    expect(res.status).toBe(401)
  })

  it('returns 404 when topic not found', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce(null)
    const res = await PATCH(makePatch({ name: 'Updated' }), mockParams)
    expect(res.status).toBe(404)
  })

  it('returns 400 when body is empty', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce(mockTopic as any)
    const res = await PATCH(makePatch({}), mockParams)
    expect(res.status).toBe(400)
  })

  it('returns 200 with updated topic and does not change slug on rename', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce(mockTopic as any)
    const updated = { ...mockTopic, name: 'Renamed Topic' }
    vi.mocked(db.topic.update).mockResolvedValueOnce(updated as any)
    const res = await PATCH(makePatch({ name: 'Renamed Topic' }), mockParams)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.topic.name).toBe('Renamed Topic')
    expect(body.topic.slug).toBe('spiritual-preparation') // slug unchanged
  })

  it('swaps order with neighbor when order is changed', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce(mockTopic as any) // current topic order=2
    const neighbor = { ...mockTopic, id: 'topic2', order: 1 }
    vi.mocked(db.topic.findFirst).mockResolvedValueOnce(neighbor as any) // neighbor at order=1
    vi.mocked(db.topic.update).mockResolvedValue({ ...mockTopic, order: 1 } as any)
    ;(db.$transaction as any).mockImplementationOnce(async (ops: any[]) =>
      Promise.all(ops.map((op: any) => op))
    )
    const res = await PATCH(makePatch({ order: 1 }), mockParams)
    expect(res.status).toBe(200)
    expect(db.topic.update).toHaveBeenCalledTimes(2) // neighbor swap + self update
    expect(db.topic.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'topic2' }, data: { order: 2 } })
    )
  })
})

describe('DELETE /api/topics/[id]', () => {
  beforeEach(() => vi.resetAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(401)
  })

  it('returns 404 when topic not found', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce(null)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(404)
  })

  it('returns 409 when topic has resources assigned', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce({
      ...mockTopic,
      _count: { resources: 3 },
    } as any)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({
      error: 'Cannot delete: topic has resources assigned. Reassign them first.',
    })
  })

  it('returns 204 and deletes topic when no resources assigned', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.topic.findUnique).mockResolvedValueOnce({
      ...mockTopic,
      _count: { resources: 0 },
    } as any)
    vi.mocked(db.topic.delete).mockResolvedValueOnce(mockTopic as any)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(204)
    expect(db.topic.delete).toHaveBeenCalledWith({ where: { id: 'topic1' } })
  })
})

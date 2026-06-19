import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

beforeAll(() => {
  process.env.R2_BUCKET_NAME = 'test-bucket'
})

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db', () => ({
  db: {
    resource: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { GET, POST } from '@/app/api/resources/route'

const mockSession = { user: { id: '1', email: 'admin@test.com' } }
const mockResource = {
  id: 'res1',
  name: 'Sunday Sermon',
  description: null,
  tags: [],
  category: 'AUDIO',
  resourceType: 'FILE',
  fileKey: 'uploads/123-abc.mp3',
  mimeType: 'audio/mpeg',
  fileSizeBytes: 5_000_000,
  youtubeUrl: null,
  isPinned: false,
  pinnedOrder: null,
  likeCount: 0,
  createdAt: new Date('2026-06-19'),
  updatedAt: new Date('2026-06-19'),
}

function makePost(body: unknown) {
  return new NextRequest('http://localhost/api/resources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeGet(query?: string) {
  return new NextRequest(`http://localhost/api/resources${query ? '?' + query : ''}`)
}

describe('POST /api/resources', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await POST(makePost({ resourceType: 'FILE', fileKey: 'k', mimeType: 'audio/mpeg', fileSizeBytes: 1000, name: 'Test' }))
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 400 when name is missing', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    const res = await POST(makePost({ resourceType: 'FILE', fileKey: 'k', mimeType: 'audio/mpeg', fileSizeBytes: 1000 }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid input' })
  })

  it('returns 400 when resourceType is invalid', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    const res = await POST(makePost({ resourceType: 'INVALID', name: 'Test' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid input' })
  })

  it('returns 400 when YouTube URL is malformed', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    const res = await POST(makePost({ resourceType: 'YOUTUBE', youtubeUrl: 'https://not-youtube.com', name: 'Test' }))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid input' })
  })

  it('returns 201 and creates a FILE resource with auto-detected category', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.create).mockResolvedValueOnce(mockResource as any)
    const res = await POST(makePost({
      resourceType: 'FILE',
      fileKey: 'uploads/123-abc.mp3',
      mimeType: 'audio/mpeg',
      fileSizeBytes: 5_000_000,
      name: 'Sunday Sermon',
    }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.resource.name).toBe('Sunday Sermon')
    expect(db.resource.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'AUDIO', resourceType: 'FILE' }) })
    )
  })

  it('returns 201 and creates a YOUTUBE resource with default VIDEO category', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    const ytResource = { ...mockResource, resourceType: 'YOUTUBE', category: 'VIDEO', fileKey: null, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }
    vi.mocked(db.resource.create).mockResolvedValueOnce(ytResource as any)
    const res = await POST(makePost({
      resourceType: 'YOUTUBE',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      name: 'Worship Night',
    }))
    expect(res.status).toBe(201)
    expect(db.resource.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ category: 'VIDEO', resourceType: 'YOUTUBE' }) })
    )
  })
})

describe('GET /api/resources', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await GET(makeGet())
    expect(res.status).toBe(401)
  })

  it('returns 200 with paginated resource list', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findMany).mockResolvedValueOnce([mockResource] as any)
    vi.mocked(db.resource.count).mockResolvedValueOnce(1)
    const res = await GET(makeGet())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resources).toHaveLength(1)
    expect(body.total).toBe(1)
    expect(body.page).toBe(1)
    expect(body.totalPages).toBe(1)
  })

  it('returns 200 and passes category filter to DB query', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findMany).mockResolvedValueOnce([mockResource] as any)
    vi.mocked(db.resource.count).mockResolvedValueOnce(1)
    const res = await GET(makeGet('category=AUDIO'))
    expect(res.status).toBe(200)
    expect(db.resource.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'AUDIO' }) })
    )
  })
})

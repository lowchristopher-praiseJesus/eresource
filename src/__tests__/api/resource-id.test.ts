import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

beforeAll(() => {
  process.env.R2_BUCKET_NAME = 'test-bucket'
})

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/db', () => ({
  db: {
    resource: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))
vi.mock('@/lib/r2', () => ({ r2: { send: vi.fn() } }))
vi.mock('@aws-sdk/client-s3', () => ({
  DeleteObjectCommand: vi.fn().mockImplementation(function (input: unknown) { return { _type: 'DeleteObjectCommand', input } }),
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { r2 } from '@/lib/r2'
import { PATCH, DELETE } from '@/app/api/resources/[id]/route'

const mockSession = { user: { id: '1', email: 'admin@test.com' } }
const mockFileResource = {
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
const mockYoutubeResource = {
  ...mockFileResource,
  resourceType: 'YOUTUBE',
  fileKey: null,
  mimeType: null,
  fileSizeBytes: null,
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  category: 'VIDEO',
}
const mockParams = { params: Promise.resolve({ id: 'res1' }) }

function makePatch(body: unknown) {
  return new NextRequest('http://localhost/api/resources/res1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
function makeDelete() {
  return new NextRequest('http://localhost/api/resources/res1', { method: 'DELETE' })
}

describe('PATCH /api/resources/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await PATCH(makePatch({ name: 'Updated' }), mockParams)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 404 when resource not found', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findUnique).mockResolvedValueOnce(null)
    const res = await PATCH(makePatch({ name: 'Updated' }), mockParams)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })

  it('returns 200 with updated resource', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findUnique).mockResolvedValueOnce(mockFileResource as any)
    const updated = { ...mockFileResource, name: 'Updated Name' }
    vi.mocked(db.resource.update).mockResolvedValueOnce(updated as any)
    const res = await PATCH(makePatch({ name: 'Updated Name' }), mockParams)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.resource.name).toBe('Updated Name')
  })
})

describe('DELETE /api/resources/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ error: 'Unauthorized' })
  })

  it('returns 404 when resource not found', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findUnique).mockResolvedValueOnce(null)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found' })
  })

  it('returns 204 and calls R2 DeleteObjectCommand for FILE resources', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findUnique).mockResolvedValueOnce(mockFileResource as any)
    vi.mocked(r2.send).mockResolvedValueOnce({} as any)
    vi.mocked(db.resource.delete).mockResolvedValueOnce(mockFileResource as any)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(204)
    expect(r2.send).toHaveBeenCalledTimes(1)
  })

  it('returns 204 and does NOT call R2 for YOUTUBE resources', async () => {
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any)
    vi.mocked(db.resource.findUnique).mockResolvedValueOnce(mockYoutubeResource as any)
    vi.mocked(db.resource.delete).mockResolvedValueOnce(mockYoutubeResource as any)
    const res = await DELETE(makeDelete(), mockParams)
    expect(res.status).toBe(204)
    expect(r2.send).not.toHaveBeenCalled()
  })
})

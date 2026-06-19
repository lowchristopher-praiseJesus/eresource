import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'

// Set required env vars before any imports that read them
beforeAll(() => {
  process.env.R2_BUCKET_NAME = 'test-bucket'
  process.env.R2_ACCOUNT_ID = 'test-account'
  process.env.R2_ACCESS_KEY_ID = 'test-key'
  process.env.R2_SECRET_ACCESS_KEY = 'test-secret'
  process.env.MAX_UPLOAD_BYTES = '524288000'
})

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://r2.example.com/presigned-url'),
}))

vi.mock('@/lib/r2', () => ({
  r2: {},
}))

import { auth } from '@/lib/auth'
import { POST } from '@/app/api/upload/presign/route'

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/upload/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/upload/presign', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null)
    const res = await POST(makeRequest({
      filename: 'sermon.mp4',
      contentType: 'video/mp4',
      fileSizeBytes: 1000,
    }))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns 400 when filename is empty', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: '1', email: 'a@b.com' } } as any)
    const res = await POST(makeRequest({
      filename: '',
      contentType: 'video/mp4',
      fileSizeBytes: 1000,
    }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body).toEqual({ error: 'Invalid input' })
  })

  it('returns 400 when fileSizeBytes exceeds MAX_UPLOAD_BYTES', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: '1', email: 'a@b.com' } } as any)
    const res = await POST(makeRequest({
      filename: 'huge.mp4',
      contentType: 'video/mp4',
      fileSizeBytes: 600_000_000, // over 500MB
    }))
    expect(res.status).toBe(400)
  })

  it('returns 200 with url and key for valid authenticated request', async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: { id: '1', email: 'a@b.com' } } as any)
    const res = await POST(makeRequest({
      filename: 'worship.mp3',
      contentType: 'audio/mpeg',
      fileSizeBytes: 5_000_000,
    }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('url', 'https://r2.example.com/presigned-url')
    expect(body.key).toMatch(/^uploads\/\d+-[a-f0-9-]+\.mp3$/)
  })
})

import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/youtube-oembed/route'

// Uses real isValidYoutubeUrl — no mock needed

describe('GET /api/youtube-oembed', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when url param is missing', async () => {
    const res = await GET(new NextRequest('http://localhost/api/youtube-oembed'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid URL' })
  })

  it('returns 400 when url is not a valid YouTube URL', async () => {
    const res = await GET(new NextRequest('http://localhost/api/youtube-oembed?url=https%3A%2F%2Fnot-youtube.com'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid URL' })
  })

  it('returns 200 with title when oEmbed API succeeds', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({ title: 'Sunday Sermon — June 2026' }),
    } as any)
    const url = encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    const res = await GET(new NextRequest(`http://localhost/api/youtube-oembed?url=${url}`))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ title: 'Sunday Sermon — June 2026' })
  })

  it('returns 502 when oEmbed API returns non-200', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({ ok: false } as any)
    const url = encodeURIComponent('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    const res = await GET(new NextRequest(`http://localhost/api/youtube-oembed?url=${url}`))
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: 'oEmbed fetch failed' })
  })
})

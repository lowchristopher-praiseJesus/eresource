import { isValidYoutubeUrl } from '@/lib/category'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url || !isValidYoutubeUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    )
    if (!res.ok) return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: 502 })
    const data = await res.json()
    return NextResponse.json({ title: data.title as string })
  } catch {
    return NextResponse.json({ error: 'oEmbed fetch failed' }, { status: 502 })
  }
}

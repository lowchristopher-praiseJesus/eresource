import { mkdir, writeFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import { join } from 'path'

export async function PUT(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return new NextResponse(null, { status: 404 })
  }

  const key = req.nextUrl.searchParams.get('key')
  if (!key || !key.startsWith('uploads/')) {
    return new NextResponse(null, { status: 400 })
  }

  const filename = key.slice('uploads/'.length)
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(join(uploadsDir, filename), Buffer.from(await req.arrayBuffer()))

  return new NextResponse(null, { status: 200 })
}

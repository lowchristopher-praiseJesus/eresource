import { auth } from '@/lib/auth'
import { r2 } from '@/lib/r2'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1),
  fileSizeBytes: z
    .number()
    .positive()
    .max(Number(process.env.MAX_UPLOAD_BYTES ?? 524_288_000)),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const { filename, contentType } = parsed.data
  const parts = filename.split('.')
  const ext = parts.length > 1 ? parts.pop() : 'bin'
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`

  if (process.env.NODE_ENV === 'development') {
    const localUrl = new URL('/api/upload/local', process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
    localUrl.searchParams.set('key', key)
    return NextResponse.json({ url: localUrl.toString(), key })
  }

  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 3600 }
  )

  return NextResponse.json({ url, key })
}

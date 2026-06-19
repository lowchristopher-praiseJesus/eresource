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

  const { filename, contentType, fileSizeBytes } = parsed.data
  const ext = filename.split('.').pop()
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${ext}`

  const url = await getSignedUrl(
    r2,
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      ContentLength: fileSizeBytes,
    }),
    { expiresIn: 3600 }
  )

  return NextResponse.json({ url, key })
}

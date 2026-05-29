import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'No file' }, { status: 400 })

    const key = `uploads/${uuid()}-${file.name}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await R2.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET || 'kairos',
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))

    return Response.json({
      url: `${process.env.R2_PUBLIC_URL}/${key}`,
      key,
      name: file.name,
      size: file.size,
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}

// KAIROS 文件上传接口 — 支持照片和地图文件
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uid } from 'uuid'

export const maxDuration = 30
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/dxf']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const fieldType = (formData.get('fieldType') as string) || 'photo'

    if (!file) return NextResponse.json({ error: '未收到文件——请重新上传' }, { status: 400 })

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `不支持的文件类型: ${file.type}。支持 JPG/PNG/WebP/SVG/DXF` }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: '文件过大，上限10MB' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${uid()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const publicUrl = `/uploads/${filename}`

    return NextResponse.json({
      url: publicUrl,
      filename,
      type: file.type,
      size: file.size,
      fieldType,
      uploadedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: '上传时风遇到了阻碍——请重试' }, { status: 500 })
  }
}

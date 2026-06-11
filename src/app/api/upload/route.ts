import { v4 as uuid } from 'uuid'

function getR2() {
  const r2 = (globalThis as any).R2 || (process as any).env?.R2
  if (!r2) throw new Error('R2 binding not available')
  return r2
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) return Response.json({ error: 'No file' }, { status: 400 })

    const ext = file.name.split('.').pop() || 'bin'
    const key = `uploads/${uuid()}.${ext}`
    const buffer = await file.arrayBuffer()

    const r2 = getR2()
    await r2.put(key, buffer, {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    })

    const publicUrl = process.env.R2_PUBLIC_URL || 'https://pub-125ff6c969c14c20b888e94db8e2979a.r2.dev'

    return Response.json({
      url: `${publicUrl}/${key}`,
      key,
      name: file.name,
      size: file.size,
    })
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500 })
  }
}
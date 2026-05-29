import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: '需要userId' }, { status: 400 })
    const vendor = await prisma.vendor.findUnique({ where: { userId } })
    // Also get booths with market info
    const booths = await prisma.booth.findMany({
      where: { vendorId: vendor?.id },
      include: { market: true },
      orderBy: { market: { date: 'desc' } as any },
    })
    return NextResponse.json({ ...(vendor || {}), booths })
  } catch {
    return NextResponse.json(null)
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, ...data } = body
    const vendor = await prisma.vendor.findUnique({ where: { userId } })
    if (!vendor) return NextResponse.json({ error: '未找到' }, { status: 404 })
    const updated = await prisma.vendor.update({ where: { id: vendor.id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

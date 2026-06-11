import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '需要先走进来' }, { status: 401 })

    const vendor = await prisma.vendor.findUnique({ where: { userId } })
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
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '需要先走进来' }, { status: 401 })

    const data = await req.json()
    const vendor = await prisma.vendor.findUnique({ where: { userId } })
    if (!vendor) return NextResponse.json({ error: '未找到' }, { status: 404 })
    const updated = await prisma.vendor.update({ where: { id: vendor.id }, data })
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
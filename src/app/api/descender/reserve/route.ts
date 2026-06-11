import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '需要先走进来' }, { status: 401 })

    const { marketId } = await req.json()
    const booths = await prisma.booth.findMany({
      where: { marketId, status: 'available' },
      take: 1,
    })
    if (booths.length === 0) {
      return NextResponse.json({ reserved: false, message: '所有信位已被预订。' }, { status: 200 })
    }
    const vendor = await prisma.vendor.findUnique({ where: { userId } }) as { id?: string } | null
    const booth = await prisma.booth.update({
      where: { id: booths[0].id },
      data: { status: 'reserved', vendorId: vendor?.id || null },
    })
    return NextResponse.json({ reserved: true, booth }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '预约未成形' }, { status: 500 })
  }
}
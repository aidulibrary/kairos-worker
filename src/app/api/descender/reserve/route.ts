import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { marketId, userId } = await req.json()
    // Find an available booth in this market
    const booths = await prisma.booth.findMany({
      where: { marketId, status: 'available' },
      take: 1,
    })
    if (booths.length === 0) {
      return NextResponse.json({ reserved: false, message: '所有信位已被预订。' }, { status: 200 })
    }
    // Get the vendor for this user
    const vendor = await prisma.vendor.findUnique({ where: { userId } }) as { id?: string } | null
    // Reserve the booth
    const booth = await prisma.booth.update({
      where: { id: booths[0].id },
      data: { status: 'reserved', vendorId: vendor?.id || null },
    })
    return NextResponse.json({ reserved: true, booth }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '预约未成形' }, { status: 500 })
  }
}

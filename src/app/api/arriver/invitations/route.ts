import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    if (!vendorId) return NextResponse.json([])
    const invitations = await prisma.booth.findMany({
      where: { vendorId, status: 'reserved' },
      include: { market: true },
    })
    return NextResponse.json(invitations)
  } catch {
    return NextResponse.json([])
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { boothId, status } = await req.json()
    const booth = await prisma.booth.update({
      where: { id: boothId },
      data: { status, vendorId: status === 'available' ? null : undefined },
    })
    return NextResponse.json(booth)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

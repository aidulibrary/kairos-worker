import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')
    if (!vendorId) return NextResponse.json([])
    const history = await prisma.booth.findMany({
      where: { vendorId, status: 'occupied' },
      include: { market: true },
      orderBy: { market: { createdAt: 'desc' } },
    })
    return NextResponse.json(history)
  } catch {
    return NextResponse.json([])
  }
}
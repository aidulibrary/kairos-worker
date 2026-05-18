export const dynamic = "force-static"
import { NextResponse } from 'next/server'
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
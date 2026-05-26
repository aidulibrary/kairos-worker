export const dynamic = "force-static"
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const markets = await prisma.market.findMany({
      where: {
        status: 'published',
        ...(city ? { location: { contains: city } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { creator: true },
    })
    return NextResponse.json(markets)
  } catch {
    return NextResponse.json([])
  }
}
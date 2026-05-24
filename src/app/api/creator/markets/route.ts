import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const markets = await prisma.market.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ markets })
  } catch {
    return NextResponse.json({ markets: [] })
  }
}
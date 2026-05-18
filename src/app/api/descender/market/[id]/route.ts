import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const market = await prisma.market.findUnique({
      where: { id },
      include: { creator: true, booths: { include: { vendor: true } } },
    })
    if (!market) return NextResponse.json({ error: '该市集尚未成形' }, { status: 404 })
    return NextResponse.json(market)
  } catch {
    return NextResponse.json({ error: '感知出错' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const markets = await prisma.market.findMany({
      orderBy: { createdAt: 'desc' },
      include: { creator: true, booths: { include: { vendor: { include: { user: true } } } } },
    })
    return NextResponse.json(markets)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '请先注册' }, { status: 401 })

    const body = await req.json()
    const market = await prisma.market.create({
      data: {
        creatorId: userId,
        name: body.name,
        location: body.location,
        date: body.date,
        boothCount: body.boothCount || 4,
        description: body.description || null,
        status: 'draft',
      },
    })
    return NextResponse.json(market)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    const market = await prisma.market.update({ where: { id }, data })
    return NextResponse.json(market)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '请先注册' }, { status: 401 })

    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await prisma.market.delete({ where: { id } })
    return NextResponse.json({ deleted: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
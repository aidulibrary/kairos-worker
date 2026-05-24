import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: '需要userId' }, { status: 400 })
    const vendor = await prisma.vendor.findUnique({ where: { userId } })
    return NextResponse.json(vendor)
  } catch {
    return NextResponse.json(null)
  }
}
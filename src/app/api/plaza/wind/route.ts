import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const posts = await prisma.plazaPost.findMany({
      where: { type: 'WIND' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { user: true },
    })
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
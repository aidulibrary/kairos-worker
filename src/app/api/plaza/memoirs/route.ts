import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const posts = await prisma.plazaPost.findMany({
      where: { type: 'MEMOIR' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      include: { user: true },
    })
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ posts: [] })
  }
}
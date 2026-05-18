export const dynamic = "force-static"
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, type, content, relatedMarketId } = body
    const post = await prisma.plazaPost.create({
      data: { userId, type, content, relatedMarketId },
    })
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
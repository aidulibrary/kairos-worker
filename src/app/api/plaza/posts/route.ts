import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '需要先走进来' }, { status: 401 })

    const body = await req.json()
    const { type, content, relatedMarketId } = body
    const post = await prisma.plazaPost.create({
      data: { userId, type, content, relatedMarketId },
    })
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: '创建失败' }, { status: 500 })
  }
}
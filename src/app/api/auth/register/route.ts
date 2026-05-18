export const dynamic = "force-static"
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, name, identity } = body
    const user = await prisma.user.create({
      data: { phone, name, identity, tokenScore: 0, tokenLevel: 'WANDERER' },
    })
    return NextResponse.json({ userId: user.id, identity: user.identity }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '风无法成形' }, { status: 500 })
  }
}
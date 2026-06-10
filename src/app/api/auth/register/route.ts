import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, name, identity } = body
    const user = await prisma.user.create({
      data: { phone, name, identity, tokenScore: 0, tokenLevel: 'WANDERER' },
    })

    const cookieStore = await cookies()
    cookieStore.set('kairos_user', user.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({ userId: user.id, identity: user.identity }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '风无法成形' }, { status: 500 })
  }
}
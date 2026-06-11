import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { phone, name, identity, extras } = body

    const existing = await prisma.user.findUnique({
      where: { phone, identity },
    })

    let user: any
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: { name },
      })
    } else {
      user = await prisma.user.create({
        data: { phone, name, identity, tokenScore: 0, tokenLevel: 'WANDERER' },
      })
    }

    if (identity === 'ARRIVER' && extras) {
      await prisma.vendor.create({
        data: {
          userId: user.id,
          category: extras.category || '',
          city: extras.city || '',
          creditScore: 60,
          expoCount: 0,
          goodRate: 0.8,
          violations: 0,
          complaints: 0,
        },
      })
    }

    if (identity === 'FACILITATOR' && extras) {
      await prisma.service.create({
        data: {
          userId: user.id,
          category: extras.category || '',
          projectCount: 0,
          rating: 0,
        },
      })
    }

    const cookieStore = await cookies()
    cookieStore.set('kairos_user', user.id, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })

    return NextResponse.json({ userId: user.id, identity: user.identity }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: '风无法成形', detail: String(e) }, { status: 500 })
  }
}
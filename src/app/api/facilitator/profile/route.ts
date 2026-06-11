import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('kairos_user')?.value
    if (!userId) return NextResponse.json({ error: '需要先走进来' }, { status: 401 })

    const service = await prisma.service.findUnique({ where: { userId } })
    return NextResponse.json(service)
  } catch {
    return NextResponse.json(null)
  }
}
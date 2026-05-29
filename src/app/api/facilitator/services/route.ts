import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PATCH(req: NextRequest) {
  let body: { serviceId?: string; description?: string; category?: string } = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: '缺少 serviceId' }, { status: 400 }) }
  const { serviceId, description, category } = body
  if (!serviceId) return NextResponse.json({ error: '缺少 serviceId' }, { status: 400 })
  try {
    const service = await prisma.service.update({ where: { id: serviceId }, data: { description, category } })
    return NextResponse.json(service)
  } catch { return NextResponse.json({ error: '服务未找到' }, { status: 404 }) }
}
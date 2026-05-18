export const dynamic = "force-static"
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return NextResponse.json({ reserved: true, ...body }, { status: 201 })
  } catch {
    return NextResponse.json({ error: '预约未成形' }, { status: 500 })
  }
}
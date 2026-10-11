import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getUserId(req: NextRequest) {
  return req.headers.get('x-user-id') ?? 'demo-user'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const userId = getUserId(req)

  try {
    const logs = await prisma.spiritualLog.findMany({
      where: { userId, date: new Date(date) },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ logs })
  } catch {
    return NextResponse.json({ logs: [] })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  const body = await req.json()

  try {
    const log = await prisma.spiritualLog.create({
      data: {
        userId,
        date: new Date(body.date),
        type: body.type,
        duration: body.duration ?? null,
        notes: body.notes ?? null,
        mood: body.mood ?? null,
      },
    })
    return NextResponse.json({ log })
  } catch {
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}

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
    const completions = await prisma.habitCompletion.findMany({
      where: { userId, date: new Date(date) },
    })
    return NextResponse.json({ completions })
  } catch {
    return NextResponse.json({ completions: [] })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  const body = await req.json()

  try {
    const completion = await prisma.habitCompletion.upsert({
      where: { habitId_date: { habitId: body.habitId, date: new Date(body.date) } },
      create: {
        habitId: body.habitId,
        userId,
        date: new Date(body.date),
        count: body.count ?? 1,
        notes: body.notes ?? null,
      },
      update: { count: body.count ?? 1 },
    })
    return NextResponse.json({ completion })
  } catch {
    return NextResponse.json({ error: 'Failed to track completion' }, { status: 500 })
  }
}

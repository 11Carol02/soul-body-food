import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getUserId(req: NextRequest) {
  return req.headers.get('x-user-id') ?? 'demo-user'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? 'active'
  const userId = getUserId(req)

  try {
    const goals = await prisma.goal.findMany({
      where: status === 'all' ? { userId } : { userId, status },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ goals })
  } catch {
    return NextResponse.json({ goals: [] })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  const body = await req.json()

  try {
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: body.title,
        description: body.description ?? null,
        category: body.category,
        targetValue: body.targetValue ?? null,
        unit: body.unit ?? null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: 'active',
      },
    })
    return NextResponse.json({ goal })
  } catch {
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 })
  }
}

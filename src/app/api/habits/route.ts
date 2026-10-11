import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getUserId(req: NextRequest) {
  return req.headers.get('x-user-id') ?? 'demo-user'
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req)
  try {
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ habits })
  } catch {
    return NextResponse.json({ habits: [] })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  const body = await req.json()

  try {
    const habit = await prisma.habit.create({
      data: {
        userId,
        title: body.title,
        category: body.category,
        icon: body.icon ?? null,
        color: body.color ?? null,
        targetCount: body.targetCount ?? 1,
        isActive: true,
      },
    })
    return NextResponse.json({ habit })
  } catch {
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
  }
}

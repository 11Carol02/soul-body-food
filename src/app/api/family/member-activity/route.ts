import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId') ?? ''
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  try {
    const [foodLogs, spiritualLogs, completions] = await Promise.all([
      prisma.foodLog.findMany({ where: { userId, date: new Date(date) } }),
      prisma.spiritualLog.findMany({ where: { userId, date: new Date(date) } }),
      prisma.habitCompletion.findMany({ where: { userId, date: new Date(date) } }),
    ])

    return NextResponse.json({
      calories: foodLogs.reduce((s, l) => s + (l.calories ?? 0), 0),
      spiritualMinutes: spiritualLogs.reduce((s, l) => s + (l.duration ?? 0), 0),
      habitsCompleted: completions.length,
    })
  } catch {
    return NextResponse.json({ calories: 0, spiritualMinutes: 0, habitsCompleted: 0 })
  }
}

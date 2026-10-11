import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  // For demo purposes, use a fixed userId. In production, get from session.
  const userId = searchParams.get('userId') ?? 'demo-user'

  try {
    const [foodLogs, spiritualLogs, habits, completions, goals, family] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId, date: new Date(date) },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.spiritualLog.findMany({
        where: { userId, date: new Date(date) },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.habit.findMany({
        where: { userId, isActive: true },
      }),
      prisma.habitCompletion.findMany({
        where: { userId, date: new Date(date) },
      }),
      prisma.goal.findMany({
        where: { userId, status: 'active' },
      }),
      prisma.familyMember.findMany({
        where: { userId },
        include: { family: { include: { members: true } } },
      }),
    ])

    const caloriesConsumed = foodLogs.reduce((s, l) => s + (l.calories ?? 0), 0)
    const spiritualMinutes = spiritualLogs.reduce((s, l) => s + (l.duration ?? 0), 0)

    return NextResponse.json({
      caloriesConsumed,
      caloriesGoal: 2000,
      spiritualMinutes,
      spiritualGoal: 30,
      habitsCompleted: completions.length,
      habitsTotal: habits.length,
      goalsActive: goals.length,
      streak: 0,
      familyMembers: family[0]?.family?.members?.length ?? 0,
      recentFoodLogs: foodLogs.slice(0, 5),
      recentSpiritualLogs: spiritualLogs.slice(0, 5),
    })
  } catch {
    return NextResponse.json({
      caloriesConsumed: 0,
      caloriesGoal: 2000,
      spiritualMinutes: 0,
      spiritualGoal: 30,
      habitsCompleted: 0,
      habitsTotal: 0,
      goalsActive: 0,
      streak: 0,
      familyMembers: 0,
      recentFoodLogs: [],
      recentSpiritualLogs: [],
    })
  }
}

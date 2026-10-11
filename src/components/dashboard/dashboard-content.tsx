'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { getTodayDate, formatDateShort } from '@/lib/utils'
import {
  UtensilsCrossed,
  Heart,
  Target,
  CheckSquare,
  TrendingUp,
  Users,
  Flame,
  Sun,
  Plus,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  caloriesConsumed: number
  caloriesGoal: number
  spiritualMinutes: number
  spiritualGoal: number
  habitsCompleted: number
  habitsTotal: number
  goalsActive: number
  streak: number
  familyMembers: number
  recentFoodLogs: Array<{ id: string; name: string; mealType: string; calories: number | null }>
  recentSpiritualLogs: Array<{ id: string; type: string; duration: number | null; notes: string | null }>
}

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = getTodayDate()
    fetch(`/api/dashboard?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const s = stats ?? {
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
  }

  const caloriesPct = Math.min(Math.round((s.caloriesConsumed / s.caloriesGoal) * 100), 100)
  const spiritualPct = Math.min(Math.round((s.spiritualMinutes / s.spiritualGoal) * 100), 100)
  const habitsPct = s.habitsTotal > 0 ? Math.round((s.habitsCompleted / s.habitsTotal) * 100) : 0

  const mealTypeEmoji: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍎',
  }

  const spiritualTypeEmoji: Record<string, string> = {
    prayer: '🙏',
    meditation: '🧘',
    scripture: '📖',
    gratitude: '💛',
    worship: '🎵',
    fasting: '✨',
    journal: '📝',
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sun className="w-6 h-6 text-yellow-500" />
            Good day!
          </h2>
          <p className="text-sm text-gray-500">Here's your progress for today</p>
        </div>
        {s.streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-600">{s.streak}</span>
            <span className="text-xs text-orange-500">day streak</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Calories"
          value={`${s.caloriesConsumed}`}
          suffix={`/ ${s.caloriesGoal}`}
          progress={caloriesPct}
          icon={<UtensilsCrossed className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
          progressColor="bg-green-500"
          href="/food"
        />
        <StatCard
          title="Spiritual"
          value={`${s.spiritualMinutes}m`}
          suffix={`/ ${s.spiritualGoal}m`}
          progress={spiritualPct}
          icon={<Heart className="w-5 h-5 text-purple-600" />}
          color="bg-purple-50"
          progressColor="bg-purple-500"
          href="/spiritual"
        />
        <StatCard
          title="Habits"
          value={`${s.habitsCompleted}`}
          suffix={`/ ${s.habitsTotal}`}
          progress={habitsPct}
          icon={<CheckSquare className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
          progressColor="bg-blue-500"
          href="/habits"
        />
        <StatCard
          title="Goals"
          value={`${s.goalsActive}`}
          suffix="active"
          progress={0}
          icon={<Target className="w-5 h-5 text-orange-600" />}
          color="bg-orange-50"
          progressColor="bg-orange-500"
          href="/goals"
          hideProgress
        />
      </div>

      {/* Quick Add */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Link href="/food?add=true">
          <Button variant="outline" className="w-full h-12 gap-2 border-dashed">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-sm">Log Food</span>
          </Button>
        </Link>
        <Link href="/spiritual?add=true">
          <Button variant="outline" className="w-full h-12 gap-2 border-dashed">
            <Plus className="w-4 h-4 text-purple-600" />
            <span className="text-sm">Log Spirit</span>
          </Button>
        </Link>
        <Link href="/goals?add=true">
          <Button variant="outline" className="w-full h-12 gap-2 border-dashed">
            <Plus className="w-4 h-4 text-orange-600" />
            <span className="text-sm">Add Goal</span>
          </Button>
        </Link>
        <Link href="/family">
          <Button variant="outline" className="w-full h-12 gap-2 border-dashed">
            <Users className="w-4 h-4 text-pink-600" />
            <span className="text-sm">{s.familyMembers} Members</span>
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Food */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-green-600" />
                Today's Food
              </span>
              <Link href="/food" className="text-xs text-soul-600 font-normal hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {s.recentFoodLogs.length === 0 ? (
              <EmptyState
                icon="🍽️"
                text="No meals logged yet"
                action="Log your first meal"
                href="/food?add=true"
              />
            ) : (
              <div className="space-y-2">
                {s.recentFoodLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mealTypeEmoji[log.mealType] ?? '🍴'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{log.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{log.mealType}</p>
                      </div>
                    </div>
                    {log.calories && (
                      <span className="text-sm font-semibold text-green-600">{log.calories} cal</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Spiritual */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                Spiritual Activities
              </span>
              <Link href="/spiritual" className="text-xs text-soul-600 font-normal hover:underline">
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {s.recentSpiritualLogs.length === 0 ? (
              <EmptyState
                icon="🙏"
                text="No activities logged yet"
                action="Log spiritual activity"
                href="/spiritual?add=true"
              />
            ) : (
              <div className="space-y-2">
                {s.recentSpiritualLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{spiritualTypeEmoji[log.type] ?? '✨'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">{log.type}</p>
                        {log.notes && (
                          <p className="text-xs text-gray-500 line-clamp-1">{log.notes}</p>
                        )}
                      </div>
                    </div>
                    {log.duration && (
                      <span className="text-sm font-semibold text-purple-600">{log.duration}m</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            This Week at a Glance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyView />
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  suffix,
  progress,
  icon,
  color,
  progressColor,
  href,
  hideProgress,
}: {
  title: string
  value: string
  suffix: string
  progress: number
  icon: React.ReactNode
  color: string
  progressColor: string
  href: string
  hideProgress?: boolean
}) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>{icon}</div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-gray-900">{value}</span>
            <span className="text-xs text-gray-400">{suffix}</span>
          </div>
          {!hideProgress && (
            <div className="mt-2">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${progressColor}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{progress}%</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState({
  icon,
  text,
  action,
  href,
}: {
  icon: string
  text: string
  action: string
  href: string
}) {
  return (
    <div className="text-center py-4">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm text-gray-500 mb-3">{text}</p>
      <Link href={href}>
        <Button size="sm" variant="outline" className="text-xs">
          {action}
        </Button>
      </Link>
    </div>
  )
}

function WeeklyView() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date().getDay()
  const adjustedToday = today === 0 ? 6 : today - 1

  return (
    <div className="flex items-end justify-between gap-1 h-20">
      {days.map((day, i) => {
        const isPast = i < adjustedToday
        const isToday = i === adjustedToday
        const height = isPast ? Math.floor(Math.random() * 40) + 40 : isToday ? 60 : 20
        return (
          <div key={day} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-full rounded-t-sm transition-all ${
                isToday
                  ? 'bg-gradient-to-t from-soul-600 to-soul-400'
                  : isPast
                  ? 'bg-gray-200'
                  : 'bg-gray-100'
              }`}
              style={{ height: `${height}%` }}
            />
            <span className={`text-[10px] font-medium ${isToday ? 'text-soul-600' : 'text-gray-400'}`}>
              {day}
            </span>
          </div>
        )
      })}
    </div>
  )
}

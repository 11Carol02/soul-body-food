'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, CheckCircle2, Circle, Trash2, CheckSquare } from 'lucide-react'
import { getTodayDate, getCategoryColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  title: string
  category: string
  icon: string | null
  color: string | null
  targetCount: number
  isActive: boolean
}

interface HabitCompletion {
  habitId: string
  count: number
}

const CATEGORIES = [
  { value: 'food', label: 'Food', emoji: '🥗' },
  { value: 'spiritual', label: 'Spiritual', emoji: '🙏' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'personal', label: 'Personal', emoji: '⭐' },
]

const ICONS = ['🌅', '💧', '📖', '🙏', '🏃', '🥗', '😴', '💊', '🧘', '📝', '🎵', '❤️', '💪', '🌿']

export function HabitsContent() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [completions, setCompletions] = useState<HabitCompletion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [date] = useState(getTodayDate())
  const [form, setForm] = useState({
    title: '',
    category: 'personal',
    icon: '⭐',
    targetCount: '1',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [habitsRes, completionsRes] = await Promise.all([
        fetch('/api/habits'),
        fetch(`/api/habits/completions?date=${date}`),
      ])
      const [habitsData, completionsData] = await Promise.all([
        habitsRes.json(),
        completionsRes.json(),
      ])
      setHabits(habitsData.habits ?? [])
      setCompletions(completionsData.completions ?? [])
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/habits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, targetCount: Number(form.targetCount) }),
      })
      setForm({ title: '', category: 'personal', icon: '⭐', targetCount: '1' })
      setShowForm(false)
      await fetchData()
    } finally { setSubmitting(false) }
  }

  async function toggleCompletion(habitId: string) {
    const existing = completions.find((c) => c.habitId === habitId)
    const habit = habits.find((h) => h.id === habitId)
    if (!habit) return

    if (existing) {
      // Toggle off
      await fetch(`/api/habits/completions/${habitId}?date=${date}`, { method: 'DELETE' })
      setCompletions((prev) => prev.filter((c) => c.habitId !== habitId))
    } else {
      // Toggle on
      const res = await fetch('/api/habits/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ habitId, date, count: 1 }),
      })
      const data = await res.json()
      setCompletions((prev) => [...prev, data.completion])
    }
  }

  async function deleteHabit(id: string) {
    await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    setHabits((prev) => prev.filter((h) => h.id !== id))
    setCompletions((prev) => prev.filter((c) => c.habitId !== id))
  }

  const activeHabits = habits.filter((h) => h.isActive)
  const completedCount = completions.length
  const totalCount = activeHabits.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.value] = activeHabits.filter((h) => h.category === cat.value)
    return acc
  }, {} as Record<string, Habit[]>)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
          {completedCount}/{totalCount} done
        </span>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 ml-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardContent className="pt-4 pb-4">
            <h3 className="font-semibold text-blue-800 mb-3">New Habit</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label htmlFor="habitTitle">Habit Name *</Label>
                <Input
                  id="habitTitle"
                  placeholder="e.g. Morning Prayer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.emoji} {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetCount">Daily Target</Label>
                  <Input
                    id="targetCount"
                    type="number"
                    min="1"
                    value={form.targetCount}
                    onChange={(e) => setForm({ ...form, targetCount: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm({ ...form, icon })}
                      className={cn(
                        'w-9 h-9 rounded-lg text-lg transition-all',
                        form.icon === icon ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-100 hover:bg-gray-200'
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                  {submitting ? 'Saving...' : 'Add Habit'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : totalCount === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No habits added yet</p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Add your first habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const catHabits = byCategory[cat.value]
            if (catHabits.length === 0) return null
            return (
              <div key={cat.value}>
                <h3 className={cn('text-sm font-semibold mb-2 flex items-center gap-2', getCategoryColor(cat.value))}>
                  <span>{cat.emoji}</span>
                  {cat.label}
                </h3>
                <div className="space-y-2">
                  {catHabits.map((habit) => {
                    const completion = completions.find((c) => c.habitId === habit.id)
                    const isDone = !!completion
                    return (
                      <div
                        key={habit.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border transition-all',
                          isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100 hover:border-gray-200'
                        )}
                      >
                        <button
                          onClick={() => toggleCompletion(habit.id)}
                          className="flex-shrink-0"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300" />
                          )}
                        </button>
                        <span className="text-xl">{habit.icon ?? '⭐'}</span>
                        <span className={cn(
                          'flex-1 text-sm font-medium',
                          isDone ? 'line-through text-gray-400' : 'text-gray-800'
                        )}>
                          {habit.title}
                        </span>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-gray-200 hover:text-red-400 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

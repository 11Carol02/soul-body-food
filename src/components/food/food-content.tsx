'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, ChevronDown, ChevronUp, UtensilsCrossed } from 'lucide-react'
import { getTodayDate, getMealTypeColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface FoodLog {
  id: string
  name: string
  mealType: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fat: number | null
  fiber: number | null
  notes: string | null
  date: string
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']

const mealEmojis: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
}

export function FoodContent() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true')
  const [date, setDate] = useState(getTodayDate())
  const [form, setForm] = useState({
    name: '',
    mealType: 'breakfast',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs()
  }, [date])

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch(`/api/food?date=${date}`)
      const data = await res.json()
      setLogs(data.logs ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date,
          calories: form.calories ? Number(form.calories) : null,
          protein: form.protein ? Number(form.protein) : null,
          carbs: form.carbs ? Number(form.carbs) : null,
          fat: form.fat ? Number(form.fat) : null,
          fiber: form.fiber ? Number(form.fiber) : null,
        }),
      })
      setForm({ name: '', mealType: 'breakfast', calories: '', protein: '', carbs: '', fat: '', fiber: '', notes: '' })
      setShowForm(false)
      await fetchLogs()
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteLog(id: string) {
    await fetch(`/api/food/${id}`, { method: 'DELETE' })
    setLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const totalCalories = logs.reduce((sum, l) => sum + (l.calories ?? 0), 0)
  const totalProtein = logs.reduce((sum, l) => sum + (l.protein ?? 0), 0)
  const totalCarbs = logs.reduce((sum, l) => sum + (l.carbs ?? 0), 0)
  const totalFat = logs.reduce((sum, l) => sum + (l.fat ?? 0), 0)

  const groupedLogs = MEAL_TYPES.reduce((acc, type) => {
    acc[type] = logs.filter((l) => l.mealType === type)
    return acc
  }, {} as Record<string, FoodLog[]>)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {/* Date selector + Add button */}
      <div className="flex items-center gap-3">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[180px]"
        />
        <Button onClick={() => setShowForm(!showForm)} className="ml-auto gap-2">
          <Plus className="w-4 h-4" />
          Log Food
        </Button>
      </div>

      {/* Add Food Form */}
      {showForm && (
        <Card className="border-soul-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Food Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="name">Food Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Grilled Chicken Salad"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Meal Type</Label>
                  <Select value={form.mealType} onValueChange={(v) => setForm({ ...form, mealType: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {mealEmojis[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    placeholder="kcal"
                    value={form.calories}
                    onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={form.protein}
                    onChange={(e) => setForm({ ...form, protein: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={form.carbs}
                    onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={form.fat}
                    onChange={(e) => setForm({ ...form, fat: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="fiber">Fiber (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.1"
                    placeholder="g"
                    value={form.fiber}
                    onChange={(e) => setForm({ ...form, fiber: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes about this meal..."
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Entry'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Daily Summary */}
      {logs.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Daily Totals</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <MacroStat label="Calories" value={totalCalories} unit="kcal" color="text-green-700" />
              <MacroStat label="Protein" value={Math.round(totalProtein * 10) / 10} unit="g" color="text-blue-700" />
              <MacroStat label="Carbs" value={Math.round(totalCarbs * 10) / 10} unit="g" color="text-yellow-700" />
              <MacroStat label="Fat" value={Math.round(totalFat * 10) / 10} unit="g" color="text-red-700" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals by type */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No meals logged for this day</p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Log your first meal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {MEAL_TYPES.map((type) => {
            const items = groupedLogs[type]
            if (items.length === 0) return null
            const typeCals = items.reduce((s, l) => s + (l.calories ?? 0), 0)
            return (
              <Card key={type}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{mealEmojis[type]}</span>
                      <span className="font-semibold capitalize text-gray-800">{type}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', getMealTypeColor(type))}>
                        {items.length} item{items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {typeCals > 0 && (
                      <span className="text-sm font-semibold text-green-600">{typeCals} cal</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {items.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start justify-between border-t border-gray-50 pt-2"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{log.name}</p>
                            <div className="flex items-center gap-2">
                              {log.calories && (
                                <span className="text-sm text-gray-600">{log.calories} cal</span>
                              )}
                              <button
                                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedId === log.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => deleteLog(log.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {expandedId === log.id && (
                            <div className="mt-2 text-xs text-gray-500 grid grid-cols-3 gap-2 bg-gray-50 rounded p-2">
                              {log.protein !== null && <span>Protein: {log.protein}g</span>}
                              {log.carbs !== null && <span>Carbs: {log.carbs}g</span>}
                              {log.fat !== null && <span>Fat: {log.fat}g</span>}
                              {log.fiber !== null && <span>Fiber: {log.fiber}g</span>}
                              {log.notes && (
                                <span className="col-span-3 italic">{log.notes}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MacroStat({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{unit}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}

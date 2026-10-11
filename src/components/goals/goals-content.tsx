'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Plus, Target, CheckCircle2, Clock, PauseCircle, Pencil } from 'lucide-react'
import { calculateProgress, getCategoryColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Goal {
  id: string
  title: string
  description: string | null
  category: string
  targetValue: number | null
  currentValue: number
  unit: string | null
  startDate: string
  endDate: string | null
  status: string
}

const CATEGORIES = [
  { value: 'food', label: 'Food & Nutrition', emoji: '🥗' },
  { value: 'spiritual', label: 'Spiritual', emoji: '🙏' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { value: 'personal', label: 'Personal', emoji: '⭐' },
]

const categoryEmojis = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.emoji]))

export function GoalsContent() {
  const searchParams = useSearchParams()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true')
  const [filter, setFilter] = useState('active')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'personal',
    targetValue: '',
    unit: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchGoals() }, [filter])

  async function fetchGoals() {
    setLoading(true)
    try {
      const res = await fetch(`/api/goals?status=${filter}`)
      const data = await res.json()
      setGoals(data.goals ?? [])
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editingId ? `/api/goals/${editingId}` : '/api/goals'
      await fetch(url, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          targetValue: form.targetValue ? Number(form.targetValue) : null,
        }),
      })
      setForm({ title: '', description: '', category: 'personal', targetValue: '', unit: '', startDate: new Date().toISOString().split('T')[0], endDate: '' })
      setShowForm(false)
      setEditingId(null)
      await fetchGoals()
    } finally { setSubmitting(false) }
  }

  async function updateProgress(id: string, value: number) {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentValue: value }),
    })
    setGoals((prev) => prev.map((g) => g.id === id ? { ...g, currentValue: value } : g))
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/goals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchGoals()
  }

  const filteredGoals = goals.filter((g) => filter === 'all' || g.status === filter)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {['active', 'completed', 'all'].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-all',
                filter === s ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="ml-auto gap-2 bg-orange-500 hover:bg-orange-600">
          <Plus className="w-4 h-4" />
          New Goal
        </Button>
      </div>

      {showForm && (
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-orange-800">
              {editingId ? 'Edit Goal' : 'Create New Goal'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="title">Goal Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Read the Bible in a year"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
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
                  <Label htmlFor="targetValue">Target Value</Label>
                  <div className="flex gap-2">
                    <Input
                      id="targetValue"
                      type="number"
                      placeholder="e.g. 100"
                      value={form.targetValue}
                      onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                      className="flex-1"
                    />
                    <Input
                      placeholder="unit"
                      value={form.unit}
                      onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      className="w-24"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Why is this goal important to you?"
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null) }}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-orange-500 hover:bg-orange-600">
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No {filter !== 'all' ? filter : ''} goals yet</p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Create your first goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredGoals.map((goal) => {
            const progress = goal.targetValue
              ? calculateProgress(goal.currentValue, goal.targetValue)
              : 0
            return (
              <Card key={goal.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-2xl mt-0.5">{categoryEmojis[goal.category] ?? '⭐'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                          <StatusBadge status={goal.status} />
                        </div>
                        {goal.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{goal.description}</p>
                        )}
                        <span className={cn('text-xs font-medium mt-1 inline-block', getCategoryColor(goal.category))}>
                          {goal.category}
                        </span>
                        {goal.targetValue && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-500">
                                {goal.currentValue} / {goal.targetValue} {goal.unit ?? ''}
                              </span>
                              <span className="text-xs font-semibold text-orange-600">{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                            {goal.status === 'active' && (
                              <div className="flex gap-2 mt-2">
                                <Input
                                  type="number"
                                  className="h-7 text-xs w-24"
                                  placeholder="Update progress"
                                  onBlur={(e) => {
                                    if (e.target.value) updateProgress(goal.id, Number(e.target.value))
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const target = e.target as HTMLInputElement
                                      if (target.value) updateProgress(goal.id, Number(target.value))
                                    }
                                  }}
                                />
                                <span className="text-xs text-gray-400 self-center">{goal.unit ?? ''}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {goal.status === 'active' && (
                        <>
                          <button
                            onClick={() => updateStatus(goal.id, 'completed')}
                            className="text-gray-300 hover:text-green-500 transition-colors"
                            title="Mark complete"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStatus(goal.id, 'paused')}
                            className="text-gray-300 hover:text-yellow-500 transition-colors"
                            title="Pause"
                          >
                            <PauseCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {goal.status === 'paused' && (
                        <button
                          onClick={() => updateStatus(goal.id, 'active')}
                          className="text-gray-300 hover:text-green-500 transition-colors"
                          title="Resume"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-100 text-green-700' },
    completed: { label: 'Completed', className: 'bg-blue-100 text-blue-700' },
    paused: { label: 'Paused', className: 'bg-yellow-100 text-yellow-700' },
  }
  const cfg = configs[status] ?? configs.active
  return (
    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', cfg.className)}>
      {cfg.label}
    </span>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Heart, Star } from 'lucide-react'
import { getTodayDate, getSpiritualTypeColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SpiritualLog {
  id: string
  type: string
  duration: number | null
  notes: string | null
  mood: number | null
  date: string
}

const SPIRITUAL_TYPES = [
  { value: 'prayer', label: 'Prayer', emoji: '🙏' },
  { value: 'meditation', label: 'Meditation', emoji: '🧘' },
  { value: 'scripture', label: 'Scripture Reading', emoji: '📖' },
  { value: 'gratitude', label: 'Gratitude', emoji: '💛' },
  { value: 'worship', label: 'Worship', emoji: '🎵' },
  { value: 'fasting', label: 'Fasting', emoji: '✨' },
  { value: 'journal', label: 'Journal', emoji: '📝' },
]

const typeEmojis = Object.fromEntries(SPIRITUAL_TYPES.map((t) => [t.value, t.emoji]))

export function SpiritualContent() {
  const searchParams = useSearchParams()
  const [logs, setLogs] = useState<SpiritualLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(searchParams.get('add') === 'true')
  const [date, setDate] = useState(getTodayDate())
  const [form, setForm] = useState({
    type: 'prayer',
    duration: '',
    notes: '',
    mood: '3',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchLogs() }, [date])

  async function fetchLogs() {
    setLoading(true)
    try {
      const res = await fetch(`/api/spiritual?date=${date}`)
      const data = await res.json()
      setLogs(data.logs ?? [])
    } finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/spiritual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          date,
          duration: form.duration ? Number(form.duration) : null,
          mood: form.mood ? Number(form.mood) : null,
        }),
      })
      setForm({ type: 'prayer', duration: '', notes: '', mood: '3' })
      setShowForm(false)
      await fetchLogs()
    } finally { setSubmitting(false) }
  }

  async function deleteLog(id: string) {
    await fetch(`/api/spiritual/${id}`, { method: 'DELETE' })
    setLogs((prev) => prev.filter((l) => l.id !== id))
  }

  const totalMinutes = logs.reduce((sum, l) => sum + (l.duration ?? 0), 0)

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[180px]"
        />
        <Button onClick={() => setShowForm(!showForm)} className="ml-auto gap-2 bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4" />
          Log Activity
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-purple-800">Log Spiritual Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Activity Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPIRITUAL_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.emoji} {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="e.g. 15"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Mood / Spirit Level</Label>
                  <MoodSelector
                    value={Number(form.mood)}
                    onChange={(v) => setForm({ ...form, mood: String(v) })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="notes">Notes / Reflection</Label>
                  <Textarea
                    id="notes"
                    placeholder="Write your thoughts, prayers, or reflections..."
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                  {submitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      {logs.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total spiritual time today</p>
                <p className="text-2xl font-bold text-purple-700">{totalMinutes} minutes</p>
              </div>
              <div className="text-4xl">🌟</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity type cards */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {SPIRITUAL_TYPES.map((t) => {
          const count = logs.filter((l) => l.type === t.value).length
          return (
            <div
              key={t.value}
              className={cn(
                'rounded-lg p-3 text-center border transition-all',
                count > 0
                  ? 'border-purple-200 bg-purple-50'
                  : 'border-gray-100 bg-gray-50 opacity-60'
              )}
            >
              <div className="text-2xl mb-1">{t.emoji}</div>
              <div className="text-xs font-medium text-gray-700 line-clamp-1">{t.label}</div>
              {count > 0 && (
                <div className="text-xs text-purple-600 font-bold">{count}x</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Logs list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No spiritual activities logged for this day</p>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" /> Log an activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl mt-0.5">{typeEmojis[log.type] ?? '✨'}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          getSpiritualTypeColor(log.type)
                        )}>
                          {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                        </span>
                        {log.duration && (
                          <span className="text-xs text-gray-500">{log.duration} min</span>
                        )}
                        {log.mood && (
                          <MoodDisplay value={log.mood} />
                        )}
                      </div>
                      {log.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">"{log.notes}"</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteLog(log.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function MoodSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const moods = [
    { v: 1, emoji: '😔', label: 'Low' },
    { v: 2, emoji: '😐', label: 'Okay' },
    { v: 3, emoji: '🙂', label: 'Good' },
    { v: 4, emoji: '😊', label: 'Great' },
    { v: 5, emoji: '🌟', label: 'Blessed' },
  ]
  return (
    <div className="flex gap-2 mt-1">
      {moods.map((m) => (
        <button
          key={m.v}
          type="button"
          onClick={() => onChange(m.v)}
          className={cn(
            'flex-1 flex flex-col items-center py-2 rounded-lg border-2 transition-all',
            value === m.v ? 'border-purple-400 bg-purple-50' : 'border-gray-100 hover:border-gray-200'
          )}
        >
          <span className="text-xl">{m.emoji}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">{m.label}</span>
        </button>
      ))}
    </div>
  )
}

function MoodDisplay({ value }: { value: number }) {
  const emojis = ['', '😔', '😐', '🙂', '😊', '🌟']
  return <span className="text-sm">{emojis[value] ?? '🙂'}</span>
}

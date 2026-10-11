'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Users, UserCircle, Crown, Mail } from 'lucide-react'

interface Family {
  id: string
  name: string
  description: string | null
  members: FamilyMemberData[]
}

interface FamilyMemberData {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export function FamilyContent() {
  const [family, setFamily] = useState<Family | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [familyName, setFamilyName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { fetchFamily() }, [])

  async function fetchFamily() {
    setLoading(true)
    try {
      const res = await fetch('/api/family')
      const data = await res.json()
      setFamily(data.family ?? null)
    } finally { setLoading(false) }
  }

  async function createFamily(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: familyName }),
      })
      setShowCreateForm(false)
      setFamilyName('')
      await fetchFamily()
    } finally { setSubmitting(false) }
  }

  async function inviteMember(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/family/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      })
      setShowInviteForm(false)
      setInviteEmail('')
      await fetchFamily()
    } finally { setSubmitting(false) }
  }

  const avatarColors = [
    'bg-purple-200 text-purple-700',
    'bg-green-200 text-green-700',
    'bg-blue-200 text-blue-700',
    'bg-pink-200 text-pink-700',
    'bg-orange-200 text-orange-700',
    'bg-teal-200 text-teal-700',
  ]

  return (
    <div className="p-4 lg:p-6 space-y-4">
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : !family ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Create Your Family Group</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                Connect with your family to track your journey together
              </p>
              <Button onClick={() => setShowCreateForm(true)} className="bg-pink-600 hover:bg-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Family Group
              </Button>
            </CardContent>
          </Card>
          {showCreateForm && (
            <Card className="border-pink-200">
              <CardContent className="pt-4 pb-4">
                <h3 className="font-semibold text-pink-800 mb-3">Name Your Family Group</h3>
                <form onSubmit={createFamily} className="space-y-3">
                  <div>
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      placeholder="e.g. The Smiths"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={submitting} className="bg-pink-600 hover:bg-pink-700">
                      {submitting ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Family Header */}
          <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-100">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>👨‍👩‍👧‍👦</span>
                    {family.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {family.members.length} member{family.members.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button
                  onClick={() => setShowInviteForm(!showInviteForm)}
                  size="sm"
                  className="bg-pink-600 hover:bg-pink-700 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Invite
                </Button>
              </div>
            </CardContent>
          </Card>

          {showInviteForm && (
            <Card className="border-pink-200">
              <CardContent className="pt-4 pb-4">
                <h3 className="font-semibold text-pink-800 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Invite a Family Member
                </h3>
                <form onSubmit={inviteMember} className="space-y-3">
                  <div>
                    <Label htmlFor="inviteEmail">Email Address</Label>
                    <Input
                      id="inviteEmail"
                      type="email"
                      placeholder="family@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">They'll receive an invitation to join your family group.</p>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowInviteForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={submitting} className="bg-pink-600 hover:bg-pink-700">
                      {submitting ? 'Sending...' : 'Send Invite'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Members Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {family.members.map((member, idx) => (
              <Card key={member.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name ?? ''}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold ${avatarColors[idx % avatarColors.length]}`}>
                        {(member.user.name ?? member.user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-gray-900 truncate">
                          {member.user.name ?? 'Family Member'}
                        </p>
                        {member.role === 'admin' && (
                          <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <MemberActivityPreview userId={member.user.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MemberActivityPreview({ userId }: { userId: string }) {
  const [activity, setActivity] = useState<{ calories: number; spiritualMinutes: number; habitsCompleted: number } | null>(null)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    fetch(`/api/family/member-activity?userId=${userId}&date=${today}`)
      .then((r) => r.json())
      .then(setActivity)
      .catch(() => {})
  }, [userId])

  if (!activity) return <div className="h-4 bg-gray-100 rounded animate-pulse" />

  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <div>
        <p className="text-sm font-bold text-green-600">{activity.calories}</p>
        <p className="text-[10px] text-gray-400">cal</p>
      </div>
      <div>
        <p className="text-sm font-bold text-purple-600">{activity.spiritualMinutes}m</p>
        <p className="text-[10px] text-gray-400">spirit</p>
      </div>
      <div>
        <p className="text-sm font-bold text-blue-600">{activity.habitsCompleted}</p>
        <p className="text-[10px] text-gray-400">habits</p>
      </div>
    </div>
  )
}

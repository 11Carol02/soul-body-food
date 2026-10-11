import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const inviterUserId = req.headers.get('x-user-id') ?? 'demo-user'
  const body = await req.json()
  const { email } = body

  try {
    // Find the family this user belongs to
    const membership = await prisma.familyMember.findFirst({
      where: { userId: inviterUserId, role: 'admin' },
      select: { familyId: true },
    })

    if (!membership) {
      return NextResponse.json({ error: 'You must be a family admin to invite members' }, { status: 403 })
    }

    // Find or create the invited user
    let invitedUser = await prisma.user.findUnique({ where: { email } })

    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: { email, name: email.split('@')[0] },
      })
    }

    // Add to family
    await prisma.familyMember.upsert({
      where: { familyId_userId: { familyId: membership.familyId, userId: invitedUser.id } },
      create: { familyId: membership.familyId, userId: invitedUser.id, role: 'member' },
      update: {},
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
  }
}

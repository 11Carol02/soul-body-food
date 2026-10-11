import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getUserId(req: NextRequest) {
  return req.headers.get('x-user-id') ?? 'demo-user'
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req)
  try {
    const membership = await prisma.familyMember.findFirst({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: { user: true },
            },
          },
        },
      },
    })
    return NextResponse.json({ family: membership?.family ?? null })
  } catch {
    return NextResponse.json({ family: null })
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req)
  const body = await req.json()

  try {
    const family = await prisma.family.create({
      data: {
        name: body.name,
        description: body.description ?? null,
        members: {
          create: { userId, role: 'admin' },
        },
      },
      include: {
        members: { include: { user: true } },
      },
    })
    return NextResponse.json({ family })
  } catch {
    return NextResponse.json({ error: 'Failed to create family' }, { status: 500 })
  }
}

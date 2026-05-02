import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const redirectSchema = z.object({
  fromPath: z.string().min(1).startsWith('/'),
  toPath: z.string().min(1),
  type: z.enum(['PERMANENT_301', 'TEMPORARY_302']).default('PERMANENT_301'),
})

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ success: true, data: redirects })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = redirectSchema.parse(body)

    const redirect = await prisma.redirect.create({ data })

    await prisma.activityLog.create({
      data: { userId: user.userId, action: 'CREATE', entity: 'redirect', entityId: redirect.id, details: `${data.fromPath} → ${data.toPath}` },
    })

    return NextResponse.json({ success: true, data: redirect }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

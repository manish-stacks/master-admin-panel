import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()

  await prisma.setting.upsert({
    where: { key: 'robots_txt' },
    update: { value: content },
    create: { key: 'robots_txt', value: content, group: 'seo' },
  })

  await prisma.activityLog.create({
    data: { userId: user.userId, action: 'UPDATE', entity: 'robots.txt', details: 'Robots.txt updated' },
  })

  return NextResponse.json({ success: true })
}

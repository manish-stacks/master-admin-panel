import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const page = await prisma.page.findUnique({ where: { id: params.id }, include: { author: true, seoMeta: true } })
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: page })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { title, slug, content, status, metaTitle, metaDescription, keywords, canonicalUrl, noIndex, ogTitle, ogDescription } = body
    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title, slug, content, status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        seoMeta: {
          upsert: {
            create: { metaTitle, metaDescription, keywords, canonicalUrl, noIndex: noIndex || false, ogTitle, ogDescription },
            update: { metaTitle, metaDescription, keywords, canonicalUrl, noIndex: noIndex || false, ogTitle, ogDescription },
          }
        }
      },
    })
    await prisma.activityLog.create({ data: { userId: user.userId, action: 'UPDATE', entity: 'page', entityId: page.id, details: `Updated: ${page.title}` } })
    return NextResponse.json({ success: true, data: page })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'EDITOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.page.delete({ where: { id: params.id } })
  await prisma.activityLog.create({ data: { userId: user.userId, action: 'DELETE', entity: 'page', entityId: params.id, details: 'Page deleted' } })
  return NextResponse.json({ success: true })
}

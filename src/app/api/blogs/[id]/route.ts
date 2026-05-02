import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const blog = await prisma.blog.findUnique({ where: { id: params.id }, include: { author: true, categories: true, tags: true, seoMeta: true } })
  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true, data: blog })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { title, slug, excerpt, content, status, featuredImage, categoryIds, metaTitle, metaDescription, keywords, noIndex } = body
    const blog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        title, slug, excerpt, content, featuredImage, status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
        categories: categoryIds ? { set: categoryIds.map((id: string) => ({ id })) } : undefined,
        seoMeta: {
          upsert: {
            create: { metaTitle, metaDescription, keywords, noIndex: noIndex || false },
            update: { metaTitle, metaDescription, keywords, noIndex: noIndex || false },
          }
        }
      },
    })
    await prisma.activityLog.create({ data: { userId: user.userId, action: 'UPDATE', entity: 'blog', entityId: blog.id, details: `Updated: ${blog.title}` } })
    return NextResponse.json({ success: true, data: blog })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role === 'EDITOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  await prisma.blog.delete({ where: { id: params.id } })
  await prisma.activityLog.create({ data: { userId: user.userId, action: 'DELETE', entity: 'blog', entityId: params.id, details: 'Blog deleted' } })
  return NextResponse.json({ success: true })
}

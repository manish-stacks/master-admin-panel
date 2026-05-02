import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  content: z.string().default(''),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).default('DRAFT'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  noIndex: z.boolean().default(false),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const where = status ? { status: status as any } : {}

  const pages = await prisma.page.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { author: { select: { name: true } }, seoMeta: true },
  })

  return NextResponse.json({ success: true, data: pages, total: pages.length })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = pageSchema.parse(body)

    // Check slug uniqueness
    const existing = await prisma.page.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json({ error: 'Slug already exists. Use a different slug.' }, { status: 400 })

    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        authorId: user.userId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        seoMeta: {
          create: {
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            keywords: data.keywords || null,
            canonicalUrl: data.canonicalUrl || null,
            noIndex: data.noIndex,
            ogTitle: data.ogTitle || null,
            ogDescription: data.ogDescription || null,
          },
        },
      },
    })

    await prisma.activityLog.create({ data: { userId: user.userId, action: 'CREATE', entity: 'page', entityId: page.id, details: `Created: ${page.title}` } })
    return NextResponse.json({ success: true, data: page }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

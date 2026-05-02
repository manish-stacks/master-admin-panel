import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const blogSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().default(''),
  featuredImage: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED']).default('DRAFT'),
  categoryIds: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  keywords: z.string().optional(),
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

  const blogs = await prisma.blog.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { author: { select: { name: true } }, categories: true, tags: true, seoMeta: true },
  })

  return NextResponse.json({ success: true, data: blogs, total: blogs.length })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = blogSchema.parse(body)

    const existing = await prisma.blog.findUnique({ where: { slug: data.slug } })
    if (existing) return NextResponse.json({ error: 'Slug already exists.' }, { status: 400 })

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        featuredImage: data.featuredImage || null,
        status: data.status,
        authorId: user.userId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
        categories: data.categoryIds?.length ? { connect: data.categoryIds.map(id => ({ id })) } : undefined,
        seoMeta: {
          create: {
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            keywords: data.keywords || null,
            noIndex: data.noIndex,
            ogTitle: data.ogTitle || null,
            ogDescription: data.ogDescription || null,
          },
        },
      },
    })

    await prisma.activityLog.create({ data: { userId: user.userId, action: 'CREATE', entity: 'blog', entityId: blog.id, details: `Created: ${blog.title}` } })
    return NextResponse.json({ success: true, data: blog }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.errors[0].message }, { status: 400 })
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

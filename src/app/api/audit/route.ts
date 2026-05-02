import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  const pages = await prisma.page.findMany({ include: { seoMeta: true } })
  const blogs = await prisma.blog.findMany({ include: { seoMeta: true } })
  
  const issues: string[] = []
  let score = 100

  pages.forEach(p => {
    if (!p.seoMeta?.metaTitle) { issues.push(`Page "${p.title}": Missing meta title`); score -= 3 }
    if (!p.seoMeta?.metaDescription) { issues.push(`Page "${p.title}": Missing meta description`); score -= 3 }
    if (!p.seoMeta?.canonicalUrl) { issues.push(`Page "${p.title}": No canonical URL`); score -= 1 }
  })
  blogs.forEach(b => {
    if (!b.seoMeta?.metaTitle) { issues.push(`Blog "${b.title}": Missing meta title`); score -= 2 }
    if (!b.featuredImage) { issues.push(`Blog "${b.title}": No featured image`); score -= 1 }
  })

  await prisma.activityLog.create({ data: { userId: user.userId, action: 'AUDIT', entity: 'seo', details: `SEO audit run. Score: ${Math.max(score,0)}` } })

  return NextResponse.json({ success: true, data: { score: Math.max(score, 0), issues, total: pages.length + blogs.length } })
}

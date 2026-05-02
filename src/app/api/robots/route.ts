import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const setting = await prisma.setting.findUnique({ where: { key: 'robots_txt' } })
  const content = setting?.value || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`

  return new NextResponse(content, {
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
  })
}

export async function POST(req: Request) {
  const { content } = await req.json()
  await prisma.setting.upsert({
    where: { key: 'robots_txt' },
    update: { value: content },
    create: { key: 'robots_txt', value: content, group: 'seo' },
  })
  return NextResponse.json({ success: true })
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'

  const [pages, blogs] = await Promise.all([
    prisma.page.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, seoMeta: { select: { noIndex: true } } },
    }),
    prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, seoMeta: { select: { noIndex: true } } },
    }),
  ])

  const urls: string[] = []

  pages
    .filter(p => !p.seoMeta?.noIndex)
    .forEach(p => {
      const loc = p.slug === '/' ? baseUrl : `${baseUrl}/${p.slug}`
      urls.push(`
  <url>
    <loc>${loc}</loc>
    <lastmod>${p.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${p.slug === '/' ? '1.0' : '0.8'}</priority>
  </url>`)
    })

  blogs
    .filter(b => !b.seoMeta?.noIndex)
    .forEach(b => {
      urls.push(`
  <url>
    <loc>${baseUrl}/blog/${b.slug}</loc>
    <lastmod>${b.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`)
    })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

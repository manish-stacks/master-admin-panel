import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await prisma.page.findUnique({ where: { slug: params.slug }, include: { seoMeta: true } })
  if (!page) return { title: 'Not Found' }
  return {
    title: page.seoMeta?.metaTitle || page.title,
    description: page.seoMeta?.metaDescription || '',
    robots: page.seoMeta?.noIndex ? 'noindex,nofollow' : 'index,follow',
  }
}

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED' },
    include: { seoMeta: true },
  })
  if (!page) notFound()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 48px 100px' }}>
      <h1 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 'clamp(36px, 5vw, 60px)',
        fontWeight: 700, color: '#1a1a1a',
        letterSpacing: '-1px', lineHeight: 1.1,
        marginBottom: 40, maxWidth: 760
      }}>
        {page.title}
      </h1>
      <div
        className="prose"
        style={{ maxWidth: 760 }}
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await prisma.blog.findUnique({ where: { slug: params.slug }, include: { seoMeta: true } })
  if (!blog) return { title: 'Not Found' }
  return {
    title: blog.seoMeta?.metaTitle || blog.title,
    description: blog.seoMeta?.metaDescription || blog.excerpt || '',
    openGraph: {
      title: blog.seoMeta?.ogTitle || blog.title,
      description: blog.seoMeta?.ogDescription || blog.excerpt || '',
      images: blog.featuredImage ? [blog.featuredImage] : [],
    },
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug, status: 'PUBLISHED' },
    include: { author: { select: { name: true } }, categories: true, tags: true, seoMeta: true },
  })
  if (!blog) notFound()

  await prisma.blog.update({ where: { id: blog.id }, data: { viewCount: { increment: 1 } } })

  const related = await prisma.blog.findMany({
    where: { status: 'PUBLISHED', id: { not: blog.id }, categories: { some: { id: { in: blog.categories.map(c => c.id) } } } },
    take: 3,
    include: { categories: true, author: { select: { name: true } } },
  })

  return (
    <div>
      {/* Article Header */}
      <section style={{ padding: '64px 48px 0', maxWidth: 1100, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 36, fontSize: 13, color: '#aaa' }}>
          <Link href="/"    style={{ color: '#aaa', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link href="/blog" style={{ color: '#aaa', textDecoration: 'none' }}>Blog</Link>
          <span>/</span>
          <span style={{ color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{blog.title}</span>
        </div>

        <div style={{ maxWidth: 760 }}>
          {/* Categories */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {blog.categories.map(cat => (
              <Link key={cat.id} href={`/blog?category=${cat.slug}`}
                style={{ fontSize: 11, fontWeight: 700, color: '#4f46e5', letterSpacing: '1.2px', textTransform: 'uppercase', textDecoration: 'none' }}>
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(32px, 4vw, 54px)',
            fontWeight: 700, color: '#1a1a1a',
            lineHeight: 1.1, letterSpacing: '-1.2px', marginBottom: 24
          }}>
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p style={{ fontSize: 19, color: '#666', lineHeight: 1.7, marginBottom: 28, fontWeight: 300 }}>
              {blog.excerpt}
            </p>
          )}

          {/* Author + Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 32, borderBottom: '1px solid #e8e4dd' }}>
            <div style={{ width: 42, height: 42, background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 16, flexShrink: 0 }}>
              {blog.author.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>{blog.author.name}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : ''}
                {blog.viewCount > 0 && ` · ${blog.viewCount.toLocaleString()} views`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div style={{ maxWidth: 1100, margin: '36px auto 0', padding: '0 48px' }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', maxHeight: 500 }}>
            <img src={blog.featuredImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <section style={{ padding: '52px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div
          className="prose"
          style={{ maxWidth: 720 }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div style={{ maxWidth: 720, marginTop: 48, paddingTop: 28, borderTop: '1px solid #e8e4dd', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa', marginRight: 4, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Tags:</span>
            {blog.tags.map(tag => (
              <span key={tag.id} style={{ fontSize: 12, color: '#666', background: '#f0efeb', padding: '4px 12px', borderRadius: 100 }}>#{tag.name}</span>
            ))}
          </div>
        )}

        {/* Share */}
        <div style={{ maxWidth: 720, marginTop: 40, padding: '24px 28px', background: '#f0efeb', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Enjoyed this article?</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 2 }}>Share it with your network</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(`/blog/${blog.slug}`)}`}
              target="_blank" rel="noreferrer"
              style={{ padding: '9px 20px', background: '#1a1a1a', color: 'white', borderRadius: 100, fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              Share on X
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`/blog/${blog.slug}`)}`}
              target="_blank" rel="noreferrer"
              style={{ padding: '9px 20px', background: 'white', color: '#1a1a1a', borderRadius: 100, fontSize: 13, textDecoration: 'none', fontWeight: 500, border: '1px solid #ddd' }}>
              LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {related.length > 0 && (
        <section style={{ background: '#f0efeb', padding: '80px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 700, letterSpacing: '-0.5px', color: '#1a1a1a', marginBottom: 36 }}>
              Related Posts
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {related.map(post => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #e8e4dd' }}>
                    <div style={{ height: 160, background: 'linear-gradient(135deg, #ece9e2, #ddd8d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {post.featuredImage
                        ? <img src={post.featuredImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 40, opacity: 0.25 }}>✍️</span>}
                    </div>
                    <div style={{ padding: 20 }}>
                      {post.categories[0] && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px' }}>{post.categories[0].name}</span>
                      )}
                      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginTop: 8, lineHeight: 1.3 }}>{post.title}</h3>
                      <div style={{ fontSize: 12, color: '#aaa', marginTop: 10 }}>{post.author.name}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

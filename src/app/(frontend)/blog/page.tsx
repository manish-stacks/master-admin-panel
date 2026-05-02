import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function BlogPage({ searchParams }: { searchParams: { category?: string; page?: string } }) {
  const page = parseInt(searchParams.page || '1')
  const limit = 9
  const categoryFilter = searchParams.category

  const where: any = { status: 'PUBLISHED' }
  if (categoryFilter) where.categories = { some: { slug: categoryFilter } }

  const [blogs, total, categories] = await Promise.all([
    prisma.blog.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { publishedAt: 'desc' },
      include: { categories: true, author: { select: { name: true } } },
    }),
    prisma.blog.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      {/* Header */}
      <section style={{ padding: '80px 48px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>Our blog</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 700, letterSpacing: '-1.5px', color: '#1a1a1a', lineHeight: 1.05 }}>Ideas &amp;<br /><span style={{ fontStyle: 'italic' }}>Insights</span></h1>
          <p style={{ fontSize: 15, color: '#777', maxWidth: 360, lineHeight: 1.7 }}>Tutorials, guides, and thoughts on web development, SEO, and building for the modern web.</p>
        </div>
      </section>

      {/* Category filters */}
      {categories.length > 0 && (
        <div style={{ borderTop: '1px solid #e8e4dd', borderBottom: '1px solid #e8e4dd', padding: '0 48px', overflowX: 'auto' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 0 }}>
            <Link href="/blog" style={{ padding: '14px 20px', fontSize: 13, fontWeight: !categoryFilter ? 600 : 400, color: !categoryFilter ? '#1a1a1a' : '#888', textDecoration: 'none', borderBottom: !categoryFilter ? '2px solid #1a1a1a' : '2px solid transparent', whiteSpace: 'nowrap' }}>All Posts ({total})</Link>
            {categories.map(cat => (
              <Link key={cat.id} href={`/blog?category=${cat.slug}`}
                style={{ padding: '14px 20px', fontSize: 13, fontWeight: categoryFilter === cat.slug ? 600 : 400, color: categoryFilter === cat.slug ? '#1a1a1a' : '#888', textDecoration: 'none', borderBottom: categoryFilter === cat.slug ? '2px solid #1a1a1a' : '2px solid transparent', whiteSpace: 'nowrap' }}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 48px' }}>
        {blogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>✍️</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, color: '#1a1a1a', marginBottom: 12 }}>No posts yet</h2>
            <p style={{ fontSize: 15, color: '#888' }}>Check back soon for new content.</p>
          </div>
        ) : (
          <>
            {/* First post big */}
            {page === 1 && blogs[0] && (
              <Link href={`/blog/${blogs[0].slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 40 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: '#f0efeb', borderRadius: 20, overflow: 'hidden', minHeight: 360 }}>
                  <div style={{ padding: '52px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {blogs[0].categories[0] && <span style={{ fontSize: 11, fontWeight: 600, color: '#4f46e5', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16, display: 'block' }}>{blogs[0].categories[0].name}</span>}
                      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: 16 }}>{blogs[0].title}</h2>
                      {blogs[0].excerpt && <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7 }}>{blogs[0].excerpt}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 32 }}>
                      <div style={{ width: 36, height: 36, background: '#1a1a1a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'white' }}>{blogs[0].author.name[0]}</div>
                      <div>
                        <div style={{ fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>{blogs[0].author.name}</div>
                        <div style={{ fontSize: 12, color: '#999' }}>{blogs[0].publishedAt ? new Date(blogs[0].publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: '#4f46e5', fontSize: 14, fontWeight: 500 }}>Read more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
                    </div>
                  </div>
                  <div style={{ minHeight: 280, background: blogs[0].featuredImage ? 'none' : 'linear-gradient(135deg, #ddd8f0 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {blogs[0].featuredImage
                      ? <img src={blogs[0].featuredImage} alt={blogs[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 80, opacity: 0.25 }}>✍️</span>}
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {(page === 1 ? blogs.slice(1) : blogs).map(blog => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'white', border: '1px solid #e8e4dd', borderRadius: 16, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ height: 200, background: 'linear-gradient(135deg, #f5f4f0 0%, #ece9e2 100%)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {blog.featuredImage
                        ? <img src={blog.featuredImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 48, opacity: 0.3 }}>✍️</span>}
                    </div>
                    <div style={{ padding: '24px 24px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {blog.categories[0] && <span style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5', letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 10 }}>{blog.categories[0].name}</span>}
                      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3, marginBottom: 12, letterSpacing: '-0.2px', flex: 1 }}>{blog.title}</h3>
                      {blog.excerpt && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.excerpt}</p>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid #f0efeb', marginTop: 'auto' }}>
                        <span style={{ fontSize: 12, color: '#888' }}>{blog.author.name}</span>
                        <span style={{ fontSize: 12, color: '#bbb' }}>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ''}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 60 }}>
                {page > 1 && <Link href={`/blog?page=${page - 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e8e4dd', borderRadius: 100, fontSize: 13, color: '#555', textDecoration: 'none' }}>← Previous</Link>}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Link key={p} href={`/blog?page=${p}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                    style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: p === page ? '#1a1a1a' : 'white', border: '1px solid #e8e4dd', borderRadius: '50%', fontSize: 13, color: p === page ? 'white' : '#555', textDecoration: 'none', fontWeight: p === page ? 600 : 400 }}>{p}</Link>
                ))}
                {page < totalPages && <Link href={`/blog?page=${page + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`} style={{ padding: '10px 20px', background: 'white', border: '1px solid #e8e4dd', borderRadius: 100, fontSize: 13, color: '#555', textDecoration: 'none' }}>Next →</Link>}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

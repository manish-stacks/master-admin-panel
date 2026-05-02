import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function RootPage() {
  const blogs = await prisma.blog.findMany({
    where: { status: 'PUBLISHED' }, take: 6,
    orderBy: { publishedAt: 'desc' },
    include: { categories: true, author: { select: { name: true } } },
  }).catch(() => [])

  const settings = await prisma.setting.findMany().catch(() => [])
  const s = Object.fromEntries(settings.map((x: any) => [x.key, x.value]))
  const siteName = s.site_name || 'NexusCMS'

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#FAFAF8', minHeight: '100vh' }}>

      {/* Nav */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e8e4dd', padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#1a1a1a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FAFAF8"><path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" /></svg>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: '#1a1a1a' }}>{siteName}</span>
        </Link>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {[['/', 'Home'], ['/about', 'About'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([href, label]) => (
            <Link key={href} href={href} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 14, color: '#555', textDecoration: 'none' }}>{label}</Link>
          ))}
          <Link href="/contact" style={{ marginLeft: 8, padding: '8px 20px', background: '#1a1a1a', color: '#FAFAF8', borderRadius: 100, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
            Get in touch →
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section style={{ minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 48px', maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 60, right: 80, width: 400, height: 400, background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 80, left: 20, width: 260, height: 260, background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0efeb', borderRadius: 100, padding: '6px 14px 6px 8px', marginBottom: 32, width: 'fit-content' }}>
          <span style={{ background: '#1a1a1a', color: 'white', borderRadius: 100, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>NEW</span>
          <span style={{ fontSize: 13, color: '#555' }}>SEO-First Headless CMS on Next.js 14</span>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(48px, 7vw, 88px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-2px', color: '#1a1a1a', maxWidth: 800, marginBottom: 28 }}>
          Manage content.<br />
          <span style={{ fontStyle: 'italic', color: '#4f46e5' }}>Rank higher.</span><br />
          Ship faster.
        </h1>

        <p style={{ fontSize: 18, color: '#666', lineHeight: 1.8, maxWidth: 520, marginBottom: 40 }}>
          A complete headless CMS with built-in SEO tools, lead management, media library, and a clean admin panel. Built for developers who care about performance.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a1a1a', color: 'white', padding: '14px 28px', borderRadius: 100, fontSize: 15, fontWeight: 500, textDecoration: 'none' }}>
            Get Started Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
          <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#1a1a1a', padding: '14px 28px', borderRadius: 100, fontSize: 15, textDecoration: 'none', border: '1px solid #d4d0c8' }}>
            Read the Blog
          </Link>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: '#999', padding: '14px 20px', borderRadius: 100, fontSize: 14, textDecoration: 'none' }}>
            Admin Panel →
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 40, marginTop: 72, paddingTop: 40, borderTop: '1px solid #e8e4dd' }}>
          {[['10x', 'Faster than WordPress'], ['95+', 'Avg SEO Score'], ['100%', 'Type-Safe'], ['∞', 'Scalable Pages']].map(([num, label]) => (
            <div key={label}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.5px' }}>{num}</div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ background: '#f0efeb', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: 16 }}>What's inside</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 700, letterSpacing: '-1px', color: '#1a1a1a', maxWidth: 480 }}>Everything you need to grow online</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            {[
              ['📄', '01', 'Dynamic Pages', 'Unlimited pages with slug routing, SEO meta, canonical URLs, and JSON-LD schema.'],
              ['✍️', '02', 'Blog System', 'Categories, tags, featured images, scheduled publishing with rich TipTap editor.'],
              ['🔍', '03', 'SEO Engine', 'Auto sitemap.xml, robots.txt editor, redirect manager, and full audit tools.'],
              ['🖼️', '04', 'Media Library', 'Cloudinary integration with drag-drop upload, alt text, and instant CDN.'],
              ['📩', '05', 'Lead CRM', 'Contact forms with status tracking, date filters, notifications, CSV export.'],
              ['⚙️', '06', 'Roles & Access', 'Super Admin, Admin, Editor, SEO Manager with granular permissions.'],
            ].map(([icon, num, title, desc], i) => (
              <div key={num} style={{ background: i % 2 === 0 ? '#FAFAF8' : '#f5f4f0', padding: '40px 36px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <span style={{ fontSize: 32 }}>{icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#ccc', letterSpacing: '1px' }}>{num}</span>
                </div>
                <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: '#1a1a1a', marginBottom: 10 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#777', lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      {blogs.length > 0 && (
        <section style={{ padding: '100px 48px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>Latest posts</div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px,3vw,44px)', fontWeight: 700, letterSpacing: '-0.8px', color: '#1a1a1a' }}>From the blog</h2>
              </div>
              <Link href="/blog" style={{ fontSize: 14, color: '#4f46e5', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                All posts
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>

            {/* Featured first post */}
            {blogs[0] && (
              <Link href={`/blog/${blogs[0].slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#1a1a1a', borderRadius: 20, overflow: 'hidden', minHeight: 320 }}>
                  <div style={{ padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {blogs[0].categories[0] && <span style={{ fontSize: 11, fontWeight: 600, color: '#a5b4fc', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16, display: 'block' }}>{blogs[0].categories[0].name}</span>}
                      <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 700, color: 'white', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: 14 }}>{blogs[0].title}</h3>
                      {blogs[0].excerpt && <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>{blogs[0].excerpt}</p>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
                      <div style={{ width: 32, height: 32, background: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
                        {blogs[0].author.name[0]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{blogs[0].author.name}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                          {blogs[0].publishedAt ? new Date(blogs[0].publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ background: blogs[0].featuredImage ? 'none' : 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, overflow: 'hidden' }}>
                    {blogs[0].featuredImage
                      ? <img src={blogs[0].featuredImage} alt={blogs[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 72, opacity: 0.25 }}>✍️</span>}
                  </div>
                </div>
              </Link>
            )}

            {/* Rest */}
            {blogs.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {blogs.slice(1).map(blog => (
                  <Link key={blog.id} href={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', border: '1px solid #e8e4dd', borderRadius: 16, overflow: 'hidden' }}>
                      <div style={{ height: 180, background: 'linear-gradient(135deg,#f5f4f0,#ece9e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {blog.featuredImage ? <img src={blog.featuredImage} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 40, opacity: 0.3 }}>✍️</span>}
                      </div>
                      <div style={{ padding: 20 }}>
                        {blog.categories[0] && <span style={{ fontSize: 10, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: 8, display: 'block' }}>{blog.categories[0].name}</span>}
                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.35, marginBottom: 10 }}>{blog.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', paddingTop: 12, borderTop: '1px solid #f0efeb' }}>
                          <span>{blog.author.name}</span>
                          <span>{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : ''}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{ padding: '0 48px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ background: '#1a1a1a', borderRadius: 24, padding: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px,3vw,44px)', fontWeight: 700, color: 'white', letterSpacing: '-0.8px', marginBottom: 12 }}>Ready to get started?</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', maxWidth: 380, lineHeight: 1.7 }}>Contact us and let's build something extraordinary together.</p>
            </div>
            <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'white', color: '#1a1a1a', padding: '16px 32px', borderRadius: 100, fontSize: 15, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Start a project
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a1a', padding: '48px 48px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: 'white' }}>{siteName}</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['/', 'Home'], ['/about', 'About'], ['/blog', 'Blog'], ['/contact', 'Contact'], ['/dashboard', 'Admin']].map(([href, label]) => (
              <Link key={href} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} {siteName}</span>
        </div>
      </footer>
    </div>
  )
}

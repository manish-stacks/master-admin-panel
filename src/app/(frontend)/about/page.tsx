import { prisma } from '@/lib/prisma'

export default async function AboutPage() {
  const page = await prisma.page.findFirst({ where: { slug: 'about-us', status: 'PUBLISHED' }, include: { seoMeta: true } })

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '100px 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#999', marginBottom: 20 }}>About us</div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(44px,6vw,80px)', fontWeight: 700, letterSpacing: '-2px', color: '#1a1a1a', lineHeight: 1.0, maxWidth: 700 }}>
          We build tools for the <span style={{ fontStyle: 'italic', color: '#4f46e5' }}>modern web.</span>
        </h1>
      </section>

      {/* Content or default */}
      {page ? (
        <section style={{ padding: '0 48px 80px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, fontSize: 17, lineHeight: 1.85, color: '#333' }}
            dangerouslySetInnerHTML={{ __html: page.content }} />
        </section>
      ) : (
        <>
          <section style={{ background: '#f0efeb', padding: '80px 48px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 700, letterSpacing: '-0.8px', color: '#1a1a1a', marginBottom: 20 }}>Our Mission</h2>
                <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: 16 }}>We believe every business deserves a powerful, fast, and SEO-optimized web presence without the complexity of traditional CMS platforms.</p>
                <p style={{ fontSize: 16, color: '#555', lineHeight: 1.8 }}>NexusCMS is built on Next.js 14 with a headless architecture, giving you the flexibility to manage content your way while delivering blazing-fast performance and exceptional SEO scores.</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                {[['🚀', 'Performance First', 'Built on Next.js 14 with SSR, SSG, and ISR support for maximum speed.'],
                  ['🔍', 'SEO Focused', 'Every feature is designed with search engine optimization in mind.'],
                  ['🛡️', 'Secure by Default', 'JWT auth, bcrypt, CSRF protection, and rate limiting out of the box.'],
                  ['⚡', 'Developer Experience', 'Clean TypeScript codebase with Prisma ORM and full type safety.']
                ].map(([icon, title, desc]) => (
                  <div key={title as string} style={{ background: 'white', padding: 24, borderRadius: 0 }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 }}>{title}</div>
                    <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section style={{ padding: '80px 48px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: '#e8e4dd', borderRadius: 20, overflow: 'hidden' }}>
                {[['10x', 'Faster than WordPress'], ['95+', 'Avg SEO Score'], ['100%', 'Type-Safe Code'], ['∞', 'Scalable Architecture']].map(([num, label]) => (
                  <div key={label} style={{ background: '#FAFAF8', padding: '48px 36px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 48, fontWeight: 700, color: '#1a1a1a', letterSpacing: '-1px', marginBottom: 8 }}>{num}</div>
                    <div style={{ fontSize: 13, color: '#888' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}

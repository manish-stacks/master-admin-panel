import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.setting.findMany().catch(() => [])
  const s = Object.fromEntries(settings.map((x: any) => [x.key, x.value]))
  const siteName = s.site_name || 'NexusCMS'

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(250,250,248,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e8e4dd',
        padding: '0 48px', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: '#1a1a1a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#FAFAF8">
              <path d="M12 2L20 7V17L12 22L4 17V7L12 2Z" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.3px' }}>
            {siteName}
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/"        style={{ padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 400, color: '#555', textDecoration: 'none' }}>Home</Link>
          <Link href="/about"   style={{ padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 400, color: '#555', textDecoration: 'none' }}>About</Link>
          <Link href="/blog"    style={{ padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 400, color: '#555', textDecoration: 'none' }}>Blog</Link>
          <Link href="/contact" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 400, color: '#555', textDecoration: 'none' }}>Contact</Link>
          <Link href="/contact" style={{
            marginLeft: 8, padding: '8px 20px',
            background: '#1a1a1a', color: '#FAFAF8',
            borderRadius: 100, fontSize: 13, fontWeight: 500, textDecoration: 'none'
          }}>
            Get in touch →
          </Link>
        </nav>
      </header>

      <main>{children}</main>

      <footer style={{ background: '#1a1a1a', color: '#FAFAF8', padding: '64px 48px 40px', marginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, marginBottom: 16 }}>{siteName}</div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 280 }}>
                A powerful, SEO-first headless CMS built on Next.js 14. Manage content, leads, and SEO from one place.
              </p>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Pages</div>
              {[['/', 'Home'], ['/about', 'About'], ['/blog', 'Blog'], ['/contact', 'Contact']].map(([href, label]) => (
                <div key={href} style={{ marginBottom: 10 }}>
                  <Link href={href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</Link>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Connect</div>
              {s.social_twitter  && <div style={{ marginBottom: 10 }}><a href={s.social_twitter}  target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Twitter / X</a></div>}
              {s.social_linkedin && <div style={{ marginBottom: 10 }}><a href={s.social_linkedin} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>LinkedIn</a></div>}
              {s.social_facebook && <div style={{ marginBottom: 10 }}><a href={s.social_facebook} target="_blank" rel="noreferrer" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Facebook</a></div>}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>Admin</div>
              <Link href="/dashboard" style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Dashboard →</Link>
            </div>
          </div>
          <div style={{ paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>Built with Next.js 14 + NexusCMS</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

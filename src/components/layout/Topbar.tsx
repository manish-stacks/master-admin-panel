'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { JWTPayload } from '@/lib/auth'

const titles: Record<string, { title: string; action?: string; actionHref?: string }> = {
  '/dashboard': { title: 'Dashboard', action: '+ New Page', actionHref: '/dashboard/pages/new' },
  '/dashboard/pages': { title: 'Pages', action: '+ New Page', actionHref: '/dashboard/pages/new' },
  '/dashboard/blogs': { title: 'Blogs', action: '+ New Post', actionHref: '/dashboard/blogs/new' },
  '/dashboard/media': { title: 'Media Library', action: 'Upload Files' },
  '/dashboard/seo': { title: 'SEO Engine', action: 'Run Audit' },
  '/dashboard/redirects': { title: 'Redirect Manager', action: '+ Add Redirect' },
  '/dashboard/leads': { title: 'Leads', action: 'Export CSV' },
  '/dashboard/settings': { title: 'Settings' },
}

export default function Topbar({ user }: { user: JWTPayload }) {
  const router = useRouter()
  const pathname = usePathname()

  const current = Object.entries(titles)
    .reverse()
    .find(([key]) => pathname.startsWith(key))

  const config = current ? current[1] : { title: 'Dashboard' }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  const now = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="cms-topbar">
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{config.title}</h1>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{now}</p>
      </div>

      <div className="search-bar" style={{ width: 220 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input placeholder="Search content…" />
      </div>

      <div className="notif-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-secondary)' }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <div className="notif-dot"></div>
      </div>

      {config.action && (
        <button
          className="btn btn-primary"
          onClick={() => config.actionHref ? router.push(config.actionHref) : undefined}
        >
          {config.action}
        </button>
      )}

      <button className="btn btn-ghost" onClick={handleLogout} style={{ fontSize: 12 }}>
        Sign out
      </button>
    </div>
  )
}

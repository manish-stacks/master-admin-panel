'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { JWTPayload } from '@/lib/auth'

const navGroups = [
  { section: 'Overview', items: [
    { href: '/dashboard', label: 'Dashboard', icon: '⊞', exact: true, roles: [] },
  ]},
  { section: 'Content', items: [
    { href: '/dashboard/pages', label: 'Pages', icon: '📄', roles: [] },
    { href: '/dashboard/blogs', label: 'Blogs', icon: '✍️', roles: [] },
    { href: '/dashboard/media', label: 'Media', icon: '🖼️', roles: [] },
  ]},
  { section: 'SEO', items: [
    { href: '/dashboard/seo', label: 'SEO Engine', icon: '🔍', roles: ['SUPER_ADMIN','ADMIN','SEO_MANAGER'] },
    { href: '/dashboard/redirects', label: 'Redirects', icon: '↩️', roles: ['SUPER_ADMIN','ADMIN','SEO_MANAGER'] },
  ]},
  { section: 'CRM', items: [
    { href: '/dashboard/leads', label: 'Leads', icon: '👤', badge: true, roles: ['SUPER_ADMIN','ADMIN'] },
  ]},
  { section: 'System', items: [
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', roles: ['SUPER_ADMIN','ADMIN'] },
  ]},
]

export default function Sidebar({ user }: { user: JWTPayload }) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href)
  const canAccess = (roles: string[]) => roles.length === 0 || roles.includes(user.role)

  return (
    <aside className="cms-sidebar">
      <div className="cms-sidebar-logo">
        <div className="cms-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2L20 7V17L12 22L4 17V7L12 2Z"/></svg>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>NexusCMS</div>
          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>v2.4.1</div>
        </div>
      </div>

      <nav className="cms-nav">
        {navGroups.map(group => {
          const visibleItems = group.items.filter(item => canAccess(item.roles))
          if (visibleItems.length === 0) return null
          return (
            <div key={group.section}>
              <div className="cms-nav-section">{group.section}</div>
              {visibleItems.map(item => (
                <Link key={item.href} href={item.href}
                  className={`cms-nav-item ${isActive(item.href, item.exact) ? 'active' : ''}`}>
                  <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span className="cms-nav-badge">!</span>}
                </Link>
              ))}
            </div>
          )
        })}

        <div style={{ marginTop: 8 }}>
          <div className="cms-nav-section">Frontend</div>
          <a href="/" target="_blank" className="cms-nav-item" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: 15 }}>🌐</span>
            <span>View Site</span>
          </a>
          <a href="/blog" target="_blank" className="cms-nav-item" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: 15 }}>📝</span>
            <span>View Blog</span>
          </a>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{user.role.replace(/_/g, ' ')}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

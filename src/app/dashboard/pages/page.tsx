'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PagesPage() {
  const router = useRouter()
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string|null>(null)
  const [statusChanging, setStatusChanging] = useState<string|null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/pages')
    const data = await res.json()
    setPages(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deletePage(id: string, title: string) {
    if (!confirm(`Delete page "${title}"? This cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/pages/${id}`, { method: 'DELETE' })
    await load()
    setDeleting(null)
  }

  async function changeStatus(id: string, status: string) {
    setStatusChanging(id)
    await fetch(`/api/pages/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    await load()
    setStatusChanging(null)
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>All Pages</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{pages.length} pages total</p>
        </div>
        <Link href="/dashboard/pages/new" className="btn btn-primary btn-sm">+ New Page</Link>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table className="cms-table">
            <thead>
              <tr><th>Title</th><th>Slug</th><th>Status</th><th>Indexing</th><th>Updated</th><th style={{width:200}}>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>Loading…</td></tr>}
              {!loading && pages.length===0 && (
                <tr><td colSpan={6} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>
                  No pages yet. <Link href="/dashboard/pages/new" style={{color:'var(--brand)'}}>Create first page →</Link>
                </td></tr>
              )}
              {pages.map(page=>(
                <tr key={page.id}>
                  <td style={{fontWeight:600,color:'var(--text-primary)'}}>{page.title}</td>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--text-tertiary)'}}>/{page.slug}</td>
                  <td>
                    <select className="form-select" style={{width:'auto',padding:'3px 8px',fontSize:11}}
                      value={page.status}
                      disabled={statusChanging===page.id}
                      onChange={e=>changeStatus(page.id,e.target.value)}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                  <td><span className={`badge ${page.seoMeta?.noIndex?'badge-warning':'badge-success'}`}>{page.seoMeta?.noIndex?'No Index':'Index'}</span></td>
                  <td style={{fontSize:12}}>{new Date(page.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <Link href={`/dashboard/pages/${page.id}`} className="btn btn-ghost btn-sm">✏️ Edit</Link>
                      <a href={`/${page.slug}`} target="_blank" className="btn btn-ghost btn-sm">👁 View</a>
                      <button className="btn btn-danger btn-sm" disabled={deleting===page.id}
                        onClick={()=>deletePage(page.id,page.title)}>
                        {deleting===page.id?'…':'🗑'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

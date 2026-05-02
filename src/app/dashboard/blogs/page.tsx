'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BlogsPage() {
  const router = useRouter()
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('')
  const [deleting, setDeleting] = useState<string|null>(null)
  const [statusChanging, setStatusChanging] = useState<string|null>(null)

  async function load(status='') {
    setLoading(true)
    const res = await fetch(`/api/blogs${status?`?status=${status}`:''}`)
    const data = await res.json()
    setBlogs(data.data||[])
    setLoading(false)
  }

  useEffect(()=>{ load(activeStatus) },[activeStatus])

  async function deleteBlog(id:string, title:string) {
    if(!confirm(`Delete "${title}"? Cannot be undone.`)) return
    setDeleting(id)
    await fetch(`/api/blogs/${id}`,{method:'DELETE'})
    await load(activeStatus)
    setDeleting(null)
  }

  async function changeStatus(id:string, status:string) {
    setStatusChanging(id)
    await fetch(`/api/blogs/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    await load(activeStatus)
    setStatusChanging(null)
  }

  const tabs = [
    {label:'All',status:''},
    {label:'Published',status:'PUBLISHED'},
    {label:'Draft',status:'DRAFT'},
    {label:'Scheduled',status:'SCHEDULED'},
  ]

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>Blog Posts</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{blogs.length} posts</p>
        </div>
        <Link href="/dashboard/blogs/new" className="btn btn-primary btn-sm">+ New Post</Link>
      </div>
      <div className="card">
        <div className="tab-list">
          {tabs.map(t=>(
            <div key={t.status} className={`tab-item ${activeStatus===t.status?'active':''}`}
              onClick={()=>setActiveStatus(t.status)} style={{cursor:'pointer'}}>{t.label}</div>
          ))}
        </div>
        <div className="table-wrapper">
          <table className="cms-table">
            <thead><tr><th>Title</th><th>Category</th><th>Author</th><th>Views</th><th>Status</th><th>Published</th><th style={{width:200}}>Actions</th></tr></thead>
            <tbody>
              {loading&&<tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>Loading…</td></tr>}
              {!loading&&blogs.length===0&&(
                <tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>
                  No posts yet. <Link href="/dashboard/blogs/new" style={{color:'var(--brand)'}}>Write first post →</Link>
                </td></tr>
              )}
              {blogs.map(blog=>(
                <tr key={blog.id}>
                  <td>
                    <div style={{fontWeight:600,color:'var(--text-primary)',marginBottom:2}}>{blog.title}</div>
                    <div style={{fontSize:11,fontFamily:'JetBrains Mono,monospace',color:'var(--text-tertiary)'}}>/blog/{blog.slug}</div>
                  </td>
                  <td>{blog.categories?.map((c:any)=><span key={c.id} className="badge badge-brand" style={{marginRight:4}}>{c.name}</span>)}</td>
                  <td style={{fontSize:13}}>{blog.author?.name}</td>
                  <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{blog.viewCount?.toLocaleString()}</td>
                  <td>
                    <select className="form-select" style={{width:'auto',padding:'3px 8px',fontSize:11}}
                      value={blog.status} disabled={statusChanging===blog.id}
                      onChange={e=>changeStatus(blog.id,e.target.value)}>
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="SCHEDULED">Scheduled</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </td>
                  <td style={{fontSize:12}}>{blog.publishedAt?new Date(blog.publishedAt).toLocaleDateString():'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <Link href={`/dashboard/blogs/${blog.id}`} className="btn btn-ghost btn-sm">✏️ Edit</Link>
                      <a href={`/blog/${blog.slug}`} target="_blank" className="btn btn-ghost btn-sm">👁</a>
                      <button className="btn btn-danger btn-sm" disabled={deleting===blog.id}
                        onClick={()=>deleteBlog(blog.id,blog.title)}>{deleting===blog.id?'…':'🗑'}</button>
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

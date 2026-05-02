'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditBlogPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'content'|'seo'|'og'>('content')
  const [categories, setCategories] = useState<any[]>([])
  const [featuredPreview, setFeaturedPreview] = useState('')
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    title:'',slug:'',excerpt:'',content:'',status:'DRAFT',featuredImage:'',
    categoryIds:[] as string[],metaTitle:'',metaDescription:'',keywords:'',noIndex:false,ogTitle:'',ogDescription:''
  })

  const upd = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))

  useEffect(()=>{
    Promise.all([
      fetch(`/api/blogs/${id}`).then(r=>r.json()),
      fetch('/api/categories').then(r=>r.json())
    ]).then(([bd,cd])=>{
      const b = bd.data
      setForm({ title:b.title,slug:b.slug,excerpt:b.excerpt||'',content:b.content||'',status:b.status,
        featuredImage:b.featuredImage||'',categoryIds:b.categories?.map((c:any)=>c.id)||[],
        metaTitle:b.seoMeta?.metaTitle||'',metaDescription:b.seoMeta?.metaDescription||'',
        keywords:b.seoMeta?.keywords||'',noIndex:b.seoMeta?.noIndex||false,
        ogTitle:b.seoMeta?.ogTitle||'',ogDescription:b.seoMeta?.ogDescription||''
      })
      if(b.featuredImage) setFeaturedPreview(b.featuredImage)
      setCategories(cd.data||[])
      setLoading(false)
    })
  },[id])

  async function handleImageUpload(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return
    const fd = new FormData(); fd.append('files',file)
    const res = await fetch('/api/upload',{method:'POST',body:fd})
    const data = await res.json()
    if(res.ok && data.data?.[0]){ upd('featuredImage',data.data[0].url); setFeaturedPreview(data.data[0].url) }
  }

  function toggleCat(id:string){ setForm(f=>({...f,categoryIds:f.categoryIds.includes(id)?f.categoryIds.filter(x=>x!==id):[...f.categoryIds,id]})) }

  async function save() {
    setSaving(true); setMsg('')
    const res = await fetch(`/api/blogs/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    const data = await res.json()
    setSaving(false)
    if(res.ok) setMsg('✅ Saved!')
    else setMsg(data.error||'Error')
  }

  async function deleteBlog() {
    if(!confirm('Delete this blog post?')) return
    await fetch(`/api/blogs/${id}`,{method:'DELETE'})
    router.push('/dashboard/blogs')
  }

  if(loading) return <div style={{padding:40,textAlign:'center',color:'var(--text-tertiary)'}}>Loading…</div>

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div><h2 style={{fontSize:18,fontWeight:700}}>Edit Blog Post</h2><p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{form.title}</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>router.push('/dashboard/blogs')}>← Back</button>
          <a href={`/blog/${form.slug}`} target="_blank" className="btn btn-ghost btn-sm">👁 Preview</a>
          <button className="btn btn-danger btn-sm" onClick={deleteBlog}>🗑 Delete</button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?'Saving…':'💾 Save'}</button>
        </div>
      </div>
      {msg&&<div style={{background:msg.startsWith('✅')?'var(--success-light)':'var(--danger-light)',border:`1px solid ${msg.startsWith('✅')?'#a7f3d0':'#fecaca'}`,borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:13,color:msg.startsWith('✅')?'var(--success)':'var(--danger)'}}>{msg}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20}}>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" style={{fontSize:16,fontWeight:600}} value={form.title} onChange={e=>upd('title',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Slug</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:13,color:'var(--text-tertiary)',flexShrink:0,fontFamily:'JetBrains Mono,monospace'}}>yourdomain.com/blog/</span>
                  <input className="form-input" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}} value={form.slug} onChange={e=>upd('slug',e.target.value)}/>
                </div>
              </div>
              <div className="form-group" style={{marginBottom:0}}><label className="form-label">Excerpt</label><textarea className="form-input form-textarea" value={form.excerpt} onChange={e=>upd('excerpt',e.target.value)}/></div>
            </div>
          </div>
          <div className="card">
            <div className="tab-list">{['content','seo','og'].map(t=><div key={t} className={`tab-item ${tab===t?'active':''}`} onClick={()=>setTab(t as any)} style={{textTransform:'capitalize'}}>{t==='og'?'Open Graph':t}</div>)}</div>
            {tab==='content'&&(
              <div>
                <div className="tiptap-toolbar">{['Bold','Italic','H1','H2','H3','• List','1. List','Quote','Code','Link'].map(t=><button key={t} className="tiptap-btn">{t}</button>)}</div>
                <div className="tiptap-content" contentEditable suppressContentEditableWarning style={{minHeight:360}}
                  dangerouslySetInnerHTML={{__html:form.content}} onInput={e=>upd('content',(e.target as HTMLElement).innerHTML)}/>
              </div>
            )}
            {tab==='seo'&&<div className="card-body">
              <div className="form-group"><label className="form-label">Meta Title ({(form.metaTitle||'').length}/60)</label><input className="form-input" maxLength={60} value={form.metaTitle} onChange={e=>upd('metaTitle',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Meta Description ({(form.metaDescription||'').length}/160)</label><textarea className="form-input form-textarea" maxLength={160} value={form.metaDescription} onChange={e=>upd('metaDescription',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Keywords</label><input className="form-input" value={form.keywords} onChange={e=>upd('keywords',e.target.value)}/></div>
              <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}><input type="checkbox" checked={form.noIndex} onChange={e=>upd('noIndex',e.target.checked)}/><span>No Index</span></label>
            </div>}
            {tab==='og'&&<div className="card-body">
              <div className="form-group"><label className="form-label">OG Title</label><input className="form-input" value={form.ogTitle} onChange={e=>upd('ogTitle',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">OG Description</label><textarea className="form-input form-textarea" value={form.ogDescription} onChange={e=>upd('ogDescription',e.target.value)}/></div>
            </div>}
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          <div className="card">
            <div className="card-header"><div style={{fontSize:13,fontWeight:600}}>Publish</div></div>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>upd('status',e.target.value)}>
                  <option value="DRAFT">📝 Draft</option><option value="PUBLISHED">✅ Published</option>
                  <option value="SCHEDULED">⏰ Scheduled</option><option value="ARCHIVED">📦 Archived</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={save} disabled={saving}>{saving?'Saving…':'💾 Save'}</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div style={{fontSize:13,fontWeight:600}}>Featured Image</div></div>
            <div className="card-body">
              {featuredPreview?<div style={{position:'relative'}}>
                <img src={featuredPreview} alt="Featured" style={{width:'100%',borderRadius:8,border:'1px solid var(--border)'}}/>
                <button onClick={()=>{setFeaturedPreview('');upd('featuredImage','')}} style={{position:'absolute',top:6,right:6,background:'var(--danger)',color:'white',border:'none',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:12}}>✕</button>
              </div>:
              <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:8,padding:20,textAlign:'center',cursor:'pointer'}}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload}/>
                <div style={{fontSize:24,marginBottom:6}}>🖼️</div>
                <div style={{fontSize:12,color:'var(--text-secondary)'}}>Click to upload</div>
              </label>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div style={{fontSize:13,fontWeight:600}}>Categories</div></div>
            <div className="card-body">
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {categories.map(cat=>(
                  <button key={cat.id} onClick={()=>toggleCat(cat.id)} className={`btn btn-sm ${form.categoryIds.includes(cat.id)?'btn-primary':'btn-ghost'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

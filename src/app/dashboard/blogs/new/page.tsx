'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NewBlogPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'content'|'seo'|'og'>('content')
  const [categories, setCategories] = useState<any[]>([])
  const [newCat, setNewCat] = useState('')
  const [addingCat, setAddingCat] = useState(false)
  const [msg, setMsg] = useState('')
  const [featuredPreview, setFeaturedPreview] = useState('')
  const [form, setForm] = useState({
    title:'',slug:'',excerpt:'',content:'',status:'DRAFT',
    featuredImage:'',categoryIds:[] as string[],
    metaTitle:'',metaDescription:'',keywords:'',noIndex:false,
    ogTitle:'',ogDescription:''
  })

  const upd = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))
  const slug = (t:string)=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

  useEffect(()=>{
    fetch('/api/categories').then(r=>r.json()).then(d=>setCategories(d.data||[]))
  },[])

  async function addCategory() {
    if(!newCat.trim()) return
    setAddingCat(true)
    const res = await fetch('/api/categories',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:newCat.trim()})})
    const data = await res.json()
    if(res.ok){ setCategories(c=>[...c,data.data]); setNewCat('') }
    setAddingCat(false)
  }

  function toggleCat(id:string) {
    setForm(f=>({...f,categoryIds:f.categoryIds.includes(id)?f.categoryIds.filter(x=>x!==id):[...f.categoryIds,id]}))
  }

  async function handleImageUpload(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if(!file) return
    const fd = new FormData()
    fd.append('files',file)
    const res = await fetch('/api/upload',{method:'POST',body:fd})
    const data = await res.json()
    if(res.ok && data.data?.[0]) {
      upd('featuredImage',data.data[0].url)
      setFeaturedPreview(data.data[0].url)
    }
  }

  async function save(status=form.status) {
    if(!form.title){ setMsg('Title is required'); return }
    setSaving(true); setMsg('')
    const res = await fetch('/api/blogs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,status})})
    const data = await res.json()
    setSaving(false)
    if(res.ok) router.push('/dashboard/blogs')
    else setMsg(data.error||'Error saving')
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div><h2 style={{fontSize:18,fontWeight:700}}>New Blog Post</h2><p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>Write and publish your post</p></div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>router.push('/dashboard/blogs')}>Cancel</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>save('DRAFT')} disabled={saving}>Save Draft</button>
          <button className="btn btn-primary btn-sm" onClick={()=>save('PUBLISHED')} disabled={saving}>{saving?'Publishing…':'Publish'}</button>
        </div>
      </div>
      {msg&&<div style={{background:'var(--danger-light)',border:'1px solid #fecaca',borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:13,color:'var(--danger)'}}>{msg}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20}}>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Post Title *</label><input className="form-input" style={{fontSize:16,fontWeight:600}} placeholder="Enter post title…" value={form.title} onChange={e=>{upd('title',e.target.value);upd('slug',slug(e.target.value))}}/></div>
              <div className="form-group"><label className="form-label">Slug</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:13,color:'var(--text-tertiary)',flexShrink:0,fontFamily:'JetBrains Mono,monospace'}}>yourdomain.com/blog/</span>
                  <input className="form-input" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}} value={form.slug} onChange={e=>upd('slug',e.target.value)}/>
                </div>
              </div>
              <div className="form-group" style={{marginBottom:0}}><label className="form-label">Excerpt</label><textarea className="form-input form-textarea" placeholder="Brief summary for listings…" value={form.excerpt} onChange={e=>upd('excerpt',e.target.value)}/></div>
            </div>
          </div>
          <div className="card">
            <div className="tab-list">{['content','seo','og'].map(t=><div key={t} className={`tab-item ${tab===t?'active':''}`} onClick={()=>setTab(t as any)} style={{textTransform:'capitalize'}}>{t==='og'?'Open Graph':t}</div>)}</div>
            {tab==='content'&&(
              <div>
                <div className="tiptap-toolbar">{['Bold','Italic','H1','H2','H3','• List','1. List','Quote','Code','Link'].map(t=><button key={t} className="tiptap-btn">{t}</button>)}</div>
                <div className="tiptap-content" contentEditable suppressContentEditableWarning style={{minHeight:360}} onInput={e=>upd('content',(e.target as HTMLElement).innerHTML)}><p>Start writing your blog post here…</p></div>
              </div>
            )}
            {tab==='seo'&&(
              <div className="card-body">
                <div className="form-group"><label className="form-label">Meta Title ({form.metaTitle.length}/60)</label><input className="form-input" maxLength={60} value={form.metaTitle} onChange={e=>upd('metaTitle',e.target.value)} placeholder="SEO optimized title"/></div>
                <div className="form-group"><label className="form-label">Meta Description ({form.metaDescription.length}/160)</label><textarea className="form-input form-textarea" maxLength={160} value={form.metaDescription} onChange={e=>upd('metaDescription',e.target.value)} placeholder="Search result description"/></div>
                <div className="form-group"><label className="form-label">Keywords</label><input className="form-input" value={form.keywords} onChange={e=>upd('keywords',e.target.value)} placeholder="nextjs, cms, seo"/></div>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}><input type="checkbox" checked={form.noIndex} onChange={e=>upd('noIndex',e.target.checked)}/><span style={{color:'var(--text-secondary)'}}>No Index</span></label>
                {form.metaTitle&&<div style={{marginTop:16,padding:14,background:'var(--bg-secondary)',borderRadius:8,border:'1px solid var(--border)'}}>
                  <div style={{fontSize:11,color:'var(--text-tertiary)',marginBottom:4}}>Search Preview</div>
                  <div style={{fontSize:14,color:'#1a0dab',fontWeight:500}}>{form.metaTitle}</div>
                  <div style={{fontSize:12,color:'#006621'}}>yourdomain.com/blog/{form.slug}</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{form.metaDescription||'No description'}</div>
                </div>}
              </div>
            )}
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
                  <option value="DRAFT">📝 Draft</option>
                  <option value="PUBLISHED">✅ Published</option>
                  <option value="SCHEDULED">⏰ Scheduled</option>
                </select>
              </div>
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>save()} disabled={saving}>{saving?'Saving…':'💾 Save'}</button>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div style={{fontSize:13,fontWeight:600}}>Featured Image</div></div>
            <div className="card-body">
              {featuredPreview?<div style={{marginBottom:8,position:'relative'}}>
                <img src={featuredPreview} alt="Featured" style={{width:'100%',borderRadius:8,border:'1px solid var(--border)'}}/>
                <button onClick={()=>{setFeaturedPreview('');upd('featuredImage','')}} style={{position:'absolute',top:6,right:6,background:'var(--danger)',color:'white',border:'none',borderRadius:6,padding:'2px 8px',cursor:'pointer',fontSize:12}}>✕</button>
              </div>:
              <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:8,padding:24,textAlign:'center',cursor:'pointer',transition:'all 0.15s'}} onMouseOver={e=>(e.currentTarget.style.borderColor='var(--brand)')} onMouseOut={e=>(e.currentTarget.style.borderColor='var(--border)')}>
                <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload}/>
                <div style={{fontSize:28,marginBottom:8}}>🖼️</div>
                <div style={{fontSize:12,color:'var(--text-secondary)',fontWeight:500}}>Click to upload image</div>
                <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:4}}>PNG, JPG, WebP · Max 10MB</div>
              </label>}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div style={{fontSize:13,fontWeight:600}}>Categories</div></div>
            <div className="card-body">
              <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
                {categories.map(cat=>(
                  <button key={cat.id} onClick={()=>toggleCat(cat.id)}
                    className={`btn btn-sm ${form.categoryIds.includes(cat.id)?'btn-primary':'btn-ghost'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:6}}>
                <input className="form-input" style={{fontSize:12}} placeholder="New category…" value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCategory()}/>
                <button className="btn btn-ghost btn-sm" onClick={addCategory} disabled={addingCat}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

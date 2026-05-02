'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditPagePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'content'|'seo'|'og'>('content')
  const [form, setForm] = useState({ title:'',slug:'',content:'',status:'DRAFT',metaTitle:'',metaDescription:'',keywords:'',canonicalUrl:'',noIndex:false,ogTitle:'',ogDescription:'' })
  const [msg, setMsg] = useState('')

  const upd = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))

  useEffect(()=>{
    fetch(`/api/pages/${id}`).then(r=>r.json()).then(data=>{
      const p = data.data
      setForm({ title:p.title,slug:p.slug,content:p.content||'',status:p.status,
        metaTitle:p.seoMeta?.metaTitle||'',metaDescription:p.seoMeta?.metaDescription||'',
        keywords:p.seoMeta?.keywords||'',canonicalUrl:p.seoMeta?.canonicalUrl||'',
        noIndex:p.seoMeta?.noIndex||false,ogTitle:p.seoMeta?.ogTitle||'',ogDescription:p.seoMeta?.ogDescription||''
      })
      setLoading(false)
    })
  },[id])

  async function save() {
    setSaving(true); setMsg('')
    const res = await fetch(`/api/pages/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if(res.ok) setMsg('✅ Saved successfully!')
    else setMsg(data.error||'Error saving')
  }

  async function deletePage() {
    if(!confirm('Delete this page? This cannot be undone.')) return
    await fetch(`/api/pages/${id}`,{method:'DELETE'})
    router.push('/dashboard/pages')
  }

  if(loading) return <div style={{padding:40,textAlign:'center',color:'var(--text-tertiary)'}}>Loading…</div>

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>Edit Page</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{form.title}</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>router.push('/dashboard/pages')}>← Back</button>
          <a href={`/${form.slug}`} target="_blank" className="btn btn-ghost btn-sm">👁 Preview</a>
          <button className="btn btn-danger btn-sm" onClick={deletePage}>🗑 Delete</button>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving?'Saving…':'💾 Save'}</button>
        </div>
      </div>
      {msg&&<div style={{background:msg.startsWith('✅')?'var(--success-light)':'var(--danger-light)',border:`1px solid ${msg.startsWith('✅')?'#a7f3d0':'#fecaca'}`,borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:13,color:msg.startsWith('✅')?'var(--success)':'var(--danger)'}}>{msg}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20}}>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body">
              <div className="form-group"><label className="form-label">Page Title</label><input className="form-input" style={{fontSize:16,fontWeight:600}} value={form.title} onChange={e=>upd('title',e.target.value)}/></div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">URL Slug</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:13,color:'var(--text-tertiary)',flexShrink:0,fontFamily:'JetBrains Mono,monospace'}}>yourdomain.com/</span>
                  <input className="form-input" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}} value={form.slug} onChange={e=>upd('slug',e.target.value)}/>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="tab-list">
              {['content','seo','og'].map(t=><div key={t} className={`tab-item ${tab===t?'active':''}`} onClick={()=>setTab(t as any)} style={{textTransform:'capitalize'}}>{t==='og'?'Open Graph':t}</div>)}
            </div>
            {tab==='content'&&(
              <div>
                <div className="tiptap-toolbar">{['Bold','Italic','H1','H2','H3','• List','1. List','Quote','Code'].map(t=><button key={t} className="tiptap-btn">{t}</button>)}</div>
                <div className="tiptap-content" contentEditable suppressContentEditableWarning style={{minHeight:320}}
                  dangerouslySetInnerHTML={{__html:form.content}}
                  onInput={e=>upd('content',(e.target as HTMLElement).innerHTML)}/>
              </div>
            )}
            {tab==='seo'&&(
              <div className="card-body">
                <div className="form-group"><label className="form-label">Meta Title ({(form.metaTitle||'').length}/60)</label><input className="form-input" maxLength={60} value={form.metaTitle} onChange={e=>upd('metaTitle',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Meta Description ({(form.metaDescription||'').length}/160)</label><textarea className="form-input form-textarea" maxLength={160} value={form.metaDescription} onChange={e=>upd('metaDescription',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Keywords</label><input className="form-input" value={form.keywords} onChange={e=>upd('keywords',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">Canonical URL</label><input className="form-input" value={form.canonicalUrl} onChange={e=>upd('canonicalUrl',e.target.value)}/></div>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}><input type="checkbox" checked={form.noIndex} onChange={e=>upd('noIndex',e.target.checked)}/><span style={{color:'var(--text-secondary)'}}>No Index</span></label>
              </div>
            )}
            {tab==='og'&&(
              <div className="card-body">
                <div className="form-group"><label className="form-label">OG Title</label><input className="form-input" value={form.ogTitle} onChange={e=>upd('ogTitle',e.target.value)}/></div>
                <div className="form-group"><label className="form-label">OG Description</label><textarea className="form-input form-textarea" value={form.ogDescription} onChange={e=>upd('ogDescription',e.target.value)}/></div>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div style={{fontSize:13,fontWeight:600}}>Publish Settings</div></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>upd('status',e.target.value)}>
                <option value="DRAFT">📝 Draft</option>
                <option value="PUBLISHED">✅ Published</option>
                <option value="ARCHIVED">📦 Archived</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={save} disabled={saving}>{saving?'Saving…':'💾 Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

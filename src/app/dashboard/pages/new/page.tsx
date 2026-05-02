'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPagePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'content'|'seo'|'og'>('content')
  const [form, setForm] = useState({ title:'',slug:'',content:'',status:'DRAFT',metaTitle:'',metaDescription:'',keywords:'',canonicalUrl:'',noIndex:false,ogTitle:'',ogDescription:'' })
  const [msg, setMsg] = useState('')

  const upd = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))
  const slug = (t:string)=>t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')

  async function save(status=form.status) {
    if(!form.title) { setMsg('Title is required'); return }
    setSaving(true); setMsg('')
    const res = await fetch('/api/pages',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form,status}) })
    const data = await res.json()
    setSaving(false)
    if(res.ok) router.push('/dashboard/pages')
    else setMsg(data.error||'Error saving')
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700}}>New Page</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>Create a new page</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className="btn btn-ghost btn-sm" onClick={()=>router.push('/dashboard/pages')}>Cancel</button>
          <button className="btn btn-ghost btn-sm" onClick={()=>save('DRAFT')} disabled={saving}>Save Draft</button>
          <button className="btn btn-primary btn-sm" onClick={()=>save('PUBLISHED')} disabled={saving}>{saving?'Saving…':'Publish'}</button>
        </div>
      </div>
      {msg&&<div style={{background:'var(--danger-light)',border:'1px solid #fecaca',borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:13,color:'var(--danger)'}}>{msg}</div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 280px',gap:20}}>
        <div>
          <div className="card" style={{marginBottom:16}}>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Page Title *</label>
                <input className="form-input" style={{fontSize:16,fontWeight:600}} placeholder="Enter page title…"
                  value={form.title} onChange={e=>{upd('title',e.target.value);upd('slug',slug(e.target.value))}}/>
              </div>
              <div className="form-group" style={{marginBottom:0}}>
                <label className="form-label">URL Slug</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:13,color:'var(--text-tertiary)',flexShrink:0,fontFamily:'JetBrains Mono,monospace'}}>yourdomain.com/</span>
                  <input className="form-input" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}} value={form.slug} onChange={e=>upd('slug',e.target.value)} placeholder="page-slug"/>
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
                <div className="tiptap-toolbar">
                  {['Bold','Italic','H1','H2','H3','• List','1. List','Quote','Code'].map(t=><button key={t} className="tiptap-btn">{t}</button>)}
                </div>
                <div className="tiptap-content" contentEditable suppressContentEditableWarning style={{minHeight:320}}
                  onInput={e=>upd('content',(e.target as HTMLElement).innerHTML)}>
                  <p>Start writing page content here…</p>
                </div>
              </div>
            )}
            {tab==='seo'&&(
              <div className="card-body">
                <div className="form-group"><label className="form-label">Meta Title ({form.metaTitle.length}/60)</label><input className="form-input" maxLength={60} value={form.metaTitle} onChange={e=>upd('metaTitle',e.target.value)} placeholder="SEO title for search results"/></div>
                <div className="form-group"><label className="form-label">Meta Description ({form.metaDescription.length}/160)</label><textarea className="form-input form-textarea" maxLength={160} value={form.metaDescription} onChange={e=>upd('metaDescription',e.target.value)} placeholder="Brief description shown in search results"/></div>
                <div className="form-group"><label className="form-label">Keywords</label><input className="form-input" value={form.keywords} onChange={e=>upd('keywords',e.target.value)} placeholder="keyword1, keyword2, keyword3"/></div>
                <div className="form-group"><label className="form-label">Canonical URL</label><input className="form-input" value={form.canonicalUrl} onChange={e=>upd('canonicalUrl',e.target.value)} placeholder="https://yourdomain.com/page"/></div>
                <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:13}}>
                  <input type="checkbox" checked={form.noIndex} onChange={e=>upd('noIndex',e.target.checked)}/>
                  <span style={{color:'var(--text-secondary)'}}>No Index (hide from search engines)</span>
                </label>
                {form.metaTitle&&(
                  <div style={{marginTop:16,padding:14,background:'var(--bg-secondary)',borderRadius:8,border:'1px solid var(--border)'}}>
                    <div style={{fontSize:11,color:'var(--text-tertiary)',marginBottom:4}}>Search Preview</div>
                    <div style={{fontSize:14,color:'#1a0dab',fontWeight:500}}>{form.metaTitle}</div>
                    <div style={{fontSize:12,color:'#006621'}}>yourdomain.com/{form.slug}</div>
                    <div style={{fontSize:12,color:'var(--text-secondary)',marginTop:2}}>{form.metaDescription||'No description set'}</div>
                  </div>
                )}
              </div>
            )}
            {tab==='og'&&(
              <div className="card-body">
                <div className="form-group"><label className="form-label">OG Title</label><input className="form-input" value={form.ogTitle} onChange={e=>upd('ogTitle',e.target.value)} placeholder="Title for social shares"/></div>
                <div className="form-group"><label className="form-label">OG Description</label><textarea className="form-input form-textarea" value={form.ogDescription} onChange={e=>upd('ogDescription',e.target.value)} placeholder="Description for social shares"/></div>
              </div>
            )}
          </div>
        </div>
        <div>
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
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>save()} disabled={saving}>{saving?'Saving…':'Save Page'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'

export default function SeoPage() {
  const [tab, setTab] = useState<'meta'|'sitemap'|'robots'|'schema'>('meta')
  const [robots, setRobots] = useState(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: https://yourdomain.com/sitemap.xml`)
  const [metaForm, setMetaForm] = useState({ defaultTitle:'NexusCMS — SEO-First Headless CMS', defaultDesc:'A powerful, SEO-first headless CMS.', gscVerification:'', defaultOgImage:'' })
  const [saving, setSaving] = useState(false)
  const [auditRunning, setAuditRunning] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)
  const [msg, setMsg] = useState('')

  async function saveMeta() {
    setSaving(true)
    await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({'default_meta_title':metaForm.defaultTitle,'default_meta_description':metaForm.defaultDesc,'gsc_verification':metaForm.gscVerification})})
    setMsg('✅ SEO settings saved!'); setSaving(false)
    setTimeout(()=>setMsg(''),3000)
  }

  async function saveRobots() {
    setSaving(true)
    await fetch('/api/seo/robots',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:robots})})
    setMsg('✅ Robots.txt saved!'); setSaving(false)
    setTimeout(()=>setMsg(''),3000)
  }

  async function runAudit() {
    setAuditRunning(true); setAuditResult(null)
    const res = await fetch('/api/audit',{method:'POST'})
    const data = await res.json()
    setAuditResult(data.data)
    setAuditRunning(false)
  }

  async function pingSitemap(engine='google') {
    const url = `https://www.${engine}.com/ping?sitemap=${encodeURIComponent((process.env.NEXT_PUBLIC_APP_URL||'https://yourdomain.com')+'/sitemap.xml')}`
    window.open(url,'_blank')
  }

  const checks = [
    {label:'Meta title set on all pages',status:'ok'},
    {label:'Meta descriptions present',status:'warn'},
    {label:'OpenGraph tags configured',status:'ok'},
    {label:'Canonical URLs set',status:'warn'},
    {label:'JSON-LD schema added',status:'error'},
    {label:'Images have alt text',status:'warn'},
    {label:'No broken internal links',status:'ok'},
    {label:'Sitemap submitted to Google',status:'error'},
  ]

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>SEO Engine</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>Site health & optimization</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={runAudit} disabled={auditRunning}>
          {auditRunning?<><span className="spinner" style={{width:14,height:14}}/> Running…</>:'🔍 Run Full Audit'}
        </button>
      </div>

      {msg&&<div style={{background:msg.startsWith('✅')?'var(--success-light)':'var(--danger-light)',border:`1px solid ${msg.startsWith('✅')?'#a7f3d0':'#fecaca'}`,borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:13,color:msg.startsWith('✅')?'var(--success)':'var(--danger)'}}>{msg}</div>}

      {auditResult&&(
        <div className="card" style={{marginBottom:20,border:`2px solid ${auditResult.score>=80?'var(--success)':auditResult.score>=60?'var(--warning)':'var(--danger)'}`}}>
          <div className="card-body">
            <div style={{display:'flex',gap:20,alignItems:'center'}}>
              <div style={{textAlign:'center',minWidth:80}}>
                <div style={{fontSize:36,fontWeight:700,color:auditResult.score>=80?'var(--success)':auditResult.score>=60?'var(--warning)':'var(--danger)',fontFamily:'JetBrains Mono,monospace'}}>{auditResult.score}</div>
                <div style={{fontSize:11,color:'var(--text-tertiary)',textTransform:'uppercase'}}>SEO Score</div>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Audit Results — {auditResult.total} pages/blogs checked</div>
                {auditResult.issues.length===0?<div style={{fontSize:13,color:'var(--success)'}}>✅ No issues found! Great SEO health.</div>:
                <div style={{display:'flex',flexDirection:'column',gap:4,maxHeight:120,overflowY:'auto'}}>
                  {auditResult.issues.map((issue:string,i:number)=><div key={i} style={{fontSize:12,color:'var(--warning)',display:'flex',gap:6}}><span>⚠️</span><span>{issue}</span></div>)}
                </div>}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="tab-list">
          {[['meta','Meta Tags'],['sitemap','Sitemap'],['robots','Robots.txt'],['schema','Schema']].map(([k,l])=>(
            <div key={k} className={`tab-item ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>{l}</div>
          ))}
        </div>

        {tab==='meta'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
            <div style={{padding:24,borderRight:'1px solid var(--border)'}}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>SEO Health Checks</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {checks.map((c,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,fontSize:13}}>
                    <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,background:c.status==='ok'?'var(--success)':c.status==='warn'?'var(--warning)':'var(--danger)'}}/>
                    <span style={{color:c.status==='error'?'var(--danger)':c.status==='warn'?'var(--warning)':'var(--text-secondary)'}}>{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:24}}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Global SEO Settings</div>
              <div className="form-group"><label className="form-label">Default Meta Title</label><input className="form-input" value={metaForm.defaultTitle} onChange={e=>setMetaForm(f=>({...f,defaultTitle:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">Default Meta Description</label><textarea className="form-input form-textarea" value={metaForm.defaultDesc} onChange={e=>setMetaForm(f=>({...f,defaultDesc:e.target.value}))}/></div>
              <div className="form-group"><label className="form-label">GSC Verification Code</label><input className="form-input" placeholder="google-site-verification=..." value={metaForm.gscVerification} onChange={e=>setMetaForm(f=>({...f,gscVerification:e.target.value}))}/></div>
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={saveMeta} disabled={saving}>{saving?'Saving…':'💾 Save SEO Settings'}</button>
            </div>
          </div>
        )}

        {tab==='sitemap'&&(
          <div style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div>
                <div style={{fontSize:13,fontWeight:600}}>Auto-Generated Sitemap</div>
                <div style={{fontSize:12,color:'var(--text-tertiary)',marginTop:2}}>Includes all published pages & blogs</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>pingSitemap('google')}>📡 Ping Google</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>pingSitemap('bing')}>📡 Ping Bing</button>
                <a href="/api/sitemap" target="_blank" className="btn btn-primary btn-sm">👁 View Sitemap</a>
              </div>
            </div>
            <div className="code-block">{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://yourdomain.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- All published pages and blogs auto-included -->
</urlset>`}</div>
            <div style={{marginTop:12,fontSize:12,color:'var(--text-tertiary)'}}>Live sitemap: <a href="/api/sitemap" style={{color:'var(--brand)'}}>yourdomain.com/sitemap.xml</a></div>
          </div>
        )}

        {tab==='robots'&&(
          <div style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:600}}>Robots.txt Editor</div>
              <div style={{display:'flex',gap:8}}>
                <a href="/api/robots" target="_blank" className="btn btn-ghost btn-sm">👁 Preview</a>
                <button className="btn btn-primary btn-sm" onClick={saveRobots} disabled={saving}>{saving?'Saving…':'💾 Save & Deploy'}</button>
              </div>
            </div>
            <textarea className="form-input form-textarea" style={{fontFamily:'JetBrains Mono,monospace',minHeight:200,fontSize:12}} value={robots} onChange={e=>setRobots(e.target.value)}/>
          </div>
        )}

        {tab==='schema'&&(
          <div style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:600}}>JSON-LD Schema Generator</div>
              <select className="form-select" style={{width:'auto',padding:'6px 10px',fontSize:12}}>
                <option>WebSite</option><option>Organization</option><option>Article</option>
                <option>BreadcrumbList</option><option>FAQPage</option><option>LocalBusiness</option>
              </select>
            </div>
            <div className="code-block">{`{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NexusCMS",
  "url": "https://yourdomain.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "{search_term_string}",
    "query-input": "required name=search_term_string"
  }
}`}</div>
            <div style={{marginTop:12,display:'flex',gap:8}}>
              <button className="btn btn-primary btn-sm">Generate Schema</button>
              <button className="btn btn-ghost btn-sm" onClick={()=>navigator.clipboard.writeText('')}>📋 Copy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useRef } from 'react'

export default function SettingsPage() {
  const [tab, setTab] = useState<'general'|'users'|'security'|'integrations'|'scripts'>('general')
  const [settings, setSettings] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const logoRef = useRef<HTMLInputElement>(null)

  useEffect(()=>{
    fetch('/api/settings').then(r=>r.json()).then(d=>{ setSettings(d.data||{}); if(d.data?.site_logo) setLogoPreview(d.data.site_logo) })
  },[])

  async function saveSettings() {
    setSaving(true); setMsg('')
    const res = await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(settings)})
    setSaving(false)
    if(res.ok){ setMsg('✅ Settings saved successfully!') } else { setMsg('❌ Error saving settings') }
    setTimeout(()=>setMsg(''),3000)
  }

  async function handleLogoUpload(e:React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if(!file) return
    const fd = new FormData(); fd.append('files',file)
    const res = await fetch('/api/upload',{method:'POST',body:fd})
    const data = await res.json()
    if(res.ok && data.data?.[0]){ setLogoPreview(data.data[0].url); setSettings((s:any)=>({...s,site_logo:data.data[0].url})) }
  }

  const upd = (k:string,v:string)=>setSettings((s:any)=>({...s,[k]:v}))

  const toggleStates: Record<string,boolean> = {
    login_notifications: settings.login_notifications==='true',
    rate_limiting: settings.rate_limiting!=='false',
    csrf_protection: settings.csrf_protection!=='false',
    two_fa: settings.two_fa==='true',
    ip_restriction: settings.ip_restriction==='true',
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div><h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>Settings</h2><p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>System configuration</p></div>
        <button className="btn btn-primary btn-sm" onClick={saveSettings} disabled={saving}>{saving?'Saving…':'💾 Save All Changes'}</button>
      </div>

      {msg&&<div style={{background:msg.startsWith('✅')?'var(--success-light)':'var(--danger-light)',border:`1px solid ${msg.startsWith('✅')?'#a7f3d0':'#fecaca'}`,borderRadius:'var(--radius)',padding:'10px 14px',marginBottom:16,fontSize:13,color:msg.startsWith('✅')?'var(--success)':'var(--danger)'}}>{msg}</div>}

      <div className="card">
        <div className="tab-list">
          {[['general','General'],['users','Users & Roles'],['security','Security'],['integrations','Integrations'],['scripts','Scripts']].map(([k,l])=>(
            <div key={k} className={`tab-item ${tab===k?'active':''}`} onClick={()=>setTab(k as any)}>{l}</div>
          ))}
        </div>

        {tab==='general'&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
            <div style={{padding:24,borderRight:'1px solid var(--border)'}}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Site Information</div>
              <div className="form-group"><label className="form-label">Site Name</label><input className="form-input" value={settings.site_name||''} onChange={e=>upd('site_name',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Site URL</label><input className="form-input" value={settings.site_url||''} onChange={e=>upd('site_url',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Admin Email</label><input className="form-input" value={settings.admin_email||''} onChange={e=>upd('admin_email',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Site Description</label><textarea className="form-input form-textarea" value={settings.site_description||''} onChange={e=>upd('site_description',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Timezone</label>
                <select className="form-select" value={settings.timezone||'Asia/Kolkata'} onChange={e=>upd('timezone',e.target.value)}>
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option><option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option><option value="UTC">UTC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Social Links</label>
                <input className="form-input" style={{marginBottom:8}} placeholder="Twitter/X URL" value={settings.social_twitter||''} onChange={e=>upd('social_twitter',e.target.value)}/>
                <input className="form-input" style={{marginBottom:8}} placeholder="LinkedIn URL" value={settings.social_linkedin||''} onChange={e=>upd('social_linkedin',e.target.value)}/>
                <input className="form-input" placeholder="Facebook URL" value={settings.social_facebook||''} onChange={e=>upd('social_facebook',e.target.value)}/>
              </div>
            </div>
            <div style={{padding:24}}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Logo & Branding</div>
              <div className="form-group">
                <label className="form-label">Site Logo</label>
                {logoPreview?(
                  <div style={{marginBottom:8,position:'relative',display:'inline-block'}}>
                    <img src={logoPreview} alt="Logo" style={{maxHeight:60,borderRadius:8,border:'1px solid var(--border)',padding:8,background:'var(--bg-secondary)'}}/>
                    <button onClick={()=>{setLogoPreview('');upd('site_logo','')}} style={{position:'absolute',top:-6,right:-6,background:'var(--danger)',color:'white',border:'none',borderRadius:'50%',width:18,height:18,cursor:'pointer',fontSize:10}}>✕</button>
                  </div>
                ):<></>}
                <label style={{display:'block',border:'2px dashed var(--border)',borderRadius:8,padding:20,textAlign:'center',cursor:'pointer',transition:'all 0.15s'}} onClick={()=>logoRef.current?.click()}>
                  <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleLogoUpload}/>
                  <div style={{fontSize:20,marginBottom:6}}>🖼️</div>
                  <div style={{fontSize:12,color:'var(--text-secondary)'}}>Click to upload logo</div>
                  <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:4}}>PNG, SVG, JPG · Recommended 200×60px</div>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Favicon URL</label>
                <input className="form-input" placeholder="/favicon.ico" value={settings.favicon||''} onChange={e=>upd('favicon',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">Default OG Image</label>
                <input className="form-input" placeholder="https://yourdomain.com/og-image.png" value={settings.og_image||''} onChange={e=>upd('og_image',e.target.value)}/>
              </div>
              <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={saveSettings} disabled={saving}>{saving?'Saving…':'💾 Save Settings'}</button>
            </div>
          </div>
        )}

        {tab==='users'&&(
          <div style={{padding:24}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:600}}>Team Members</div>
              <button className="btn btn-primary btn-sm">+ Invite User</button>
            </div>
            <table className="cms-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {[
                  {name:'Super Admin',email:'admin@example.com',role:'SUPER_ADMIN',active:true},
                  {name:'Content Editor',email:'editor@example.com',role:'EDITOR',active:true},
                  {name:'SEO Manager',email:'seo@example.com',role:'SEO_MANAGER',active:true},
                ].map(u=>(
                  <tr key={u.email}>
                    <td><div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div className="avatar" style={{width:28,height:28,fontSize:11}}>{u.name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                      <span style={{fontWeight:500,color:'var(--text-primary)'}}>{u.name}</span>
                    </div></td>
                    <td style={{fontSize:12}}>{u.email}</td>
                    <td><span className="badge badge-brand">{u.role.replace(/_/g,' ')}</span></td>
                    <td><span className={`badge ${u.active?'badge-success':'badge-neutral'}`}>{u.active?'Active':'Inactive'}</span></td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-ghost btn-sm">✏️ Edit</button>
                        {u.role!=='SUPER_ADMIN'&&<button className="btn btn-danger btn-sm">🗑 Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{marginTop:16,padding:14,background:'var(--brand-light)',borderRadius:8,border:'1px solid var(--brand-border)'}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--brand)',marginBottom:8}}>Role Permissions</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,fontSize:11}}>
                {[['SUPER_ADMIN','All Access'],['ADMIN','Content + Settings'],['EDITOR','Pages + Blogs only'],['SEO_MANAGER','SEO + Redirects']].map(([role,desc])=>(
                  <div key={role} style={{background:'white',borderRadius:6,padding:'8px 10px',border:'1px solid var(--brand-border)'}}>
                    <div style={{fontWeight:600,color:'var(--brand)',marginBottom:2}}>{role.replace(/_/g,' ')}</div>
                    <div style={{color:'var(--text-secondary)'}}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='security'&&(
          <div style={{padding:24}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Change Password</div>
                <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input"/></div>
                <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input"/></div>
                <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input"/></div>
                <button className="btn btn-primary">Update Password</button>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Security Features</div>
                {[
                  {key:'two_fa',label:'2-Factor Authentication',desc:'Add extra security'},
                  {key:'ip_restriction',label:'IP Restriction',desc:'Restrict admin by IP'},
                  {key:'login_notifications',label:'Login Notifications',desc:'Email on new logins'},
                  {key:'rate_limiting',label:'Rate Limiting',desc:'Protect API endpoints'},
                  {key:'csrf_protection',label:'CSRF Protection',desc:'Protect forms from attacks'},
                ].map(s=>(
                  <div key={s.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{s.label}</div>
                      <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:1}}>{s.desc}</div>
                    </div>
                    <button className="toggle" onClick={()=>upd(s.key,toggleStates[s.key]?'false':'true')} style={{background:toggleStates[s.key]?'var(--brand)':'var(--border-strong)'}}>
                      <div className="toggle-thumb" style={{left:toggleStates[s.key]?21:3}}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab==='integrations'&&(
          <div style={{padding:24}}>
            <div style={{fontSize:14,fontWeight:600,marginBottom:16}}>Connected Services</div>
            {[
              {key:'cloudinary',name:'Cloudinary',desc:'Media storage & image CDN',icon:'☁️',fields:[{k:'cloudinary_cloud_name',p:'Cloud Name'},{k:'cloudinary_api_key',p:'API Key'},{k:'cloudinary_api_secret',p:'API Secret',type:'password'}]},
              {key:'smtp',name:'SMTP Email',desc:'Nodemailer for notifications',icon:'📧',fields:[{k:'smtp_host',p:'SMTP Host'},{k:'smtp_port',p:'Port'},{k:'smtp_user',p:'Username'},{k:'smtp_pass',p:'Password',type:'password'}]},
              {key:'ga',name:'Google Analytics',desc:'Traffic & analytics',icon:'📊',fields:[{k:'google_analytics_id',p:'GA4 Measurement ID (G-XXXXXXX)'}]},
              {key:'gsc',name:'Google Search Console',desc:'SEO indexing',icon:'🔍',fields:[{k:'gsc_verification',p:'Verification meta tag content'}]},
            ].map(s=>(
              <div key={s.key} className="card" style={{marginBottom:12}}>
                <div style={{padding:'12px 16px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:20}}>{s.icon}</span>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{s.name}</div><div style={{fontSize:11,color:'var(--text-tertiary)'}}>{s.desc}</div></div>
                </div>
                <div style={{padding:'12px 16px',display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
                  {s.fields.map(f=>(
                    <div key={f.k}>
                      <label className="form-label">{f.p}</label>
                      <input className="form-input" type={(f as any).type||'text'} value={settings[f.k]||''} onChange={e=>upd(f.k,e.target.value)} placeholder={f.p}/>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>{saving?'Saving…':'💾 Save Integrations'}</button>
          </div>
        )}

        {tab==='scripts'&&(
          <div style={{padding:24}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Header Scripts</div>
                <div style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:10}}>Injected inside {'<head>'} on all pages</div>
                <textarea className="form-input form-textarea" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,minHeight:160}} placeholder="<!-- Google Tag Manager, analytics, etc -->"
                  value={settings.header_scripts||''} onChange={e=>upd('header_scripts',e.target.value)}/>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Footer Scripts</div>
                <div style={{fontSize:12,color:'var(--text-tertiary)',marginBottom:10}}>Injected before {'</body>'} on all pages</div>
                <textarea className="form-input form-textarea" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12,minHeight:160}} placeholder="<!-- Live chat, conversion scripts, etc -->"
                  value={settings.footer_scripts||''} onChange={e=>upd('footer_scripts',e.target.value)}/>
              </div>
            </div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={saveSettings} disabled={saving}>{saving?'Saving…':'💾 Save Scripts'}</button>
          </div>
        )}
      </div>
    </div>
  )
}

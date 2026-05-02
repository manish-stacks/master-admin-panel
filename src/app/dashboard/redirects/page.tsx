'use client'
import { useState, useEffect } from 'react'

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ fromPath:'', toPath:'', type:'PERMANENT_301' })
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/redirects')
    const data = await res.json()
    setRedirects(data.data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  async function save() {
    if(!form.fromPath||!form.toPath){ setMsg('Both paths are required'); return }
    if(!form.fromPath.startsWith('/')) { setMsg('From path must start with /'); return }
    setSaving(true); setMsg('')
    if(editing) {
      await fetch(`/api/redirects/${editing.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    } else {
      await fetch('/api/redirects',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    }
    setForm({fromPath:'',toPath:'',type:'PERMANENT_301'})
    setEditing(null)
    setSaving(false)
    await load()
  }

  async function deleteRedirect(id:string) {
    if(!confirm('Delete this redirect?')) return
    await fetch(`/api/redirects/${id}`,{method:'DELETE'})
    await load()
  }

  function startEdit(r:any) {
    setEditing(r)
    setForm({fromPath:r.fromPath,toPath:r.toPath,type:r.type})
    window.scrollTo({top:0,behavior:'smooth'})
  }

  function cancelEdit() {
    setEditing(null)
    setForm({fromPath:'',toPath:'',type:'PERMANENT_301'})
    setMsg('')
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>Redirect Manager</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{redirects.length} redirects</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-header">
          <div style={{fontSize:13,fontWeight:600}}>{editing?'✏️ Edit Redirect':'+ Add New Redirect'}</div>
          {editing&&<button className="btn btn-ghost btn-sm" onClick={cancelEdit}>Cancel</button>}
        </div>
        <div className="card-body">
          {msg&&<div style={{background:'var(--danger-light)',border:'1px solid #fecaca',borderRadius:'var(--radius)',padding:'8px 12px',marginBottom:12,fontSize:12,color:'var(--danger)'}}>{msg}</div>}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto 1fr auto auto',gap:12,alignItems:'flex-end'}}>
            <div>
              <label className="form-label">From Path</label>
              <input className="form-input" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}} placeholder="/old-path"
                value={form.fromPath} onChange={e=>setForm(f=>({...f,fromPath:e.target.value}))}/>
            </div>
            <div style={{paddingBottom:2,color:'var(--text-tertiary)',fontSize:20}}>→</div>
            <div>
              <label className="form-label">To Path</label>
              <input className="form-input" style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}} placeholder="/new-path or https://..."
                value={form.toPath} onChange={e=>setForm(f=>({...f,toPath:e.target.value}))}/>
            </div>
            <div>
              <label className="form-label">Type</label>
              <select className="form-select" style={{width:'auto'}} value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                <option value="PERMANENT_301">301 Permanent</option>
                <option value="TEMPORARY_302">302 Temporary</option>
              </select>
            </div>
            <div style={{paddingBottom:2}}>
              <button className="btn btn-primary" onClick={save} disabled={saving}>{saving?'Saving…':editing?'Update':'Add Redirect'}</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="cms-table">
          <thead><tr><th>Type</th><th>From</th><th></th><th>To</th><th>Hits</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading&&<tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>Loading…</td></tr>}
            {!loading&&redirects.length===0&&<tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>No redirects yet.</td></tr>}
            {redirects.map(r=>(
              <tr key={r.id}>
                <td><span className={`badge ${r.type==='PERMANENT_301'?'badge-info':'badge-warning'}`}>{r.type==='PERMANENT_301'?'301':'302'}</span></td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--text-secondary)'}}>{r.fromPath}</td>
                <td style={{color:'var(--text-muted)'}}>→</td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,color:'var(--brand)'}}>{r.toPath}</td>
                <td style={{fontFamily:'JetBrains Mono,monospace',fontSize:12}}>{r.hitCount}</td>
                <td><span className={`badge ${r.isActive?'badge-success':'badge-neutral'}`}>{r.isActive?'Active':'Inactive'}</span></td>
                <td>
                  <div style={{display:'flex',gap:6}}>
                    <button className="btn btn-ghost btn-sm" onClick={()=>startEdit(r)}>✏️ Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>deleteRedirect(r.id)}>🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

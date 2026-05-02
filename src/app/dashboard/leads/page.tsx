'use client'
import { useState, useEffect } from 'react'

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [updating, setUpdating] = useState<string|null>(null)

  async function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if(statusFilter) params.set('status',statusFilter)
    if(dateFrom) params.set('from',dateFrom)
    if(dateTo) params.set('to',dateTo)
    const res = await fetch(`/api/leads?${params}`)
    const data = await res.json()
    setLeads(data.data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() },[statusFilter,dateFrom,dateTo])

  async function updateStatus(id:string, status:string) {
    setUpdating(id)
    await fetch(`/api/leads/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    await load()
    if(selectedLead?.id===id) setSelectedLead((l:any)=>({...l,status}))
    setUpdating(null)
  }

  async function exportCSV() { window.open('/api/leads/export','_blank') }

  const statusColor:any = {NEW:'badge-info',CONTACTED:'badge-warning',CLOSED:'badge-success'}

  return (
    <div>
      {/* Lead detail modal */}
      {selectedLead&&(
        <div className="modal-overlay" onClick={()=>setSelectedLead(null)}>
          <div className="modal-box" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{fontSize:16,fontWeight:600}}>{selectedLead.name}</h3>
                <div style={{fontSize:12,color:'var(--text-tertiary)',marginTop:2}}>{new Date(selectedLead.createdAt).toLocaleString()}</div>
              </div>
              <button onClick={()=>setSelectedLead(null)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'var(--text-tertiary)'}}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
                <div><div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',marginBottom:4}}>Email</div><a href={`mailto:${selectedLead.email}`} style={{color:'var(--brand)',fontSize:13}}>{selectedLead.email}</a></div>
                <div><div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',marginBottom:4}}>Phone</div><div style={{fontSize:13}}>{selectedLead.phone||'—'}</div></div>
                <div><div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',marginBottom:4}}>Subject</div><div style={{fontSize:13}}>{selectedLead.subject||'—'}</div></div>
                <div><div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',marginBottom:4}}>Source</div><div style={{fontSize:13}}>{selectedLead.source||'Contact Form'}</div></div>
              </div>
              <div style={{background:'var(--bg-secondary)',borderRadius:8,padding:14,marginBottom:16,border:'1px solid var(--border)'}}>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',marginBottom:8}}>Message</div>
                <div style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.7}}>{selectedLead.message}</div>
              </div>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',marginBottom:8}}>Update Status</div>
                <div style={{display:'flex',gap:8}}>
                  {['NEW','CONTACTED','CLOSED'].map(s=>(
                    <button key={s} className={`btn btn-sm ${selectedLead.status===s?'btn-primary':'btn-ghost'}`}
                      onClick={()=>updateStatus(selectedLead.id,s)} disabled={updating===selectedLead.id}>
                      {s==='NEW'?'🔵 New':s==='CONTACTED'?'🟡 Contacted':'🟢 Closed'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <a href={`mailto:${selectedLead.email}?subject=Re: ${selectedLead.subject||'Your Enquiry'}`} className="btn btn-primary btn-sm">📧 Reply via Email</a>
              <button className="btn btn-ghost btn-sm" onClick={()=>setSelectedLead(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>Lead Management</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{leads.length} leads</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📤 Export CSV</button>
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:16}}>
        <div className="card-body" style={{padding:'14px 20px'}}>
          <div style={{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:12,fontWeight:500,color:'var(--text-secondary)'}}>Status:</span>
              {['','NEW','CONTACTED','CLOSED'].map(s=>(
                <button key={s} className={`btn btn-sm ${statusFilter===s?'btn-primary':'btn-ghost'}`} onClick={()=>setStatusFilter(s)}>
                  {s===''?'All':s}
                </button>
              ))}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginLeft:'auto'}}>
              <span style={{fontSize:12,fontWeight:500,color:'var(--text-secondary)'}}>From:</span>
              <input type="date" className="form-input" style={{width:'auto',padding:'5px 10px',fontSize:12}} value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
              <span style={{fontSize:12,color:'var(--text-tertiary)'}}>To:</span>
              <input type="date" className="form-input" style={{width:'auto',padding:'5px 10px',fontSize:12}} value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
              {(dateFrom||dateTo)&&<button className="btn btn-ghost btn-sm" onClick={()=>{setDateFrom('');setDateTo('')}}>✕ Clear</button>}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="cms-table">
          <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading&&<tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>Loading…</td></tr>}
            {!loading&&leads.length===0&&<tr><td colSpan={7} style={{textAlign:'center',padding:'40px',color:'var(--text-tertiary)'}}>No leads found.</td></tr>}
            {leads.map(lead=>(
              <tr key={lead.id} onClick={()=>setSelectedLead(lead)}>
                <td style={{fontWeight:600,color:'var(--text-primary)'}}>{lead.name}</td>
                <td><a href={`mailto:${lead.email}`} style={{color:'var(--brand)',fontSize:12}} onClick={e=>e.stopPropagation()}>{lead.email}</a></td>
                <td style={{fontSize:12}}>{lead.subject||'—'}</td>
                <td style={{fontSize:12,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'var(--text-secondary)'}}>{lead.message}</td>
                <td onClick={e=>e.stopPropagation()}>
                  <select className="form-select" style={{width:'auto',padding:'3px 8px',fontSize:11}} value={lead.status}
                    disabled={updating===lead.id} onChange={e=>updateStatus(lead.id,e.target.value)}>
                    <option value="NEW">New</option><option value="CONTACTED">Contacted</option><option value="CLOSED">Closed</option>
                  </select>
                </td>
                <td style={{fontSize:12,whiteSpace:'nowrap'}}>{new Date(lead.createdAt).toLocaleDateString()}</td>
                <td onClick={e=>e.stopPropagation()}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>setSelectedLead(lead)}>👁 View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

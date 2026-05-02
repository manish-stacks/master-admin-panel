'use client'
import { useState, useEffect, useRef } from 'react'

export default function MediaPage() {
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [copied, setCopied] = useState<string|null>(null)
  const [view, setView] = useState<'grid'|'list'>('grid')
  const [deleting, setDeleting] = useState<string|null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/media')
    const data = await res.json()
    setMedia(data.data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  async function handleUpload(files: FileList|null) {
    if(!files||files.length===0) return
    setUploading(true)
    const fd = new FormData()
    Array.from(files).forEach(f=>fd.append('files',f))
    const res = await fetch('/api/upload',{method:'POST',body:fd})
    const data = await res.json()
    if(res.ok) await load()
    else alert('Upload failed: '+(data.error||'Unknown error'))
    setUploading(false)
  }

  async function deleteMedia(id:string) {
    if(!confirm('Delete this file?')) return
    setDeleting(id)
    await fetch('/api/media',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})})
    await load()
    setDeleting(null)
  }

  function copyLink(url:string, id:string) {
    const full = url.startsWith('http')?url:window.location.origin+url
    navigator.clipboard.writeText(full)
    setCopied(id)
    setTimeout(()=>setCopied(null),2000)
  }

  function toggleSelect(id:string) {
    setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  }

  const isImage = (mime:string)=>mime?.startsWith('image/')
  const fileIcon = (mime:string)=>isImage(mime)?'🖼️':mime?.includes('pdf')?'📄':mime?.includes('video')?'🎬':'📁'
  const formatSize = (bytes:number)=>bytes>1048576?`${(bytes/1048576).toFixed(1)} MB`:`${(bytes/1024).toFixed(0)} KB`

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <div>
          <h2 style={{fontSize:18,fontWeight:700,color:'var(--text-primary)'}}>Media Library</h2>
          <p style={{fontSize:13,color:'var(--text-tertiary)',marginTop:2}}>{media.length} files</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
            <button className={`btn btn-sm ${view==='grid'?'btn-primary':'btn-ghost'}`} style={{borderRadius:0}} onClick={()=>setView('grid')}>⊞</button>
            <button className={`btn btn-sm ${view==='list'?'btn-primary':'btn-ghost'}`} style={{borderRadius:0}} onClick={()=>setView('list')}>☰</button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>inputRef.current?.click()} disabled={uploading}>
            {uploading?<><span className="spinner" style={{width:14,height:14}}/> Uploading…</>:'↑ Upload Files'}
          </button>
          <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" style={{display:'none'}}
            onChange={e=>handleUpload(e.target.files)}/>
        </div>
      </div>

      {/* Drop Zone */}
      <div style={{border:'2px dashed var(--border)',borderRadius:12,padding:20,textAlign:'center',marginBottom:20,cursor:'pointer',transition:'all 0.15s'}}
        onClick={()=>inputRef.current?.click()}
        onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--brand)';e.currentTarget.style.background='var(--brand-light)'}}
        onDragLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='transparent'}}
        onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='transparent';handleUpload(e.dataTransfer.files)}}>
        <div style={{fontSize:28,marginBottom:8}}>☁️</div>
        <div style={{fontSize:13,color:'var(--text-secondary)',fontWeight:500}}>Drag & drop files here, or click to browse</div>
        <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:4}}>Images, PDFs, Videos · Max 50MB per file</div>
      </div>

      {selected.length>0&&(
        <div style={{background:'var(--brand-light)',border:'1px solid var(--brand-border)',borderRadius:8,padding:'10px 16px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:13,color:'var(--brand)',fontWeight:500}}>{selected.length} file{selected.length>1?'s':''} selected</span>
          <div style={{display:'flex',gap:8}}>
            <button className="btn btn-ghost btn-sm" onClick={()=>selected.forEach(id=>{const m=media.find(x=>x.id===id);if(m)copyLink(m.url,m.id)})}>Copy URLs</button>
            <button className="btn btn-danger btn-sm" onClick={()=>{selected.forEach(id=>deleteMedia(id));setSelected([])}}>Delete Selected</button>
            <button className="btn btn-ghost btn-sm" onClick={()=>setSelected([])}>Clear</button>
          </div>
        </div>
      )}

      {loading?(
        <div style={{textAlign:'center',padding:60,color:'var(--text-tertiary)'}}>Loading media…</div>
      ):media.length===0?(
        <div style={{textAlign:'center',padding:60,color:'var(--text-tertiary)'}}>
          <div style={{fontSize:48,marginBottom:12}}>🖼️</div>
          <div style={{fontSize:14,fontWeight:500}}>No media files yet</div>
          <div style={{fontSize:13,marginTop:4}}>Upload your first file above</div>
        </div>
      ):view==='grid'?(
        <div className="media-grid">
          {media.map(item=>(
            <div key={item.id} className={`media-item ${selected.includes(item.id)?'selected':''}`}
              onClick={()=>toggleSelect(item.id)}>
              {isImage(item.mimeType)?(
                <img src={item.url} alt={item.filename} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              ):(
                <div style={{textAlign:'center',padding:8}}>
                  <div style={{fontSize:28,marginBottom:4}}>{fileIcon(item.mimeType)}</div>
                  <div style={{fontSize:10,color:'var(--text-tertiary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.filename}</div>
                </div>
              )}
              {selected.includes(item.id)&&<div style={{position:'absolute',top:6,right:6,width:20,height:20,background:'var(--brand)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:12}}>✓</div>}
              <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.7)',padding:'6px 8px',opacity:0,transition:'opacity 0.15s',display:'flex',gap:4}}
                onMouseOver={e=>e.currentTarget.style.opacity='1'} onMouseOut={e=>e.currentTarget.style.opacity='0'}>
                <button onClick={e=>{e.stopPropagation();copyLink(item.url,item.id)}} style={{flex:1,background:'white',border:'none',borderRadius:4,padding:'3px 6px',fontSize:10,cursor:'pointer',color:'var(--text-primary)'}}>
                  {copied===item.id?'✅ Copied!':'📋 Copy'}
                </button>
                <button onClick={e=>{e.stopPropagation();deleteMedia(item.id)}} disabled={deleting===item.id} style={{background:'var(--danger)',border:'none',borderRadius:4,padding:'3px 8px',fontSize:10,cursor:'pointer',color:'white'}}>
                  {deleting===item.id?'…':'🗑'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ):(
        <div className="card">
          <table className="cms-table">
            <thead><tr><th><input type="checkbox" onChange={e=>e.target.checked?setSelected(media.map(m=>m.id)):setSelected([])}/></th><th>File</th><th>Type</th><th>Size</th><th>Uploaded</th><th>Actions</th></tr></thead>
            <tbody>
              {media.map(item=>(
                <tr key={item.id}>
                  <td><input type="checkbox" checked={selected.includes(item.id)} onChange={()=>toggleSelect(item.id)}/></td>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      {isImage(item.mimeType)?<img src={item.url} alt="" style={{width:36,height:36,objectFit:'cover',borderRadius:6,border:'1px solid var(--border)'}}/>:<span style={{fontSize:24}}>{fileIcon(item.mimeType)}</span>}
                      <div>
                        <div style={{fontSize:12,fontWeight:500,color:'var(--text-primary)'}}>{item.filename}</div>
                        <div style={{fontSize:11,color:'var(--text-tertiary)',fontFamily:'JetBrains Mono,monospace'}}>{item.url}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-neutral">{item.mimeType?.split('/')[1]||'file'}</span></td>
                  <td style={{fontSize:12,fontFamily:'JetBrains Mono,monospace'}}>{formatSize(item.size)}</td>
                  <td style={{fontSize:12}}>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>copyLink(item.url,item.id)}>{copied===item.id?'✅ Copied!':'📋 Copy URL'}</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>deleteMedia(item.id)} disabled={deleting===item.id}>{deleting===item.id?'…':'🗑'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

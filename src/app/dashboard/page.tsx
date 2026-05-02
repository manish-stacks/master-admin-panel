import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getCurrentUser()
  const [pageCount, blogCount, leadCount, mediaCount, recentBlogs, recentActivity] = await Promise.all([
    prisma.page.count(),
    prisma.blog.count(),
    prisma.lead.count({ where: { status: 'NEW' } }),
    prisma.media.count(),
    prisma.blog.findMany({ take: 5, orderBy: { updatedAt: 'desc' }, include: { author: { select: { name: true } }, categories: true } }),
    prisma.activityLog.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } }),
  ])

  const traffic = [42,55,38,70,65,80,72,90,68,75,88,95,82,100]
  const maxT = Math.max(...traffic)

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:22,fontWeight:700,color:'var(--text-primary)'}}>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
        <p style={{color:'var(--text-tertiary)',fontSize:13,marginTop:4}}>{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
        {[
          {label:'Total Pages',value:pageCount,change:'+4 this month',up:true,color:'#4f46e5',bg:'#eef2ff',icon:'📄',href:'/dashboard/pages'},
          {label:'Blog Posts',value:blogCount,change:'+12 this month',up:true,color:'#059669',bg:'#ecfdf5',icon:'✍️',href:'/dashboard/blogs'},
          {label:'New Leads',value:leadCount,change:'+8 this week',up:true,color:'#d97706',bg:'#fffbeb',icon:'📩',href:'/dashboard/leads'},
          {label:'Media Files',value:mediaCount,change:'Total uploads',up:true,color:'#0284c7',bg:'#f0f9ff',icon:'🖼️',href:'/dashboard/media'},
        ].map(s=>(
          <Link href={s.href} key={s.label} style={{textDecoration:'none'}}>
            <div className="stat-card" style={{borderBottom:`3px solid ${s.color}`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>{s.label}</div>
                  <div style={{fontSize:30,fontWeight:700,color:'var(--text-primary)',fontFamily:'JetBrains Mono,monospace',letterSpacing:'-1px'}}>{s.value}</div>
                  <div style={{fontSize:11,marginTop:6,color:s.up?'var(--success)':'var(--danger)'}}>{s.up?'↑':'↓'} {s.change}</div>
                </div>
                <div style={{width:40,height:40,background:s.bg,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{s.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20,marginBottom:20}}>
        {/* Traffic Chart */}
        <div className="card">
          <div className="card-header">
            <div><div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>Site Traffic</div><div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>Last 14 days · Page views</div></div>
            <span style={{fontSize:11,color:'var(--brand)',cursor:'pointer',fontWeight:500}}>View Analytics →</span>
          </div>
          <div className="card-body">
            <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:22,fontWeight:700,fontFamily:'JetBrains Mono,monospace',color:'var(--brand)'}}>12,847</span>
              <span style={{fontSize:12,color:'var(--success)',fontWeight:500}}>↑ 18.2% vs last period</span>
            </div>
            <div className="traffic-bars">
              {traffic.map((v,i)=>(
                <div key={i} className={`traffic-bar ${i===traffic.length-1?'active':''}`} style={{height:`${Math.round((v/maxT)*100)}%`}} title={`${v*128} views`}/>
              ))}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
              <span style={{fontSize:10,color:'var(--text-muted)'}}>Apr 15</span>
              <span style={{fontSize:10,color:'var(--text-muted)'}}>Apr 22</span>
              <span style={{fontSize:10,color:'var(--text-muted)'}}>Today</span>
            </div>
          </div>
        </div>

        {/* SEO Overview */}
        <div className="card">
          <div className="card-header">
            <div><div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>SEO Scores</div><div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>Per-page health</div></div>
            <Link href="/dashboard/seo" style={{fontSize:11,color:'var(--brand)',textDecoration:'none',fontWeight:500}}>Manage →</Link>
          </div>
          <div className="card-body">
            <div style={{display:'flex',justifyContent:'center',marginBottom:16}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:36,fontWeight:700,color:'var(--warning)',fontFamily:'JetBrains Mono,monospace'}}>87</div>
                <div style={{fontSize:11,color:'var(--text-tertiary)',textTransform:'uppercase',letterSpacing:'0.5px'}}>Overall Score</div>
              </div>
            </div>
            {[
              {label:'Homepage',score:94,color:'var(--success)'},
              {label:'Services',score:88,color:'var(--success)'},
              {label:'About Us',score:71,color:'var(--warning)'},
              {label:'Contact',score:55,color:'var(--danger)'},
            ].map(item=>(
              <div key={item.label} className="seo-score-bar">
                <div style={{width:80,fontSize:12,color:'var(--text-secondary)',flexShrink:0}}>{item.label}</div>
                <div className="seo-bar-track"><div className="seo-bar-fill" style={{width:`${item.score}%`,background:item.color}}/></div>
                <div style={{width:28,fontSize:11,fontFamily:'JetBrains Mono,monospace',color:item.color,textAlign:'right',flexShrink:0}}>{item.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        {/* Recent Blogs */}
        <div className="card">
          <div className="card-header">
            <div><div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>Recent Posts</div><div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>Latest content</div></div>
            <Link href="/dashboard/blogs" style={{fontSize:11,color:'var(--brand)',textDecoration:'none',fontWeight:500}}>View all →</Link>
          </div>
          <div style={{padding:'4px 0'}}>
            {recentBlogs.length===0?(
              <div style={{padding:'24px',textAlign:'center',color:'var(--text-tertiary)',fontSize:13}}>No blogs yet. <Link href="/dashboard/blogs/new" style={{color:'var(--brand)'}}>Create one →</Link></div>
            ):recentBlogs.map(blog=>(
              <div key={blog.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 20px',borderBottom:'1px solid var(--border)'}}>
                <div style={{width:36,height:36,background:'var(--brand-light)',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>✍️</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:'var(--text-primary)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{blog.title}</div>
                  <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{blog.author.name} · {blog.viewCount} views</div>
                </div>
                <span className={`badge ${blog.status==='PUBLISHED'?'badge-success':blog.status==='DRAFT'?'badge-neutral':'badge-warning'}`}>{blog.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div className="card">
          <div className="card-header">
            <div><div style={{fontSize:14,fontWeight:600,color:'var(--text-primary)'}}>Recent Activity</div><div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>Audit trail</div></div>
            <span style={{fontSize:11,color:'var(--brand)',cursor:'pointer',fontWeight:500}}>View all →</span>
          </div>
          <div style={{padding:'4px 20px'}}>
            {recentActivity.length===0?[
              {icon:'✏️',bg:'var(--brand-light)',color:'var(--brand)',text:'Page updated by Admin',time:'2 min ago'},
              {icon:'✅',bg:'var(--success-light)',color:'var(--success)',text:'Blog post published',time:'1 hr ago'},
              {icon:'🖼️',bg:'#f0f9ff',color:'var(--info)',text:'Images uploaded to Media',time:'3 hrs ago'},
              {icon:'📩',bg:'var(--warning-light)',color:'var(--warning)',text:'New lead received',time:'5 hrs ago'},
              {icon:'🔄',bg:'var(--danger-light)',color:'var(--danger)',text:'Redirect rule added',time:'Yesterday'},
            ].map((a,i)=>(
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{background:a.bg,color:a.color}}>{a.icon}</div>
                <div><div style={{fontSize:13,color:'var(--text-primary)'}}>{a.text}</div><div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{a.time}</div></div>
              </div>
            )):recentActivity.map(log=>(
              <div key={log.id} className="activity-item">
                <div className="activity-icon" style={{background:'var(--brand-light)',color:'var(--brand)'}}>⚡</div>
                <div>
                  <div style={{fontSize:13,color:'var(--text-primary)'}}>{log.action} {log.entity} {log.details?`— ${log.details}`:''}</div>
                  <div style={{fontSize:11,color:'var(--text-tertiary)',marginTop:2}}>{log.user.name} · {new Date(log.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchPMS, statusColor, priorityColor, avatarColor, daysUntil } from '../../lib/api'
import styles from '../../page.module.css'

export default function ClientPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [id])

  async function load() {
    try { const d = await fetchPMS(); setData(d) } catch(e) {}
    setLoading(false)
  }

  if (loading) return <div className={styles.loader}><div className={styles.loaderMark}>W</div><p>Loading...</p></div>
  if (!data) return <div className={styles.loader}><p>Failed to load</p></div>

  const client = data.clients?.find((c:any) => c.id === id)
  if (!client) return <div className={styles.loader}><p>Client not found</p><Link href="/">← Back</Link></div>

  const tasks    = data.tasks?.filter((t:any) => t.clientId === id) || []
  const seo      = data.seo?.filter((s:any) => s.clientId === id) || []
  const domains  = data.domains?.filter((d:any) => d.clientId === id) || []
  const schedule = data.schedule?.filter((e:any) => e.clientId === id) || []

  const openTasks = tasks.filter((t:any) => t.status !== 'Completed')
  const doneTasks = tasks.filter((t:any) => t.status === 'Completed')
  const col = avatarColor(client.name)
  const today = new Date().toISOString().slice(0,10)

  const timelineItems = [
    ...tasks.map((t:any) => ({...t, _type:'task', _date:t.createdAt||''})),
    ...seo.map((s:any) => ({...s, _type:'seo', _date:s.date||''})),
    ...schedule.map((e:any) => ({...e, _type:'event', _date:e.date||''})),
  ].sort((a,b) => a._date.localeCompare(b._date))

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)'}}>
      {/* Top bar */}
      <div className="no-print" style={{background:'var(--bg2)',borderBottom:'1px solid var(--border)',padding:'12px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Link href="/" style={{textDecoration:'none',color:'var(--text2)',fontSize:13,display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:28,height:28,background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:14}}>W</div>
            PMS
          </Link>
          <span style={{color:'var(--text3)'}}>/</span>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{client.name}</span>
        </div>
        <button onClick={() => window.print()} style={{background:'var(--accent)',color:'white',border:'none',borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>🖨️ Print Report</button>
      </div>

      {/* Print header */}
      <div className="print-header" style={{padding:'20px 28px',borderBottom:'2px solid #333',marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <div style={{fontSize:22,fontWeight:800}}>Wizards Websites</div>
            <div style={{fontSize:13,color:'#666'}}>Project Report</div>
          </div>
          <div style={{textAlign:'right',fontSize:12,color:'#666'}}>
            <div>Generated: {new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div>
            <div>wizards-pms.vercel.app</div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'24px 28px'}}>

        {/* Hero */}
        <div className="card" style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:56,height:56,background:`linear-gradient(135deg,${col},${col}99)`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:24,flexShrink:0}}>{client.name.charAt(0)}</div>
              <div>
                <div style={{fontSize:22,fontWeight:800}}>{client.name}</div>
                {client.website && <a href={`https://${client.website}`} target="_blank" rel="noreferrer" style={{fontSize:13,color:'var(--accent)',textDecoration:'none'}}>{client.website} ↗</a>}
                {!client.website && client.draftUrl && <a href={`https://${client.draftUrl}`} target="_blank" rel="noreferrer" style={{fontSize:13,color:'var(--accent)',textDecoration:'none'}}>Draft: {client.draftUrl} ↗</a>}
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <span className={`badge ${statusColor(client.status)}`}>{client.status}</span>
              {client.tech && <span className="badge badge-gray">🛠 {client.tech}</span>}
            </div>
          </div>

          {/* Meta grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))',gap:10,marginTop:16,paddingTop:16,borderTop:'1px solid var(--border)'}}>
            {client.assignedDev && <MetaItem label="Developer" value={`👤 ${client.assignedDev}`} />}
            {client.assignedSEO && <MetaItem label="SEO" value={`📈 ${Array.isArray(client.assignedSEO)?client.assignedSEO.join(', '):client.assignedSEO}`} />}
            {client.assignedContent && <MetaItem label="Content" value={`✍️ ${client.assignedContent}`} />}
            {client.hostingProvider && <MetaItem label="Hosting" value={`☁️ ${client.hostingProvider}`} />}
            {client.domainProvider && <MetaItem label="Domain" value={`🌐 ${client.domainProvider}`} />}
            {client.clientContact && <MetaItem label="Contact" value={`👤 ${client.clientContact}`} />}
            {client.since && <MetaItem label="Client Since" value={`📅 ${client.since}`} />}
            {(client.city||client.state) && <MetaItem label="Location" value={`📍 ${[client.city,client.state].filter(Boolean).join(', ')}`} />}
            <MetaItem label="Open Tasks" value={String(openTasks.length)} color="var(--accent)" />
            <MetaItem label="Completed" value={String(doneTasks.length)} color="var(--green)" />
          </div>

          {client.services?.length > 0 && (
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:12}}>
              {client.services.map((s:string) => <span key={s} className="badge badge-accent">{s}</span>)}
            </div>
          )}
          {client.notes && <div style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',marginTop:12,fontSize:13,color:'var(--text2)',lineHeight:1.6,borderLeft:'3px solid var(--accent)'}}>{client.notes}</div>}
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{l:'Total Tasks',v:tasks.length,c:'var(--accent)'},{l:'Open',v:openTasks.length,c:'var(--yellow)'},{l:'Completed',v:doneTasks.length,c:'var(--green)'},{l:'SEO Activities',v:seo.length,c:'var(--purple)'}].map((s,i)=>(
            <div key={i} className="card" style={{textAlign:'center',padding:'14px 12px'}}>
              <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Open Tasks */}
        {openTasks.length > 0 && (
          <div className="card" style={{marginBottom:20,padding:0,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',fontWeight:700,fontSize:14,borderBottom:'1px solid var(--border)'}}>✅ Open Tasks ({openTasks.length})</div>
            <table>
              <thead><tr><th>Task</th><th>Type</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>{openTasks.map((t:any)=>(
                <tr key={t.id}>
                  <td><div style={{fontWeight:600}}>{t.title}</div>{t.description&&<div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{t.description}</div>}</td>
                  <td><span className="badge badge-gray">{t.type}</span></td>
                  <td style={{fontSize:12}}>{t.assignedTo}</td>
                  <td><span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                  <td style={{fontSize:12,color:t.dueDate&&t.dueDate<=today?'var(--red)':'inherit'}}>{t.dueDate||'—'}</td>
                  <td><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Timeline */}
        <div className="card" style={{marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>🕐 Project Timeline ({timelineItems.length} activities)</div>
          {timelineItems.length===0 ? <div className="empty-state"><div className="icon">📭</div><p>No activities yet</p></div> :
          <div style={{position:'relative',paddingLeft:28}}>
            <div style={{position:'absolute',left:8,top:8,bottom:8,width:2,background:'var(--border)'}}/>
            {timelineItems.map((item:any,i:number) => {
              const isActive = ['In Progress','Ongoing'].includes(item.status)
              const isDone = item.status === 'Completed'
              const isBlocked = ['Blocked','Open'].includes(item.status)
              return (
                <div key={i} style={{position:'relative',marginBottom:16}}>
                  <div style={{position:'absolute',left:-24,top:5,width:10,height:10,borderRadius:'50%',background:isDone?'var(--green)':isActive?'var(--accent)':isBlocked?'var(--red)':'var(--bg4)',border:`2px solid ${isDone?'var(--green)':isActive?'var(--accent)':isBlocked?'var(--red)':'var(--border2)'}`,zIndex:1,boxShadow:isActive?'0 0 0 3px var(--accentBg)':undefined}}/>
                  <div className="card" style={{padding:'12px 14px'}}>
                    <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                      <div style={{fontWeight:600,fontSize:13}}>
                        {item._type==='task'?'✅ ':item._type==='seo'?'📈 ':'📅 '}
                        {item.title||item.activity}
                      </div>
                      <span className={`badge ${statusColor(item.status)}`}>{item.status}</span>
                    </div>
                    {(item.description||item.notes) && <div style={{fontSize:12,color:'var(--text2)',marginTop:5,lineHeight:1.5}}>{item.description||item.notes}</div>}
                    <div style={{display:'flex',gap:12,marginTop:6,flexWrap:'wrap',fontSize:11,color:'var(--text3)'}}>
                      {item._date && <span>📅 {item._date}</span>}
                      {item.assignedTo && <span>👤 {item.assignedTo}</span>}
                      {item.priority && <span className={`badge ${priorityColor(item.priority)}`} style={{fontSize:10}}>{item.priority}</span>}
                      {item.dueDate && <span style={{color:item.dueDate<=today?'var(--red)':'inherit'}}>⏰ Due {item.dueDate}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>}
        </div>

        {/* Domains */}
        {domains.length > 0 && (
          <div className="card" style={{marginBottom:20,padding:0,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',fontWeight:700,fontSize:14,borderBottom:'1px solid var(--border)'}}>🌐 Domain & Hosting</div>
            <table>
              <thead><tr><th>Domain</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th></tr></thead>
              <tbody>{domains.map((d:any)=>(
                <tr key={d.id}>
                  <td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{d.domain} ↗</a></td>
                  <td style={{fontSize:12}}>{d.registrar||'—'}</td>
                  <td>{d.domainExpiry ? <ExpiryBadge date={d.domainExpiry}/> : <span className="badge badge-gray">Not Set</span>}</td>
                  <td style={{fontSize:12}}>{d.hostingProvider||'—'}</td>
                  <td>{d.hostingExpiry ? <ExpiryBadge date={d.hostingExpiry}/> : <span className="badge badge-gray">Not Set</span>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}

        {/* Completed Tasks */}
        {doneTasks.length > 0 && (
          <div className="card" style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>🎉 Completed Tasks ({doneTasks.length})</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {doneTasks.map((t:any)=>(
                <div key={t.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'var(--greenBg)',borderRadius:8,border:'1px solid #bbf7d0'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:13,textDecoration:'line-through',opacity:.7}}>{t.title}</div>
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{t.type} · {t.completedAt||'Completed'}</div>
                  </div>
                  <span className="badge badge-green">✓ Done</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

function MetaItem({label, value, color}: {label:string,value:string,color?:string}) {
  return (
    <div>
      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.06em',color:'var(--text3)',marginBottom:2}}>{label}</div>
      <div style={{fontSize:13,fontWeight:500,color:color||'var(--text)'}}>{value}</div>
    </div>
  )
}

function ExpiryBadge({date}: {date:string}) {
  const days = daysUntil(date)!
  if (days < 0) return <span className="badge badge-red">Expired</span>
  if (days < 30) return <span className="badge badge-red">{days}d left</span>
  if (days < 90) return <span className="badge badge-yellow">{days}d</span>
  return <span className="badge badge-green">{new Date(date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
}

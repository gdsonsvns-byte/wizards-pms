'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.css'

const API = 'https://pms.wizards.co.in/api.php?action=get_all'
type Tab = 'overview'|'clients'|'tasks'|'seo'|'domains'|'schedule'|'team'

const TODAY = new Date().toISOString().slice(0,10)

function priorityColor(p:string){ if(p==='Critical')return'badge-red'; if(p==='High')return'badge-red'; if(p==='Medium')return'badge-yellow'; return'badge-blue'; }
function statusColor(s:string){
  if(['Active','Completed','Live','Ongoing'].includes(s))return'badge-green'
  if(['In Progress','Review Pending','Active - Dev'].includes(s))return'badge-accent'
  if(['Pending','Upcoming','Resuming','Pending Approval','Details Pending','Planned'].includes(s))return'badge-yellow'
  if(['Overdue','Blocked','Open'].includes(s))return'badge-red'
  return'badge-gray'
}
function timelineClass(s:string){
  if(s==='Completed')return'completed'
  if(['In Progress','Ongoing'].includes(s))return'active'
  if(['Blocked','Open'].includes(s))return'blocked'
  return'pending'
}
function daysUntil(d:string){ if(!d)return null; return Math.ceil((new Date(d).getTime()-Date.now())/86400000) }
function expiryBadge(d:string){
  if(!d)return<span className="badge badge-gray">Not Set</span>
  const days=daysUntil(d)!
  if(days<0)return<span className="badge badge-red">Expired</span>
  if(days<30)return<span className="badge badge-red">{days}d left</span>
  if(days<90)return<span className="badge badge-yellow">{days}d left</span>
  return<span className="badge badge-green">{new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
}
function avatarColor(name:string){
  const colors=['#3b5bdb','#0d9e6e','#d97706','#7c3aed','#dc2626','#ea580c','#2563eb','#0891b2']
  let h=0; for(const c of name) h=(h*31+c.charCodeAt(0))&0xFFFF
  return colors[h%colors.length]
}

// ── Project Detail ──────────────────────────────────────────
function ProjectDetail({client,tasks,seo,schedule,domains,onBack}:any){
  const clientTasks=tasks.filter((t:any)=>t.clientId===client.id)
  const clientSEO=seo.filter((s:any)=>s.clientId===client.id)
  const clientEvents=schedule.filter((e:any)=>e.clientId===client.id)
  const clientDomains=domains.filter((d:any)=>d.clientId===client.id)
  const timelineItems=[
    ...clientTasks.map((t:any)=>({...t,_type:'task',_date:t.createdAt||''})),
    ...clientSEO.map((s:any)=>({...s,_type:'seo',_date:s.date||''})),
    ...clientEvents.map((e:any)=>({...e,_type:'event',_date:e.date||''})),
  ].sort((a,b)=>a._date.localeCompare(b._date))
  const openTasks=clientTasks.filter((t:any)=>t.status!=='Completed')
  const done=clientTasks.filter((t:any)=>t.status==='Completed')
  const col=avatarColor(client.name)
  return(
    <div className={styles.projectDetail}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Clients</button>
      <div className={styles.projectHero}>
        <div className={styles.projectHeroTop}>
          <div className={styles.projectHeroLeft}>
            <div className={styles.projectBigAvatar} style={{background:`linear-gradient(135deg,${col},${col}99)`}}>{client.name.charAt(0)}</div>
            <div>
              <div className={styles.projectHeroName}>{client.name}</div>
              {client.website?<a href={`https://${client.website}`} target="_blank" rel="noreferrer" className={styles.projectHeroUrl}>{client.website} ↗</a>
              :client.draftUrl?<a href={`https://${client.draftUrl}`} target="_blank" rel="noreferrer" className={styles.projectHeroUrl}>Draft ↗</a>
              :<span style={{fontSize:12,color:'var(--text3)'}}>No URL yet</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            <span className={`badge ${statusColor(client.status)}`}>{client.status}</span>
            {client.tech&&<span className="badge badge-gray">🛠 {client.tech}</span>}
          </div>
        </div>
        <div className={styles.projectMetaGrid}>
          {client.assignedDev&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Developer</span><span className={styles.projectMetaValue}>👤 {client.assignedDev}</span></div>}
          {client.assignedSEO&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>SEO</span><span className={styles.projectMetaValue}>📈 {Array.isArray(client.assignedSEO)?client.assignedSEO.join(', '):client.assignedSEO}</span></div>}
          {client.assignedContent&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Content</span><span className={styles.projectMetaValue}>✍️ {client.assignedContent}</span></div>}
          {client.hostingProvider&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Hosting</span><span className={styles.projectMetaValue}>☁️ {client.hostingProvider}</span></div>}
          {client.domainProvider&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Domain</span><span className={styles.projectMetaValue}>🌐 {client.domainProvider}</span></div>}
          {client.since&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Since</span><span className={styles.projectMetaValue}>📅 {client.since}</span></div>}
          <div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Open Tasks</span><span className={styles.projectMetaValue} style={{color:'var(--accent)',fontWeight:700}}>{openTasks.length}</span></div>
          <div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Completed</span><span className={styles.projectMetaValue} style={{color:'var(--green)',fontWeight:700}}>{done.length}</span></div>
        </div>
        {client.services?.length>0&&<div style={{marginTop:12,display:'flex',gap:6,flexWrap:'wrap'}}>{client.services.map((s:string)=><span key={s} className="badge badge-accent">{s}</span>)}</div>}
        {client.notes&&<div className={styles.projectNotes}>📝 {client.notes}</div>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[{l:'Total Tasks',v:clientTasks.length,c:'var(--accent)'},{l:'Open',v:openTasks.length,c:'var(--yellow)'},{l:'Completed',v:done.length,c:'var(--green)'},{l:'SEO Activities',v:clientSEO.length,c:'var(--purple)'}].map((s,i)=>(
          <div key={i} className="card" style={{textAlign:'center',padding:'16px 12px'}}><div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{s.l}</div></div>
        ))}
      </div>
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>🕐 Project Timeline</div>
        {timelineItems.length===0?<div className="empty-state"><div className="icon">📭</div><p>No activities yet</p></div>:
        <div className={styles.timeline}>{timelineItems.map((item:any,i:number)=>(
          <div key={i} className={`${styles.timelineItem} ${styles[timelineClass(item.status)]}`}>
            <div className={styles.timelineCard}>
              <div className={styles.timelineHeader}>
                <div className={styles.timelineTitle}>{item._type==='task'?'✅ ':item._type==='seo'?'📈 ':'📅 '}{item.title||item.activity}</div>
                <span className={`badge ${statusColor(item.status)}`}>{item.status}</span>
              </div>
              {(item.description||item.notes)&&<div className={styles.timelineDesc}>{item.description||item.notes}</div>}
              <div className={styles.timelineMeta}>
                {item._date&&<span className={styles.timelineMetaItem}>📅 {item._date}</span>}
                {item.assignedTo&&<span className={styles.timelineMetaItem}>👤 {item.assignedTo}</span>}
                {item.priority&&<span className={`badge ${priorityColor(item.priority)}`} style={{fontSize:10}}>{item.priority}</span>}
                {item.dueDate&&<span className={styles.timelineMetaItem} style={{color:daysUntil(item.dueDate)!<3?'var(--red)':'inherit'}}>⏰ Due {item.dueDate}</span>}
              </div>
            </div>
          </div>
        ))}</div>}
      </div>
      {clientDomains.length>0&&(
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>🌐 Domain & Hosting</div>
          <table><thead><tr><th>Domain</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th><th>SSL</th></tr></thead>
          <tbody>{clientDomains.map((d:any)=>(
            <tr key={d.id}><td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{d.domain} ↗</a></td>
            <td style={{fontSize:12}}>{d.registrar||'—'}</td><td>{expiryBadge(d.domainExpiry)}</td>
            <td style={{fontSize:12}}>{d.hostingProvider||'—'}</td><td>{expiryBadge(d.hostingExpiry)}</td><td>{expiryBadge(d.sslExpiry)}</td></tr>
          ))}</tbody></table>
        </div>
      )}
    </div>
  )
}

// ── Team Detail ─────────────────────────────────────────────
function TeamDetail({member,tasks,onBack}:any){
  const myTasks=tasks.filter((t:any)=>t.assignedTo===member.name)
  const doneTasks=myTasks.filter((t:any)=>t.status==='Completed')
  const openTasks=myTasks.filter((t:any)=>t.status!=='Completed')
  const highTasks=myTasks.filter((t:any)=>t.priority==='High'&&t.status!=='Completed')
  const blockedTasks=myTasks.filter((t:any)=>['Blocked','Open'].includes(t.status))

  // Group open tasks by client
  const byClient:{[k:string]:any[]}={}
  openTasks.forEach((t:any)=>{ const k=t.clientName||'Unknown'; if(!byClient[k])byClient[k]=[]; byClient[k].push(t) })

  // Daily log: completed tasks grouped by completedAt date
  const completedByDate:{[k:string]:any[]}={}
  doneTasks.forEach((t:any)=>{ const k=t.completedAt||'Unknown Date'; if(!completedByDate[k])completedByDate[k]=[]; completedByDate[k].push(t) })

  // Planned tasks: split by has-date vs no-date
  const plannedWithDate=openTasks.filter((t:any)=>t.dueDate).sort((a:any,b:any)=>a.dueDate.localeCompare(b.dueDate))
  const plannedNoDate=openTasks.filter((t:any)=>!t.dueDate)

  const col=avatarColor(member.name)
  const initials=member.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)

  return(
    <div className={styles.projectDetail}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Team</button>

      {/* Hero */}
      <div className={styles.projectHero}>
        <div className={styles.projectHeroTop}>
          <div className={styles.projectHeroLeft}>
            <div className={styles.projectBigAvatar} style={{background:`linear-gradient(135deg,${col},${col}aa)`}}>{initials}</div>
            <div>
              <div className={styles.projectHeroName}>{member.name}</div>
              <div style={{fontSize:13,color:'var(--text2)',marginTop:3}}>{member.designation}</div>
              {member.isSeniorPartner&&<span className="badge badge-purple" style={{marginTop:6,display:'inline-flex'}}>⭐ Senior Partner</span>}
            </div>
          </div>
          <span className={`badge ${statusColor(member.status)}`}>{member.status}</span>
        </div>
        {member.skills?.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:14}}>{member.skills.map((s:string)=><span key={s} className="badge badge-gray">🏷 {s}</span>)}</div>}
        {member.responsibilities&&<div className={styles.projectNotes} style={{marginTop:12}}>📋 {member.responsibilities}</div>}
        <div className={styles.projectMetaGrid} style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
          {[{l:'Total',v:myTasks.length,c:'var(--accent)'},{l:'Open',v:openTasks.length,c:'var(--yellow)'},{l:'Completed',v:doneTasks.length,c:'var(--green)'},{l:'High Priority',v:highTasks.length,c:'var(--red)'},{l:'Blocked',v:blockedTasks.length,c:'var(--red)'},{l:'Projects',v:Object.keys(byClient).length,c:'var(--purple)'}].map((s,i)=>(
            <div key={i} className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>{s.l}</span><span className={styles.projectMetaValue} style={{color:s.c,fontWeight:700}}>{s.v}</span></div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {myTasks.length>0&&(
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📊 Overall Progress</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,height:10,background:'var(--bg3)',borderRadius:10,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.round(doneTasks.length/myTasks.length*100)}%`,background:'linear-gradient(90deg,var(--green),#34d399)',borderRadius:10,transition:'width .5s'}}/>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:'var(--green)',whiteSpace:'nowrap'}}>{Math.round(doneTasks.length/myTasks.length*100)}% done</span>
          </div>
          <div style={{display:'flex',gap:16,marginTop:10,flexWrap:'wrap'}}>
            {[{l:'Completed',c:doneTasks.length,co:'var(--green)'},{l:'In Progress',c:myTasks.filter((t:any)=>t.status==='In Progress').length,co:'var(--accent)'},{l:'Pending',c:myTasks.filter((t:any)=>t.status==='Pending').length,co:'var(--yellow)'},{l:'Ongoing',c:myTasks.filter((t:any)=>t.status==='Ongoing').length,co:'var(--blue)'},{l:'Blocked',c:blockedTasks.length,co:'var(--red)'}].map(s=>(
              <div key={s.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:s.co}}/><span style={{color:'var(--text2)'}}>{s.l}:</span><span style={{fontWeight:700,color:s.co}}>{s.c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PLANNED TASKS ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>📋 Planned Tasks</div>
        {openTasks.length===0
          ?<div className="empty-state"><div className="icon">🎉</div><p>No pending tasks!</p></div>
          :<div style={{display:'flex',flexDirection:'column',gap:20}}>

            {/* With due date — grouped by date */}
            {plannedWithDate.length>0&&(
              <div>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text3)',marginBottom:10}}>📅 Scheduled by Date</div>
                {(() => {
                  const byDate:{[k:string]:any[]}={}
                  plannedWithDate.forEach((t:any)=>{ if(!byDate[t.dueDate])byDate[t.dueDate]=[]; byDate[t.dueDate].push(t) })
                  return Object.entries(byDate).map(([date,dateTasks]:any)=>(
                    <div key={date} style={{marginBottom:16}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                        <div style={{padding:'3px 12px',background:date<=TODAY?'var(--redBg)':'var(--blueBg)',color:date<=TODAY?'var(--red)':'var(--blue)',borderRadius:20,fontSize:12,fontWeight:700}}>
                          {date<=TODAY?'⚠️ Overdue: ':'📅 '}{date}
                        </div>
                        <div style={{flex:1,height:1,background:'var(--border)'}}/>
                        <span style={{fontSize:11,color:'var(--text3)'}}>{dateTasks.length} task{dateTasks.length>1?'s':''}</span>
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:8,paddingLeft:8}}>
                        {dateTasks.map((t:any)=>(
                          <div key={t.id} style={{background:'var(--bg3)',borderRadius:9,padding:'10px 14px',border:'1px solid var(--border)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                            <div style={{flex:1}}>
                              <div style={{fontWeight:600,fontSize:13}}>{t.title}</div>
                              <div style={{fontSize:11,color:'var(--text3)',marginTop:3}}>🏢 {t.clientName} · 🏷 {t.type}</div>
                              {t.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:4,lineHeight:1.5}}>{t.description}</div>}
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end',flexShrink:0}}>
                              <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
                              <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            )}

            {/* No due date */}
            {plannedNoDate.length>0&&(
              <div>
                <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.08em',color:'var(--text3)',marginBottom:10}}>📌 Planned — No Date Set ({plannedNoDate.length})</div>
                {Object.entries((() => {
                  const bc:{[k:string]:any[]}={}
                  plannedNoDate.forEach((t:any)=>{ const k=t.clientName||'Unknown'; if(!bc[k])bc[k]=[]; bc[k].push(t) })
                  return bc
                })()).map(([clientName,cTasks]:any)=>(
                  <div key={clientName} style={{marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',marginBottom:6,display:'flex',alignItems:'center',gap:6}}>
                      🏢 {clientName} <span style={{color:'var(--text3)',fontWeight:400}}>({cTasks.length})</span>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:8}}>
                      {cTasks.map((t:any)=>(
                        <div key={t.id} style={{background:'var(--bg3)',borderRadius:9,padding:'10px 14px',border:'1px solid var(--border)',display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
                          <div style={{flex:1}}>
                            <div style={{fontWeight:600,fontSize:13}}>{t.title}</div>
                            {t.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:3,lineHeight:1.5}}>{t.description}</div>}
                            <div style={{fontSize:11,color:'var(--text3)',marginTop:3}}>🏷 {t.type}</div>
                          </div>
                          <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end',flexShrink:0}}>
                            <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
                            <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
      </div>

      {/* ── DAILY LOG ── */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>📆 Daily Task Log — Completed</div>
        {doneTasks.length===0
          ?<div className="empty-state"><div className="icon">📭</div><p>No completed tasks yet</p></div>
          :<div style={{display:'flex',flexDirection:'column',gap:16}}>
            {Object.entries(completedByDate).sort((a,b)=>b[0].localeCompare(a[0])).map(([date,dateTasks]:any)=>(
              <div key={date}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <div style={{padding:'3px 12px',background:'var(--greenBg)',color:'var(--green)',borderRadius:20,fontSize:12,fontWeight:700}}>✅ {date==='Unknown Date'?'Date not recorded':date}</div>
                  <div style={{flex:1,height:1,background:'var(--border)'}}/>
                  <span style={{fontSize:11,color:'var(--text3)'}}>{dateTasks.length} completed</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:8}}>
                  {dateTasks.map((t:any)=>(
                    <div key={t.id} style={{background:'var(--greenBg)',borderRadius:9,padding:'10px 14px',border:'1px solid #bbf7d0',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,textDecoration:'line-through',opacity:.7}}>{t.title}</div>
                        <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>🏢 {t.clientName} · 🏷 {t.type}</div>
                      </div>
                      <span className="badge badge-green">✓ Done</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────
export default function Dashboard(){
  const [tab,setTab]=useState<Tab>('overview')
  const [data,setData]=useState<any>(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState('')
  const [lastUpdated,setLastUpdated]=useState('')
  const [selectedClient,setSelectedClient]=useState<any>(null)
  const [selectedMember,setSelectedMember]=useState<any>(null)

  useEffect(()=>{ fetchData(); const t=setInterval(fetchData,60000); return()=>clearInterval(t) },[])

  async function fetchData(){
    try{
      const res=await fetch(API+'&t='+Date.now())
      const json=await res.json()
      if(json.status==='ok'){ setData(json.data); setLastUpdated(json.timestamp); setError('') }
      else setError('Failed to load data')
    }catch(e){ setError('Cannot connect to database') }
    setLoading(false)
  }

  function goToTab(t:Tab){ setTab(t); setSelectedClient(null); setSelectedMember(null) }

  if(loading)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',flexDirection:'column',gap:14}}>
      <div style={{width:40,height:40,background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:20}}>W</div>
      <div style={{color:'var(--text2)',fontSize:13}}>Loading PMS data...</div>
    </div>
  )
  if(error)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',flexDirection:'column',gap:10}}>
      <div style={{fontSize:28}}>⚠️</div><div style={{color:'var(--red)',fontSize:13}}>{error}</div>
      <button onClick={fetchData} style={{padding:'8px 18px',background:'var(--accent)',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,marginTop:4}}>Retry</button>
    </div>
  )

  const clients=data.clients||[], tasks=data.tasks||[], seo=data.seo||[]
  const domains=data.domains||[], schedule=data.schedule||[], team=data.team||[]
  const pendingTasks=tasks.filter((t:any)=>t.status!=='Completed')
  const highPriority=tasks.filter((t:any)=>['High','Critical'].includes(t.priority)&&t.status!=='Completed')
  const upcomingEvents=schedule.filter((e:any)=>new Date(e.date)>=new Date()).slice(0,5)
  const activeClients=clients.filter((c:any)=>['Active','In Progress','Active - Dev'].includes(c.status))

  const tabs:{id:Tab;label:string;icon:string;count?:number}[]=[
    {id:'overview',label:'Overview',icon:'⚡'},
    {id:'clients',label:'Clients',icon:'🏢',count:clients.length},
    {id:'tasks',label:'Tasks',icon:'✅',count:pendingTasks.length},
    {id:'seo',label:'SEO',icon:'📈',count:seo.length},
    {id:'domains',label:'Domains',icon:'🌐',count:domains.length},
    {id:'schedule',label:'Schedule',icon:'📅',count:upcomingEvents.length},
    {id:'team',label:'Team',icon:'👥',count:team.length},
  ]

  const Sidebar=()=>(
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>W</div>
        <div><div className={styles.logoName}>Wizards</div><div className={styles.logoSub}>Websites PMS</div></div>
      </div>
      <nav className={styles.nav}>
        {tabs.map(t=>(
          <button key={t.id} className={`${styles.navItem} ${tab===t.id&&!selectedClient&&!selectedMember?styles.navActive:''}`} onClick={()=>goToTab(t.id)}>
            <span className={styles.navIcon}>{t.icon}</span>
            <span className={styles.navLabel}>{t.label}</span>
            {t.count!==undefined&&<span className={styles.navCount}>{t.count}</span>}
          </button>
        ))}
      </nav>
      <div className={styles.sidebarFooter}>
        <div className={styles.agencyBadge}><div className={styles.agencyDot}></div><span>Live Database</span></div>
        <div className={styles.lastUpdated}>{lastUpdated?'Updated '+new Date(lastUpdated).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'Auto-refresh 60s'}</div>
      </div>
    </aside>
  )

  const Header=({title,sub}:{title:string,sub:string})=>(
    <header className={styles.header}>
      <div><h1 className={styles.pageTitle}>{title}</h1><p className={styles.pageSubtitle}>{sub}</p></div>
      <div className={styles.headerMeta}>
        <button onClick={fetchData} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text2)',padding:'6px 12px',cursor:'pointer',fontSize:12}}>🔄 Refresh</button>
        <span className={styles.dateChip}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</span>
      </div>
    </header>
  )

  // Team member detail
  if(selectedMember)return(
    <div className={styles.shell}><Sidebar/>
      <main className={styles.main}>
        <Header title={`👤 ${selectedMember.name}`} sub={`${selectedMember.designation} · Planned tasks & daily log`}/>
        <div className={styles.content}><TeamDetail member={selectedMember} tasks={tasks} onBack={()=>setSelectedMember(null)}/></div>
      </main>
    </div>
  )

  // Client detail
  if(selectedClient)return(
    <div className={styles.shell}><Sidebar/>
      <main className={styles.main}>
        <Header title={`🏢 ${selectedClient.name}`} sub="Full project timeline and details"/>
        <div className={styles.content}><ProjectDetail client={selectedClient} tasks={tasks} seo={seo} schedule={schedule} domains={domains} onBack={()=>setSelectedClient(null)}/></div>
      </main>
    </div>
  )

  return(
    <div className={styles.shell}><Sidebar/>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}</h1>
            <p className={styles.pageSubtitle}>
              {tab==='overview'&&'Agency performance at a glance — click any card to drill down'}
              {tab==='clients'&&'Click any client to view full project timeline'}
              {tab==='tasks'&&'All tasks and action items across clients'}
              {tab==='seo'&&'SEO activities and optimisation log'}
              {tab==='domains'&&'Domain, hosting & SSL tracker'}
              {tab==='schedule'&&'Upcoming events and meetings'}
              {tab==='team'&&'Click any member to view their planned tasks & daily log'}
            </p>
          </div>
          <div className={styles.headerMeta}>
            <button onClick={fetchData} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text2)',padding:'6px 12px',cursor:'pointer',fontSize:12}}>🔄 Refresh</button>
            <span className={styles.dateChip}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</span>
          </div>
        </header>

        <div className={styles.content}>

          {/* ── OVERVIEW ── */}
          {tab==='overview'&&(
            <div>
              {/* Stat cards — clickable, navigate to tab */}
              <div className={styles.statsGrid}>
                {[
                  {label:'Total Clients',value:clients.length,icon:'🏢',color:'var(--accent)',tab:'clients' as Tab},
                  {label:'Active Tasks',value:pendingTasks.length,icon:'✅',color:'var(--blue)',tab:'tasks' as Tab},
                  {label:'High Priority',value:highPriority.length,icon:'🔥',color:'var(--red)',tab:'tasks' as Tab},
                  {label:'SEO Activities',value:seo.length,icon:'📈',color:'var(--green)',tab:'seo' as Tab},
                  {label:'Domains',value:domains.length,icon:'🌐',color:'var(--yellow)',tab:'domains' as Tab},
                  {label:'Team Members',value:team.length,icon:'👥',color:'var(--orange)',tab:'team' as Tab},
                ].map((s,i)=>(
                  <div key={i} className={`card ${styles.statCard}`} style={{cursor:'pointer'}} onClick={()=>setTab(s.tab)} title={`Go to ${s.label}`}>
                    <div className={styles.statIcon} style={{color:s.color}}>{s.icon}</div>
                    <div className={styles.statValue} style={{color:s.color}}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                    <div style={{fontSize:10,color:'var(--text3)',marginTop:4}}>click to view →</div>
                  </div>
                ))}
              </div>

              <div className={styles.overviewGrid}>
                {/* High Priority Tasks */}
                <div className="card">
                  <h3 className={styles.cardTitle}>🔥 High Priority Tasks <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('tasks')}>view all →</span></h3>
                  {highPriority.length===0?<div className="empty-state"><div className="icon">✨</div><p>All clear!</p></div>:
                  <div className={styles.taskList}>{highPriority.slice(0,5).map((t:any)=>(
                    <div key={t.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{t.title}</div><div className={styles.taskMeta}>{t.clientName} · {t.assignedTo}</div></div>
                      <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                    </div>
                  ))}</div>}
                </div>

                {/* Upcoming Events */}
                <div className="card">
                  <h3 className={styles.cardTitle}>📅 Upcoming Events <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('schedule')}>view all →</span></h3>
                  {upcomingEvents.length===0?<div className="empty-state"><div className="icon">📭</div><p>No upcoming events</p></div>:
                  <div className={styles.taskList}>{upcomingEvents.map((e:any)=>(
                    <div key={e.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{e.title}</div><div className={styles.taskMeta}>{e.clientName} · {e.date}</div></div>
                      <span className="badge badge-accent">{e.type}</span>
                    </div>
                  ))}</div>}
                </div>

                {/* Active Projects — clickable to project detail */}
                <div className="card">
                  <h3 className={styles.cardTitle}>🏢 Active Projects <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('clients')}>view all →</span></h3>
                  <div className={styles.taskList}>{activeClients.slice(0,6).map((c:any)=>(
                    <div key={c.id} className={styles.taskItem} style={{cursor:'pointer'}} onClick={()=>{setSelectedClient(c);setTab('clients')}} title={`View ${c.name} project`}>
                      <div><div className={styles.taskTitle}>{c.name}</div><div className={styles.taskMeta}>{c.website||c.draftUrl||'No URL'}</div></div>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                        <span style={{fontSize:14,color:'var(--accent)'}}>→</span>
                      </div>
                    </div>
                  ))}</div>
                </div>

                {/* Team — clickable to member detail */}
                <div className="card">
                  <h3 className={styles.cardTitle}>👥 Team <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('team')}>view all →</span></h3>
                  <div className={styles.taskList}>{team.map((m:any)=>(
                    <div key={m.id} className={styles.taskItem} style={{cursor:'pointer'}} onClick={()=>setSelectedMember(m)} title={`View ${m.name}'s tasks`}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(m.name)},${avatarColor(m.name)}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:800,flexShrink:0}}>
                          {m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                        </div>
                        <div><div className={styles.taskTitle}>{m.name}</div><div className={styles.taskMeta}>{m.role} · {tasks.filter((t:any)=>t.assignedTo===m.name&&t.status!=='Completed').length} open tasks</div></div>
                      </div>
                      <span style={{fontSize:14,color:'var(--accent)'}}>→</span>
                    </div>
                  ))}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {tab==='clients'&&(
            <div className={styles.clientGrid}>
              {clients.map((c:any)=>(
                <div key={c.id} className={`card ${styles.clientCard}`} style={{cursor:'pointer'}} onClick={()=>setSelectedClient(c)}>
                  <div className={styles.clientHeader}>
                    <div className={styles.clientAvatar} style={{background:`linear-gradient(135deg,${avatarColor(c.name)},${avatarColor(c.name)}99)`}}>{c.name.charAt(0)}</div>
                    <div>
                      <div className={styles.clientName}>{c.name}</div>
                      {c.website?<span className={styles.clientSite}>{c.website} ↗</span>:c.draftUrl?<span className={styles.clientSite}>Draft ↗</span>:<span style={{fontSize:12,color:'var(--text3)'}}>No URL</span>}
                    </div>
                    <span className={`badge ${statusColor(c.status)} ${styles.clientStatus}`}>{c.status}</span>
                  </div>
                  {c.tech&&<div className={styles.clientDetail}>🛠️ {c.tech}</div>}
                  {c.assignedDev&&<div className={styles.clientDetail}>👤 {c.assignedDev}</div>}
                  {c.notes&&<div className={styles.clientNotes}>{c.notes}</div>}
                  <div className={styles.clientStats}>
                    <div className={styles.clientStat}><span style={{color:'var(--accent)'}}>{tasks.filter((t:any)=>t.clientId===c.id&&t.status!=='Completed').length}</span><small>Open Tasks</small></div>
                    <div className={styles.clientStat}><span style={{color:'var(--green)'}}>{tasks.filter((t:any)=>t.clientId===c.id&&t.status==='Completed').length}</span><small>Done</small></div>
                    <div className={styles.clientStat}><span style={{color:'var(--purple)'}}>{seo.filter((s:any)=>s.clientId===c.id).length}</span><small>SEO</small></div>
                  </div>
                  <div style={{fontSize:11,color:'var(--accent)',textAlign:'right',marginTop:2,fontWeight:600}}>View timeline →</div>
                </div>
              ))}
            </div>
          )}

          {/* ── TASKS ── */}
          {tab==='tasks'&&(
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Task</th><th>Client</th><th>Type</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>{tasks.map((t:any)=>(
                  <tr key={t.id}>
                    <td><div style={{fontWeight:600}}>{t.title}</div>{t.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{t.description}</div>}</td>
                    <td style={{fontSize:12,whiteSpace:'nowrap'}}>{t.clientName}</td>
                    <td><span className="badge badge-gray">{t.type}</span></td>
                    <td style={{fontSize:12,whiteSpace:'nowrap',cursor:'pointer',color:'var(--accent)'}} onClick={()=>{const m=team.find((tm:any)=>tm.name===t.assignedTo);if(m)setSelectedMember(m)}}>{t.assignedTo}</td>
                    <td><span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                    <td style={{fontSize:12,color:t.dueDate&&daysUntil(t.dueDate)!<3?'var(--red)':'var(--text2)'}}>{t.dueDate||'—'}</td>
                    <td><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ── SEO ── */}
          {tab==='seo'&&(
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Activity</th><th>Client</th><th>Assigned</th><th>Date/Period</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>{seo.map((s:any)=>(
                  <tr key={s.id}>
                    <td style={{fontWeight:600}}>{s.activity}</td>
                    <td>{s.clientName}</td>
                    <td style={{fontSize:12}}>{s.assignedTo}</td>
                    <td style={{fontSize:12}}>{s.period||s.date}</td>
                    <td><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
                    <td style={{color:'var(--text2)',maxWidth:240,fontSize:12}}>{s.notes||'—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ── DOMAINS ── */}
          {tab==='domains'&&(
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Domain</th><th>Client</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th><th>SSL</th></tr></thead>
                <tbody>{domains.map((d:any)=>(
                  <tr key={d.id}>
                    <td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{d.domain} ↗</a></td>
                    <td>{d.clientName}</td>
                    <td style={{fontSize:12}}>{d.registrar||'—'}</td>
                    <td>{expiryBadge(d.domainExpiry)}</td>
                    <td style={{fontSize:12}}>{d.hostingProvider||'—'}</td>
                    <td>{expiryBadge(d.hostingExpiry)}</td>
                    <td>{expiryBadge(d.sslExpiry)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ── SCHEDULE ── */}
          {tab==='schedule'&&(
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Event</th><th>Client</th><th>Date</th><th>Time</th><th>Type</th><th>Status</th></tr></thead>
                <tbody>{schedule.map((e:any)=>(
                  <tr key={e.id}>
                    <td><div style={{fontWeight:600}}>{e.title}</div>{e.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{e.description}</div>}</td>
                    <td>{e.clientName}</td>
                    <td style={{fontSize:12,color:e.date&&daysUntil(e.date)!<0?'var(--red)':'inherit'}}>{e.date}</td>
                    <td style={{fontSize:12}}>{e.time||'—'}</td>
                    <td><span className="badge badge-accent">{e.type}</span></td>
                    <td><span className={`badge ${statusColor(e.status)}`}>{e.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ── TEAM ── */}
          {tab==='team'&&(
            <div className={styles.clientGrid}>
              {team.map((m:any)=>{
                const mTasks=tasks.filter((t:any)=>t.assignedTo===m.name)
                const mOpen=mTasks.filter((t:any)=>t.status!=='Completed').length
                const mDone=mTasks.filter((t:any)=>t.status==='Completed').length
                const col=avatarColor(m.name)
                return(
                  <div key={m.id} className={`card ${styles.clientCard}`} style={{cursor:'pointer'}} onClick={()=>setSelectedMember(m)}>
                    <div className={styles.clientHeader}>
                      <div className={styles.clientAvatar} style={{background:`linear-gradient(135deg,${col},${col}99)`,fontSize:14}}>{m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                      <div><div className={styles.clientName}>{m.name}</div><div style={{fontSize:12,color:'var(--text2)'}}>{m.designation}</div></div>
                      <span className={`badge ${statusColor(m.status)} ${styles.clientStatus}`}>{m.status}</span>
                    </div>
                    {m.isSeniorPartner&&<span className="badge badge-purple">⭐ Senior Partner</span>}
                    <div className={styles.serviceChips}>{(m.skills||[]).slice(0,4).map((s:string)=><span key={s} className="badge badge-gray">{s}</span>)}</div>
                    {m.responsibilities&&<div className={styles.clientNotes}>{m.responsibilities}</div>}
                    <div className={styles.clientStats}>
                      <div className={styles.clientStat}><span style={{color:'var(--accent)'}}>{mOpen}</span><small>Open</small></div>
                      <div className={styles.clientStat}><span style={{color:'var(--green)'}}>{mDone}</span><small>Done</small></div>
                      <div className={styles.clientStat}><span style={{color:'var(--red)'}}>{mTasks.filter((t:any)=>['Blocked','Open'].includes(t.status)).length}</span><small>Blocked</small></div>
                    </div>
                    <div style={{fontSize:11,color:'var(--accent)',textAlign:'right',marginTop:2,fontWeight:600}}>View tasks & log →</div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

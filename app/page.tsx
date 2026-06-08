'use client'
import { useState } from 'react'
import clientsData from '../data/clients.json'
import tasksData from '../data/tasks.json'
import seoData from '../data/seo.json'
import domainsData from '../data/domains.json'
import scheduleData from '../data/schedule.json'
import teamData from '../data/team.json'
import styles from './page.module.css'

type Tab = 'overview' | 'clients' | 'tasks' | 'seo' | 'domains' | 'schedule' | 'team'

function priorityColor(p: string) {
  if (p === 'High') return 'badge-red'
  if (p === 'Medium') return 'badge-yellow'
  return 'badge-blue'
}
function statusColor(s: string) {
  if (['Active','Completed','Live','Ongoing'].includes(s)) return 'badge-green'
  if (['In Progress','Review Pending'].includes(s)) return 'badge-blue'
  if (['Pending','Upcoming','Resuming','Pending Approval'].includes(s)) return 'badge-yellow'
  if (s === 'Overdue') return 'badge-red'
  return 'badge-gray'
}
function daysUntil(dateStr: string) {
  if (!dateStr) return null
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
}
function expiryBadge(dateStr: string) {
  if (!dateStr) return <span className="badge badge-gray">Not Set</span>
  const days = daysUntil(dateStr)!
  if (days < 0) return <span className="badge badge-red">Expired</span>
  if (days < 30) return <span className="badge badge-red">{days}d left</span>
  if (days < 90) return <span className="badge badge-yellow">{days}d left</span>
  return <span className="badge badge-green">{new Date(dateStr).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview')
  const clients = clientsData as any[]
  const tasks = tasksData as any[]
  const seo = seoData as any[]
  const domains = domainsData as any[]
  const schedule = scheduleData as any[]
  const team = teamData as any[]

  const pendingTasks = tasks.filter(t => t.status !== 'Completed')
  const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed')
  const upcomingEvents = schedule.filter(e => new Date(e.date) >= new Date()).slice(0, 5)
  const activeClients = clients.filter(c => c.status === 'Active' || c.status === 'In Progress')

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: '⚡' },
    { id: 'clients', label: 'Clients', icon: '🏢', count: clients.length },
    { id: 'tasks', label: 'Tasks', icon: '✅', count: pendingTasks.length },
    { id: 'seo', label: 'SEO', icon: '📈', count: seo.length },
    { id: 'domains', label: 'Domains', icon: '🌐', count: domains.length },
    { id: 'schedule', label: 'Schedule', icon: '📅', count: upcomingEvents.length },
    { id: 'team', label: 'Team', icon: '👥', count: team.length },
  ]

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>W</div>
          <div><div className={styles.logoName}>Wizards</div><div className={styles.logoSub}>Websites PMS</div></div>
        </div>
        <nav className={styles.nav}>
          {tabs.map(t => (
            <button key={t.id} className={`${styles.navItem} ${tab===t.id?styles.navActive:''}`} onClick={()=>setTab(t.id)}>
              <span className={styles.navIcon}>{t.icon}</span>
              <span className={styles.navLabel}>{t.label}</span>
              {t.count!==undefined&&<span className={styles.navCount}>{t.count}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.agencyBadge}><div className={styles.agencyDot}></div><span>Agency Active</span></div>
          <div className={styles.lastUpdated}>Updated 08 Jun 2026</div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}</h1>
            <p className={styles.pageSubtitle}>
              {tab==='overview'&&'Agency performance at a glance'}
              {tab==='clients'&&'All client accounts and services'}
              {tab==='tasks'&&'Tasks and action items across all clients'}
              {tab==='seo'&&'SEO activities and optimisation log'}
              {tab==='domains'&&'Domain, hosting & SSL tracker'}
              {tab==='schedule'&&'Upcoming events and meetings'}
              {tab==='team'&&'Team members, roles and responsibilities'}
            </p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.dateChip}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long',year:'numeric'})}</span>
          </div>
        </header>

        <div className={styles.content}>

          {/* ── OVERVIEW ── */}
          {tab==='overview'&&(
            <div>
              <div className={styles.statsGrid}>
                {[
                  {label:'Total Clients',value:clients.length,icon:'🏢',color:'var(--accent)'},
                  {label:'Active Tasks',value:pendingTasks.length,icon:'✅',color:'var(--blue)'},
                  {label:'High Priority',value:highPriority.length,icon:'🔥',color:'var(--red)'},
                  {label:'SEO Activities',value:seo.length,icon:'📈',color:'var(--green)'},
                  {label:'Domains Tracked',value:domains.length,icon:'🌐',color:'var(--yellow)'},
                  {label:'Team Members',value:team.length,icon:'👥',color:'var(--orange)'},
                ].map((s,i)=>(
                  <div key={i} className={`card ${styles.statCard}`}>
                    <div className={styles.statIcon} style={{color:s.color}}>{s.icon}</div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.overviewGrid}>
                <div className="card">
                  <h3 className={styles.cardTitle}>🔥 High Priority Tasks</h3>
                  {highPriority.length===0?<div className="empty-state"><div className="icon">✨</div><p>No high priority tasks</p></div>:
                  <div className={styles.taskList}>{highPriority.slice(0,5).map((t:any)=>(
                    <div key={t.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{t.title}</div><div className={styles.taskMeta}>{t.clientName} · {t.assignedTo}</div></div>
                      <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                    </div>
                  ))}</div>}
                </div>
                <div className="card">
                  <h3 className={styles.cardTitle}>📅 Upcoming Events</h3>
                  {upcomingEvents.length===0?<div className="empty-state"><div className="icon">📭</div><p>No upcoming events</p></div>:
                  <div className={styles.taskList}>{upcomingEvents.map((e:any)=>(
                    <div key={e.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{e.title}</div><div className={styles.taskMeta}>{e.clientName} · {e.date}</div></div>
                      <span className={`badge badge-blue`}>{e.type}</span>
                    </div>
                  ))}</div>}
                </div>
                <div className="card">
                  <h3 className={styles.cardTitle}>🏢 Active Projects</h3>
                  <div className={styles.taskList}>{activeClients.map((c:any)=>(
                    <div key={c.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{c.name}</div><div className={styles.taskMeta}>{c.website||c.draftUrl||'No URL yet'}</div></div>
                      <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                    </div>
                  ))}</div>
                </div>
                <div className="card">
                  <h3 className={styles.cardTitle}>👥 Team Overview</h3>
                  <div className={styles.taskList}>{team.map((m:any)=>(
                    <div key={m.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{m.name}</div><div className={styles.taskMeta}>{m.role}</div></div>
                      <span className={`badge ${statusColor(m.status)}`}>{m.status}</span>
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
                <div key={c.id} className={`card ${styles.clientCard}`}>
                  <div className={styles.clientHeader}>
                    <div className={styles.clientAvatar}>{c.name.charAt(0)}</div>
                    <div>
                      <div className={styles.clientName}>{c.name}</div>
                      {c.website?<a href={`https://${c.website}`} target="_blank" rel="noreferrer" className={styles.clientSite}>{c.website} ↗</a>:
                      c.draftUrl?<a href={`https://${c.draftUrl}`} target="_blank" rel="noreferrer" className={styles.clientSite}>Draft ↗</a>:
                      <span className={styles.clientSite}>No URL yet</span>}
                    </div>
                    <span className={`badge ${statusColor(c.status)} ${styles.clientStatus}`}>{c.status}</span>
                  </div>
                  {c.tech&&<div className={styles.clientDetail}>🛠️ {c.tech}</div>}
                  {c.assignedDev&&<div className={styles.clientDetail}>👤 {c.assignedDev}</div>}
                  {(c.city||c.state)&&<div className={styles.clientDetail}>📍 {[c.city,c.state].filter(Boolean).join(', ')}</div>}
                  <div className={styles.serviceChips}>{c.services.map((s:string)=><span key={s} className="badge badge-purple">{s}</span>)}</div>
                  {c.notes&&<div className={styles.clientNotes}>{c.notes}</div>}
                  <div className={styles.clientStats}>
                    <div className={styles.clientStat}><span>{tasks.filter(t=>t.clientId===c.id&&t.status!=='Completed').length}</span><small>Open Tasks</small></div>
                    <div className={styles.clientStat}><span>{seo.filter(s=>s.clientId===c.id).length}</span><small>SEO Activities</small></div>
                    <div className={styles.clientStat}><span>{schedule.filter(e=>e.clientId===c.id&&new Date(e.date)>=new Date()).length}</span><small>Upcoming</small></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TASKS ── */}
          {tab==='tasks'&&(
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Task</th><th>Client</th><th>Type</th><th>Assigned To</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
                <tbody>{tasks.map((t:any)=>(
                  <tr key={t.id}>
                    <td><div style={{fontWeight:500}}>{t.title}</div>{t.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{t.description}</div>}</td>
                    <td style={{whiteSpace:'nowrap'}}>{t.clientName}</td>
                    <td><span className="badge badge-purple">{t.type}</span></td>
                    <td style={{fontSize:12}}>{t.assignedTo}</td>
                    <td><span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                    <td style={{color:t.dueDate&&daysUntil(t.dueDate)!<3?'var(--red)':'inherit',fontSize:12}}>{t.dueDate||'—'}</td>
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
                <thead><tr><th>Activity</th><th>Client</th><th>Assigned To</th><th>Date</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>{seo.map((s:any)=>(
                  <tr key={s.id}>
                    <td style={{fontWeight:500}}>{s.activity}</td>
                    <td>{s.clientName}</td>
                    <td style={{fontSize:12}}>{s.assignedTo}</td>
                    <td style={{fontSize:12}}>{s.date}</td>
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
                <thead><tr><th>Domain</th><th>Client</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th><th>SSL Expiry</th></tr></thead>
                <tbody>{domains.map((d:any)=>(
                  <tr key={d.id}>
                    <td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent2)',textDecoration:'none'}}>{d.domain} ↗</a></td>
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
                    <td><div style={{fontWeight:500}}>{e.title}</div>{e.description&&<div style={{fontSize:12,color:'var(--text2)',marginTop:2}}>{e.description}</div>}</td>
                    <td>{e.clientName}</td>
                    <td style={{fontSize:12}}>{e.date}</td>
                    <td style={{fontSize:12}}>{e.time||'—'}</td>
                    <td><span className="badge badge-blue">{e.type}</span></td>
                    <td><span className={`badge ${statusColor(e.status)}`}>{e.status}</span></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ── TEAM ── */}
          {tab==='team'&&(
            <div className={styles.clientGrid}>
              {team.map((m:any)=>(
                <div key={m.id} className={`card ${styles.clientCard}`}>
                  <div className={styles.clientHeader}>
                    <div className={styles.clientAvatar} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>{m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                    <div>
                      <div className={styles.clientName}>{m.name}</div>
                      <div style={{fontSize:12,color:'var(--text2)'}}>{m.designation}</div>
                    </div>
                    <span className={`badge ${statusColor(m.status)} ${styles.clientStatus}`}>{m.status}</span>
                  </div>
                  <div className={styles.serviceChips}>{m.skills.map((s:string)=><span key={s} className="badge badge-blue">{s}</span>)}</div>
                  {m.responsibilities&&<div className={styles.clientNotes}>{m.responsibilities}</div>}
                  <div className={styles.clientStats}>
                    <div className={styles.clientStat}><span>{tasks.filter(t=>t.assignedTo===m.name&&t.status!=='Completed').length}</span><small>Open Tasks</small></div>
                    <div className={styles.clientStat}><span>{tasks.filter(t=>t.assignedTo===m.name&&t.status==='Completed').length}</span><small>Completed</small></div>
                    <div className={styles.clientStat}><span>{m.assignedClients?.length||0}</span><small>Clients</small></div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

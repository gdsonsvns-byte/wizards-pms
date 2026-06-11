'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchPMS, statusColor, priorityColor, avatarColor, getClientCategory, slugify, daysUntil } from './lib/api'
import styles from './page.module.css'

function UserBadge() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const raw = localStorage.getItem('pms_user')
    if (raw) setUser(JSON.parse(raw))
  }, [])

  function logout() {
    localStorage.removeItem('pms_user')
    router.push('/login')
  }

  if (!user) return null

  const initials = user.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)

  return (
    <div style={{marginTop:10,padding:'8px 10px',background:'var(--bg3)',borderRadius:9,border:'1px solid var(--border)'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
        <div style={{width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:10,fontWeight:800,flexShrink:0}}>{initials}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.name}</div>
          <div style={{fontSize:10,color:'var(--text3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user.email}</div>
        </div>
      </div>
      <button onClick={logout} style={{width:'100%',padding:'5px',background:'transparent',border:'1px solid var(--border)',borderRadius:6,fontSize:11,color:'var(--text3)',cursor:'pointer',fontFamily:'inherit',transition:'all .15s'}}
        onMouseOver={e=>(e.currentTarget.style.background='var(--bg4)')}
        onMouseOut={e=>(e.currentTarget.style.background='transparent')}>
        Sign Out
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Record<string,boolean>>({maintenance:true, prospective:true})
  const [tab, setTab] = useState('overview')

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  async function load() {
    try { const d = await fetchPMS(); setData(d) } catch(e) {}
    setLoading(false)
  }

  if (loading) return <div className={styles.loader}><div className={styles.loaderMark}>W</div><p>Loading...</p></div>
  if (!data) return <div className={styles.loader}><p style={{color:'var(--red)'}}>Failed to load. <button onClick={load}>Retry</button></p></div>

  const clients = data.clients || [], tasks = data.tasks || [], seo = data.seo || []
  const domains = data.domains || [], team = data.team || []

  const pendingTasks = tasks.filter((t:any) => t.status !== 'Completed')
  const highPri = tasks.filter((t:any) => ['High','Critical'].includes(t.priority) && t.status !== 'Completed')
  // Upcoming: tasks with due dates in the future
  const upcoming = tasks.filter((t:any) => t.dueDate && t.dueDate >= new Date().toISOString().slice(0,10) && t.status !== 'Completed').sort((a:any,b:any) => a.dueDate.localeCompare(b.dueDate)).slice(0,6)

  // Client categories
  const activeClients = clients.filter((c:any) => getClientCategory(c) === 'active')
  const maintenanceClients = clients.filter((c:any) => getClientCategory(c) === 'maintenance')
  const prospectiveClients = clients.filter((c:any) => getClientCategory(c) === 'prospective')

  // Search filter
  const filterClients = (list: any[]) => search
    ? list.filter((c:any) => c.name.toLowerCase().includes(search.toLowerCase()) || (c.website||'').toLowerCase().includes(search.toLowerCase()))
    : list

  const tabs = [
    {id:'overview',label:'Overview',icon:'⚡'},
    {id:'clients',label:'Clients',icon:'🏢',count:activeClients.length},
    {id:'tasks',label:'Tasks',icon:'✅',count:pendingTasks.length},
    {id:'seo',label:'SEO',icon:'📈',count:seo.length},
    {id:'domains',label:'Domains',icon:'🌐',count:domains.length},
    {id:'team',label:'Team',icon:'👥',count:team.length},
  ]

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>W</div>
          <div><div className={styles.logoName}>Wizards</div><div className={styles.logoSub}>PMS</div></div>
        </div>
        <nav className={styles.nav}>
          {tabs.map(t => (
            <button key={t.id} className={`${styles.navItem} ${tab===t.id?styles.navActive:''}`} onClick={() => setTab(t.id)}>
              <span className={styles.navIcon}>{t.icon}</span>
              <span className={styles.navLabel}>{t.label}</span>
              {t.count !== undefined && <span className={styles.navCount}>{t.count}</span>}
            </button>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <div className={styles.agencyBadge}><div className={styles.agencyDot}></div><span>Live</span></div>
          <UserBadge /></div>
      </aside>

      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}</h1>
          </div>
          <div className={styles.headerMeta}>
            <button onClick={load} className="no-print" style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text2)',padding:'6px 12px',cursor:'pointer',fontSize:12}}>🔄</button>
            <span className={styles.dateChip}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span>
          </div>
        </header>

        <div className={styles.content}>

          {/* ── OVERVIEW ── */}
          {tab==='overview' && (
            <div>
              <div className={styles.statsGrid}>
                {[
                  {l:'Active Clients',v:activeClients.length,ic:'🏢',c:'var(--accent)',t:'clients'},
                  {l:'Open Tasks',v:pendingTasks.length,ic:'✅',c:'var(--blue)',t:'tasks'},
                  {l:'High Priority',v:highPri.length,ic:'🔥',c:'var(--red)',t:'tasks'},
                  {l:'SEO Activities',v:seo.length,ic:'📈',c:'var(--green)',t:'seo'},
                  {l:'Domains',v:domains.length,ic:'🌐',c:'var(--yellow)',t:'domains'},
                  {l:'Team',v:team.length,ic:'👥',c:'var(--orange)',t:'team'},
                ].map((s,i) => (
                  <div key={i} className={`card ${styles.statCard}`} style={{cursor:'pointer'}} onClick={() => setTab(s.t)}>
                    <div style={{fontSize:22,marginBottom:6}}>{s.ic}</div>
                    <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{s.l}</div>
                    <div style={{fontSize:10,color:'var(--text3)',marginTop:3}}>click →</div>
                  </div>
                ))}
              </div>

              <div className={styles.overviewGrid}>
                {/* High Priority */}
                <div className="card">
                  <div className={styles.cardTitle}>🔥 High Priority <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('tasks')}>view all →</span></div>
                  {highPri.length===0?<div className="empty-state"><div className="icon">✨</div><p>All clear</p></div>:
                  <div className={styles.taskList}>{highPri.slice(0,5).map((t:any)=>(
                    <div key={t.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{t.title}</div><div className={styles.taskMeta}>{t.clientName} · {t.assignedTo}</div></div>
                      <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                    </div>
                  ))}</div>}
                </div>

                {/* Upcoming — driven from task due dates */}
                <div className="card">
                  <div className={styles.cardTitle}>📅 Upcoming Due <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('tasks')}>view all →</span></div>
                  {upcoming.length===0?<div className="empty-state"><div className="icon">📭</div><p>No upcoming due dates</p></div>:
                  <div className={styles.taskList}>{upcoming.map((t:any)=>(
                    <div key={t.id} className={styles.taskItem}>
                      <div><div className={styles.taskTitle}>{t.title}</div><div className={styles.taskMeta}>{t.clientName} · {t.assignedTo} · {t.dueDate}</div></div>
                      <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
                    </div>
                  ))}</div>}
                </div>

                {/* Active Projects */}
                <div className="card">
                  <div className={styles.cardTitle}>🏢 Active Projects <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('clients')}>view all →</span></div>
                  <div className={styles.taskList}>{activeClients.slice(0,6).map((c:any)=>(
                    <Link key={c.id} href={`/client/${c.id}`} style={{textDecoration:'none'}}>
                      <div className={styles.taskItem} style={{cursor:'pointer'}}>
                        <div><div className={styles.taskTitle}>{c.name}</div><div className={styles.taskMeta}>{c.website||c.draftUrl||'No URL'}</div></div>
                        <div style={{display:'flex',gap:6,alignItems:'center'}}>
                          <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                          <span style={{color:'var(--accent)'}}>→</span>
                        </div>
                      </div>
                    </Link>
                  ))}</div>
                </div>

                {/* Team */}
                <div className="card">
                  <div className={styles.cardTitle}>👥 Team <span style={{fontSize:11,color:'var(--text3)',fontWeight:400,cursor:'pointer'}} onClick={()=>setTab('team')}>view all →</span></div>
                  <div className={styles.taskList}>{team.map((m:any)=>(
                    <Link key={m.id} href={`/team/${m.id}`} style={{textDecoration:'none'}}>
                      <div className={styles.taskItem} style={{cursor:'pointer'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:28,height:28,borderRadius:'50%',background:`linear-gradient(135deg,${avatarColor(m.name)},${avatarColor(m.name)}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:11,fontWeight:800,flexShrink:0}}>{m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                          <div><div className={styles.taskTitle}>{m.name}</div><div className={styles.taskMeta}>{m.role} · {tasks.filter((t:any)=>t.assignedTo===m.name&&t.status!=='Completed').length} open</div></div>
                        </div>
                        <span style={{color:'var(--accent)'}}>→</span>
                      </div>
                    </Link>
                  ))}</div>
                </div>
              </div>
            </div>
          )}

          {/* ── CLIENTS ── */}
          {tab==='clients' && (
            <div>
              {/* Search */}
              <div style={{marginBottom:16}}>
                <div className="search-box">
                  <span>🔍</span>
                  <input placeholder="Search by client name or domain..." value={search} onChange={e=>setSearch(e.target.value)} />
                  {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16}}>×</button>}
                </div>
              </div>

              {/* Active Clients */}
              <div className="cat-section">
                <div className="cat-header" onClick={()=>setCollapsed(p=>({...p,active:!p.active}))}>
                  <span style={{fontSize:14}}>🟢</span>
                  <span className="cat-title">Active Clients</span>
                  <span className="cat-count">{filterClients(activeClients).length} clients</span>
                  <span className={`cat-arrow ${!collapsed.active?'open':''}`}>▶</span>
                </div>
                {!collapsed.active && (
                  <div className={styles.clientGrid}>
                    {filterClients(activeClients).map((c:any) => <ClientCard key={c.id} c={c} tasks={tasks} seo={seo} />)}
                    {filterClients(activeClients).length===0 && <p style={{color:'var(--text3)',fontSize:13}}>No results</p>}
                  </div>
                )}
              </div>

              {/* Maintenance */}
              <div className="cat-section">
                <div className="cat-header" onClick={()=>setCollapsed(p=>({...p,maintenance:!p.maintenance}))}>
                  <span style={{fontSize:14}}>🔧</span>
                  <span className="cat-title">Maintenance</span>
                  <span className="cat-count">{filterClients(maintenanceClients).length} clients</span>
                  <span className={`cat-arrow ${!collapsed.maintenance?'open':''}`}>▶</span>
                </div>
                {!collapsed.maintenance && (
                  <div className={styles.clientGrid}>
                    {filterClients(maintenanceClients).map((c:any) => <ClientCard key={c.id} c={c} tasks={tasks} seo={seo} />)}
                    {filterClients(maintenanceClients).length===0 && <p style={{color:'var(--text3)',fontSize:13}}>No results</p>}
                  </div>
                )}
              </div>

              {/* Prospective */}
              <div className="cat-section">
                <div className="cat-header" onClick={()=>setCollapsed(p=>({...p,prospective:!p.prospective}))}>
                  <span style={{fontSize:14}}>🔵</span>
                  <span className="cat-title">Prospective / Pending Details</span>
                  <span className="cat-count">{filterClients(prospectiveClients).length} clients</span>
                  <span className={`cat-arrow ${!collapsed.prospective?'open':''}`}>▶</span>
                </div>
                {!collapsed.prospective && (
                  <div className={styles.clientGrid}>
                    {filterClients(prospectiveClients).map((c:any) => <ClientCard key={c.id} c={c} tasks={tasks} seo={seo} />)}
                    {filterClients(prospectiveClients).length===0 && <p style={{color:'var(--text3)',fontSize:13}}>No results</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TASKS ── */}
          {tab==='tasks' && <TasksView tasks={tasks} team={team} />}

          {/* ── SEO ── */}
          {tab==='seo' && <SEOView seo={seo} />}

          {/* ── DOMAINS ── */}
          {tab==='domains' && (
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Domain</th><th>Client</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th></tr></thead>
                <tbody>{domains.map((d:any)=>(
                  <tr key={d.id}>
                    <td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{d.domain} ↗</a></td>
                    <td>{d.clientName}</td>
                    <td style={{fontSize:12}}>{d.registrar||'—'}</td>
                    <td><ExpiryBadge date={d.domainExpiry}/></td>
                    <td style={{fontSize:12}}>{d.hostingProvider||'—'}</td>
                    <td><ExpiryBadge date={d.hostingExpiry}/></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {/* ── SCHEDULE ── */}

          {/* ── TEAM ── */}
          {tab==='team' && (
            <div className={styles.clientGrid}>
              {team.map((m:any) => {
                const mOpen = tasks.filter((t:any)=>t.assignedTo===m.name&&t.status!=='Completed').length
                const mDone = tasks.filter((t:any)=>t.assignedTo===m.name&&t.status==='Completed').length
                const col = avatarColor(m.name)
                return (
                  <Link key={m.id} href={`/team/${m.id}`} style={{textDecoration:'none'}}>
                    <div className={`card ${styles.clientCard}`} style={{cursor:'pointer'}}>
                      <div className={styles.clientHeader}>
                        <div className={styles.clientAvatar} style={{background:`linear-gradient(135deg,${col},${col}99)`,fontSize:14}}>{m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                        <div><div className={styles.clientName}>{m.name}</div><div style={{fontSize:12,color:'var(--text2)'}}>{m.designation}</div></div>
                        <span className={`badge ${statusColor(m.status)}`}>{m.status}</span>
                      </div>
                      {m.isSeniorPartner && <span className="badge badge-purple">⭐ Senior Partner</span>}
                      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>{(m.skills||[]).slice(0,4).map((s:string)=><span key={s} className="badge badge-gray">{s}</span>)}</div>
                      {m.responsibilities && <div className={styles.clientNotes}>{m.responsibilities}</div>}
                      <div className={styles.clientStats}>
                        <div className={styles.clientStat}><span style={{color:'var(--accent)'}}>{mOpen}</span><small>Open</small></div>
                        <div className={styles.clientStat}><span style={{color:'var(--green)'}}>{mDone}</span><small>Done</small></div>
                        <div className={styles.clientStat}><span style={{color:'var(--red)'}}>{tasks.filter((t:any)=>t.assignedTo===m.name&&['Blocked','Open'].includes(t.status)).length}</span><small>Blocked</small></div>
                      </div>
                      <div style={{fontSize:11,color:'var(--accent)',textAlign:'right',fontWeight:600}}>View tasks & log →</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

// ── Client Card ──────────────────────────────────────────────
function ClientCard({c, tasks, seo}: any) {
  const col = avatarColor(c.name)
  return (
    <Link href={`/client/${c.id}`} style={{textDecoration:'none'}}>
      <div className={`card ${styles.clientCard}`} style={{cursor:'pointer'}}>
        <div className={styles.clientHeader}>
          <div className={styles.clientAvatar} style={{background:`linear-gradient(135deg,${col},${col}99)`}}>{c.name.charAt(0)}</div>
          <div>
            <div className={styles.clientName}>{c.name}</div>
            <div style={{fontSize:12,color:'var(--accent)'}}>{c.website||c.draftUrl||'No URL'}</div>
          </div>
          <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
        </div>
        {c.tech && <div style={{fontSize:12,color:'var(--text2)'}}>🛠 {c.tech}</div>}
        {c.assignedDev && <div style={{fontSize:12,color:'var(--text2)'}}>👤 {c.assignedDev}</div>}
        {c.notes && <div className={styles.clientNotes}>{c.notes.slice(0,100)}{c.notes.length>100?'...':''}</div>}
        <div className={styles.clientStats}>
          <div className={styles.clientStat}><span style={{color:'var(--accent)'}}>{tasks.filter((t:any)=>t.clientId===c.id&&t.status!=='Completed').length}</span><small>Open</small></div>
          <div className={styles.clientStat}><span style={{color:'var(--green)'}}>{tasks.filter((t:any)=>t.clientId===c.id&&t.status==='Completed').length}</span><small>Done</small></div>
          <div className={styles.clientStat}><span style={{color:'var(--purple)'}}>{seo.filter((s:any)=>s.clientId===c.id).length}</span><small>SEO</small></div>
        </div>
        <div style={{fontSize:11,color:'var(--accent)',textAlign:'right',fontWeight:600}}>View project →</div>
      </div>
    </Link>
  )
}

// ── Tasks View with grouping + filter ───────────────────────
function TasksView({tasks, team}: any) {
  const [groupBy, setGroupBy] = useState<'status'|'member'|'date'>('status')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const statuses = ['all','In Progress','Pending','Ongoing','Blocked','Open','Planned','Completed']
  const today = new Date().toISOString().slice(0,10)

  const filtered = tasks
    .filter((t:any) => filterStatus==='all' || t.status===filterStatus)
    .filter((t:any) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.clientName.toLowerCase().includes(search.toLowerCase()) || t.assignedTo.toLowerCase().includes(search.toLowerCase()))
    .sort((a:any,b:any) => {
      // Current dates first
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

  const grouped: Record<string, any[]> = {}
  filtered.forEach((t:any) => {
    let key = ''
    if (groupBy==='status') key = t.status
    else if (groupBy==='member') key = t.assignedTo || 'Unassigned'
    else if (groupBy==='date') {
      if (!t.dueDate) key = '📌 No Due Date'
      else if (t.dueDate < today) key = '⚠️ Overdue'
      else if (t.dueDate === today) key = '🔴 Today'
      else if (t.dueDate <= new Date(Date.now()+86400000).toISOString().slice(0,10)) key = '🟡 Tomorrow'
      else key = `📅 ${t.dueDate}`
    }
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })

  const statusOrder = ['🔴 Today','⚠️ Overdue','🟡 Tomorrow','In Progress','Open','Blocked','Pending','Ongoing','Planned','Completed','📌 No Due Date']
  const sortedKeys = Object.keys(grouped).sort((a,b) => {
    const ai = statusOrder.indexOf(a), bi = statusOrder.indexOf(b)
    if (ai===-1&&bi===-1) return a.localeCompare(b)
    if (ai===-1) return 1; if (bi===-1) return -1
    return ai-bi
  })

  return (
    <div>
      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-box" style={{maxWidth:320}}>
          <span>🔍</span>
          <input placeholder="Search tasks, clients, members..." value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16}}>×</button>}
        </div>
        <div className="filter-bar">
          <span style={{fontSize:12,color:'var(--text3)',fontWeight:600}}>Group:</span>
          {(['status','member','date'] as const).map(g => (
            <button key={g} className={`filter-btn ${groupBy===g?'active':''}`} onClick={()=>setGroupBy(g)}>{g.charAt(0).toUpperCase()+g.slice(1)}</button>
          ))}
        </div>
        <div className="filter-bar">
          <span style={{fontSize:12,color:'var(--text3)',fontWeight:600}}>Status:</span>
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${filterStatus===s?'active':''}`} onClick={()=>setFilterStatus(s)}>{s==='all'?'All':s}</button>
          ))}
        </div>
      </div>

      {/* Grouped tasks */}
      {sortedKeys.map(key => (
        <div key={key} style={{marginBottom:20}}>
          <div className="group-header">
            <span>{key}</span>
            <span style={{fontWeight:400}}>({grouped[key].length})</span>
          </div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <table>
              <thead><tr><th>Task</th><th>Client</th><th>Type</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>{grouped[key].map((t:any) => (
                <tr key={t.id}>
                  <td><div style={{fontWeight:600}}>{t.title}</div>{t.description&&<div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{t.description.slice(0,80)}{t.description.length>80?'...':''}</div>}</td>
                  <td style={{fontSize:12,whiteSpace:'nowrap'}}>{t.clientName}</td>
                  <td><span className="badge badge-gray">{t.type}</span></td>
                  <td style={{fontSize:12,whiteSpace:'nowrap'}}>{t.assignedTo}</td>
                  <td><span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                  <td style={{fontSize:12,color:t.dueDate&&t.dueDate<=today?'var(--red)':'var(--text2)',fontWeight:t.dueDate===today?700:400}}>{t.dueDate||'—'}</td>
                  <td><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ))}
      {filtered.length===0 && <div className="empty-state card"><div className="icon">🔍</div><p>No tasks match your filters</p></div>}
    </div>
  )
}



// ── Expiry Badge ─────────────────────────────────────────────
function ExpiryBadge({date}: {date: string}) {
  if (!date) return <span className="badge badge-gray">Not Set</span>
  const days = daysUntil(date)!
  if (days < 0) return <span className="badge badge-red">Expired</span>
  if (days < 30) return <span className="badge badge-red">{days}d left</span>
  if (days < 90) return <span className="badge badge-yellow">{days}d</span>
  return <span className="badge badge-green">{new Date(date).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>
}

// ── SEO View — grouped by client ────────────────────────
function SEOView({ seo }: { seo: any[] }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [collapsedClients, setCollapsedClients] = useState<Record<string,boolean>>({})

  const statuses = ['all','Completed','In Progress','Ongoing','Planned','Pending']

  const filtered = seo
    .filter((s:any) => filterStatus === 'all' || s.status === filterStatus)
    .filter((s:any) => !search ||
      s.clientName.toLowerCase().includes(search.toLowerCase()) ||
      s.activity.toLowerCase().includes(search.toLowerCase()) ||
      (s.assignedTo||'').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a:any,b:any) => b.date?.localeCompare(a.date||'') || 0)

  // Group by clientName
  const grouped: Record<string, any[]> = {}
  filtered.forEach((s:any) => {
    const k = s.clientName || 'Unknown'
    if (!grouped[k]) grouped[k] = []
    grouped[k].push(s)
  })
  const clientNames = Object.keys(grouped).sort()

  function toggleClient(name: string) {
    setCollapsedClients(p => ({ ...p, [name]: !p[name] }))
  }

  function activityIcon(activity: string) {
    const a = activity.toLowerCase()
    if (a.includes('backlink'))  return '🔗'
    if (a.includes('blog') || a.includes('content')) return '✍️'
    if (a.includes('keyword'))   return '🔍'
    if (a.includes('audit'))     return '🔎'
    if (a.includes('report'))    return '📊'
    if (a.includes('gmb'))       return '📍'
    if (a.includes('on-page'))   return '📝'
    if (a.includes('technical')) return '⚙️'
    return '📈'
  }

  return (
    <div>
      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-box" style={{maxWidth:320}}>
          <span>🔍</span>
          <input placeholder="Search client, activity, member..." value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16}}>×</button>}
        </div>
        <div className="filter-bar">
          <span style={{fontSize:12,color:'var(--text3)',fontWeight:600}}>Status:</span>
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${filterStatus===s?'active':''}`} onClick={()=>setFilterStatus(s)}>
              {s==='all'?'All':s}
            </button>
          ))}
        </div>
        <div style={{marginLeft:'auto',fontSize:12,color:'var(--text3)'}}>
          {filtered.length} activities · {clientNames.length} clients
        </div>
      </div>

      {clientNames.length === 0 && (
        <div className="empty-state card"><div className="icon">🔍</div><p>No SEO activities match your filters</p></div>
      )}

      {/* Grouped by client */}
      {clientNames.map(clientName => {
        const items = grouped[clientName]
        const isCollapsed = collapsedClients[clientName]
        const doneCount = items.filter((s:any) => s.status === 'Completed').length
        const activeCount = items.filter((s:any) => ['In Progress','Ongoing'].includes(s.status)).length

        return (
          <div key={clientName} className="cat-section">
            {/* Client header */}
            <div className="cat-header" onClick={() => toggleClient(clientName)}
              style={{background:'var(--bg2)',borderLeft:'3px solid var(--accent)'}}>
              <span style={{fontSize:15}}>🏢</span>
              <span className="cat-title">{clientName}</span>
              <div style={{display:'flex',gap:6,marginLeft:'auto',marginRight:8}}>
                {activeCount > 0 && <span className="badge badge-accent">{activeCount} active</span>}
                {doneCount > 0  && <span className="badge badge-green">{doneCount} done</span>}
                <span className="cat-count">{items.length} total</span>
              </div>
              <span className={`cat-arrow ${!isCollapsed?'open':''}`}>▶</span>
            </div>

            {/* Activities table */}
            {!isCollapsed && (
              <div className="card" style={{padding:0,overflow:'hidden',marginBottom:4}}>
                <table>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Assigned To</th>
                      <th>Date / Period</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s:any) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{display:'flex',alignItems:'center',gap:7}}>
                            <span style={{fontSize:15}}>{activityIcon(s.activity)}</span>
                            <div>
                              <div style={{fontWeight:600,fontSize:13}}>{s.activity}</div>
                              {s.description && <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{s.description.slice(0,80)}{s.description.length>80?'...':''}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{fontSize:12,whiteSpace:'nowrap'}}>{s.assignedTo}</td>
                        <td style={{fontSize:12,color:'var(--text2)'}}>{s.period||s.date||'—'}</td>
                        <td><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
                        <td style={{fontSize:12,color:'var(--text2)',maxWidth:220}}>{s.notes||'—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

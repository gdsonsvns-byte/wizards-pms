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
  const [lastSynced, setLastSynced] = useState<string>('')

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t) }, [])

  async function load() {
    try {
      const d = await fetchPMS()
      setData(d)
      setLastSynced(new Date().toLocaleString('en-IN', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}))
    } catch(e) {}
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
    {id:'overview',label:'Wizards Overview',icon:'⚡'},
    {id:'mydash',  label:'My Dashboard',    icon:'👤'},
    {id:'clients', label:'Clients',         icon:'🏢',count:activeClients.length},
    {id:'tasks',   label:'Tasks',           icon:'✅',count:pendingTasks.length},
    {id:'seo',     label:'SEO',             icon:'📈',count:seo.length},
    {id:'domains', label:'Domains',         icon:'🌐',count:domains.length},
    {id:'team',    label:'Team',            icon:'👥',count:team.length},
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
          {lastSynced && (
            <div style={{fontSize:10,color:'var(--text3)',marginTop:6,lineHeight:1.4,textAlign:'center'}}>
              🔄 Last synced<br/><span style={{color:'var(--text2)',fontWeight:600}}>{lastSynced}</span>
            </div>
          )}
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
          {tab==='tasks' && <TasksView tasks={tasks} team={team} clients={clients} />}

          {/* ── MY DASHBOARD ── */}
          {tab==='mydash' && <MyDashboard tasks={tasks} seo={seo} team={team} clients={clients} />}

          {/* ── SEO ── */}
          {tab==='seo' && <SEOView seo={seo} clients={clients} team={team} />}

          {/* ── DOMAINS ── */}
          {tab==='domains' && (
            <div className="card" style={{padding:0,overflow:'hidden'}}>
              <table>
                <thead><tr><th>Domain</th><th>Client</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th></tr></thead>
                <tbody>{domains.map((d:any)=>{
                  const cid = d.clientId
                  return (
                    <tr key={d.id}>
                      <td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{d.domain} ↗</a></td>
                      <td>{cid
                        ? <Link href={`/client/${cid}`} style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>{d.clientName} ↗</Link>
                        : d.clientName}
                      </td>
                      <td style={{fontSize:12}}>{d.registrar||'—'}</td>
                      <td><ExpiryBadge date={d.domainExpiry}/></td>
                      <td style={{fontSize:12}}>{d.hostingProvider||'—'}</td>
                      <td><ExpiryBadge date={d.hostingExpiry}/></td>
                    </tr>
                  )
                })}</tbody>
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
function TasksView({tasks, team, clients}: any) {
  const [groupBy, setGroupBy] = useState<'status'|'member'|'date'|'client'|'priority'>('status')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [collapsed, setCollapsed] = useState<Record<string,boolean>>({})

  // Reset collapsed state when groupBy changes — all collapsed by default
  useEffect(() => { setCollapsed({}) }, [groupBy])

  function toggleGroup(key: string) {
    setCollapsed(p => ({...p, [key]: !p[key]}))
  }

  function expandAll() { setCollapsed(Object.fromEntries(sortedKeys.map(k=>[k,false]))) }
  function collapseAll() { setCollapsed(Object.fromEntries(sortedKeys.map(k=>[k,true]))) }

  const statuses = ['all','In Progress','Pending','Ongoing','Blocked','Open','Planned','Completed']
  const today = new Date().toISOString().slice(0,10)

  // Build lookup maps for links
  const clientMap: Record<string,string> = {}
  ;(clients||[]).forEach((c:any) => { clientMap[c.name] = c.id })
  const teamMap: Record<string,string> = {}
  ;(team||[]).forEach((m:any) => { teamMap[m.name] = m.id })

  const filtered = tasks
    .filter((t:any) => filterStatus==='all' || t.status===filterStatus)
    .filter((t:any) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.clientName||'').toLowerCase().includes(search.toLowerCase()) || (t.assignedTo||'').toLowerCase().includes(search.toLowerCase()))
    .sort((a:any,b:any) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

  const grouped: Record<string, any[]> = {}
  filtered.forEach((t:any) => {
    let key = ''
    if (groupBy==='status')   key = t.status
    else if (groupBy==='member')   key = t.assignedTo || 'Unassigned'
    else if (groupBy==='client')   key = t.clientName || 'Unknown'
    else if (groupBy==='priority') key = t.priority || 'Unknown'
    else if (groupBy==='date') {
      if (!t.dueDate) key = '📌 No Due Date'
      else if (t.dueDate < today && t.status !== 'Completed') key = '⚠️ Overdue'
      else if (t.dueDate === today && t.status !== 'Completed') key = '🔴 Today'
      else if (t.dueDate <= new Date(Date.now()+86400000).toISOString().slice(0,10) && t.status !== 'Completed') key = '🟡 Tomorrow'
      else key = `📅 ${t.dueDate}`
    }
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(t)
  })

  const priorityOrder = ['Critical','High','Medium','Low']
  const statusOrder = ['🔴 Today','⚠️ Overdue','🟡 Tomorrow','In Progress','Open','Blocked','Pending','Ongoing','Planned','Completed','📌 No Due Date']
  const sortedKeys = Object.keys(grouped).sort((a,b) => {
    if (groupBy==='priority') {
      const ai=priorityOrder.indexOf(a), bi=priorityOrder.indexOf(b)
      return (ai===-1?99:ai)-(bi===-1?99:bi)
    }
    const ai = statusOrder.indexOf(a), bi = statusOrder.indexOf(b)
    if (ai===-1&&bi===-1) return a.localeCompare(b)
    if (ai===-1) return 1; if (bi===-1) return -1
    return ai-bi
  })

  return (
    <div>
      {/* Controls */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
        <div className="search-box" style={{maxWidth:300}}>
          <span>🔍</span>
          <input placeholder="Search tasks, clients, members..." value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:16}}>×</button>}
        </div>
        <div className="filter-bar">
          <span style={{fontSize:12,color:'var(--text3)',fontWeight:600}}>Group:</span>
          {(['status','client','priority','member','date'] as const).map(g => (
            <button key={g} className={`filter-btn ${groupBy===g?'active':''}`} onClick={()=>setGroupBy(g)}>
              {g==='status'?'Status':g==='client'?'Client':g==='priority'?'Priority':g==='member'?'Member':'Date'}
            </button>
          ))}
        </div>
        <div className="filter-bar" style={{alignItems:'center'}}>
          <span style={{fontSize:12,color:'var(--text3)',fontWeight:600}}>Status:</span>
          {statuses.map(s => (
            <button key={s} className={`filter-btn ${filterStatus===s?'active':''}`} onClick={()=>setFilterStatus(s)}>{s==='all'?'All':s}</button>
          ))}
          <StatusTooltip />
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',marginLeft:'auto'}}>
          <span style={{fontSize:12,color:'var(--text3)'}}>{filtered.length} tasks</span>
          <button className="filter-btn" onClick={expandAll} style={{fontSize:11}}>Expand All</button>
          <button className="filter-btn" onClick={collapseAll} style={{fontSize:11}}>Collapse All</button>
        </div>
      </div>

      {sortedKeys.map(key => {
        const isOpen = collapsed[key] === false  // false = explicitly opened; undefined = default collapsed
        return (
          <div key={key} style={{marginBottom:12}}>
            {/* Collapsible group header */}
            <div
              className="group-header"
              onClick={() => toggleGroup(key)}
              style={{cursor:'pointer',userSelect:'none',padding:'10px 14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:isOpen?'var(--radius) var(--radius) 0 0':'var(--radius)',marginBottom:0,display:'flex',alignItems:'center',gap:8}}
            >
              <span style={{fontSize:12,color:'var(--text3)',transition:'transform .2s',display:'inline-block',transform:isOpen?'rotate(90deg)':'rotate(0deg)'}}>▶</span>
              <span style={{fontWeight:700,fontSize:13,color:'var(--text)',flex:1}}>{key}</span>
              <span className="badge badge-gray">{grouped[key].length} task{grouped[key].length!==1?'s':''}</span>
            </div>
            {/* Table — shown only when expanded */}
            {isOpen && (
              <div className="card" style={{padding:0,overflow:'hidden',borderRadius:'0 0 var(--radius) var(--radius)',borderTop:'none',marginTop:0}}>
                <table>
                  <thead><tr><th>Task</th><th>Client</th><th>Type</th><th>Assigned</th><th>Priority</th><th>Due</th><th>Status</th></tr></thead>
                  <tbody>{grouped[key].map((t:any) => {
                    const clientId = t.clientId || clientMap[t.clientName]
                    const memberId = teamMap[t.assignedTo]
                    return (
                      <tr key={t.id}>
                        <td><div style={{fontWeight:600}}>{t.title}</div>{t.description&&<div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{t.description.slice(0,80)}{t.description.length>80?'...':''}</div>}</td>
                        <td style={{fontSize:12,whiteSpace:'nowrap'}}>
                          {clientId
                            ? <Link href={`/client/${clientId}`} style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>{t.clientName} ↗</Link>
                            : t.clientName}
                        </td>
                        <td><span className="badge badge-gray">{t.type}</span></td>
                        <td style={{fontSize:12,whiteSpace:'nowrap'}}>
                          {memberId
                            ? <Link href={`/team/${memberId}`} style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>{t.assignedTo} ↗</Link>
                            : t.assignedTo}
                        </td>
                        <td><span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                        <td style={{fontSize:12,color:t.dueDate&&t.dueDate<=today&&t.status!=='Completed'?'var(--red)':'var(--text2)',fontWeight:t.dueDate===today&&t.status!=='Completed'?700:400}}>{t.dueDate||'—'}</td>
                        <td><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                      </tr>
                    )
                  })}</tbody>
                </table>
              </div>
            )}
          </div>
        )
      })}
      {filtered.length===0 && <div className="empty-state card"><div className="icon">🔍</div><p>No tasks match your filters</p></div>}
    </div>
  )
}

// ── Status Tooltip ───────────────────────────────────────
function StatusTooltip() {
  const [show, setShow] = useState(false)

  const statuses = [
    {s:'Pending',    c:'badge-yellow', d:'Not started. No blocker. Ready to begin when picked up.'},
    {s:'In Progress',c:'badge-accent',  d:'Actively being worked on right now. Has a clear finish line.'},
    {s:'Ongoing',    c:'badge-blue',    d:'Recurring or permanent responsibility. Repeats forever, never truly done.'},
    {s:'Planned',    c:'badge-gray',    d:'Scheduled for a future date. Intent confirmed but not started yet.'},
    {s:'Blocked',    c:'badge-red',     d:'Cannot proceed. Waiting on another task, person, decision or external input.'},
    {s:'Open',       c:'badge-red',     d:'A bug or issue found and logged but not yet assigned or actioned.'},
    {s:'Completed',  c:'badge-green',   d:'Done. No further action needed.'},
  ]

  return (
    <div style={{position:'relative',display:'inline-flex',alignItems:'center'}}>
      <button
        onMouseEnter={()=>setShow(true)}
        onMouseLeave={()=>setShow(false)}
        onClick={()=>setShow(p=>!p)}
        style={{width:18,height:18,borderRadius:'50%',background:'var(--bg3)',border:'1px solid var(--border)',cursor:'pointer',fontSize:11,fontWeight:700,color:'var(--text3)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'inherit',flexShrink:0}}
      >?</button>
      {show && (
        <div style={{position:'absolute',left:24,top:-8,zIndex:100,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,boxShadow:'var(--shadow2)',padding:'14px 16px',width:340,display:'flex',flexDirection:'column',gap:10}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:4}}>Status Definitions</div>
          {statuses.map(({s,c,d}) => (
            <div key={s} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
              <span className={`badge ${c}`} style={{flexShrink:0,marginTop:1}}>{s}</span>
              <span style={{fontSize:12,color:'var(--text2)',lineHeight:1.5}}>{d}</span>
            </div>
          ))}
        </div>
      )}
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
function SEOView({ seo, clients, team }: { seo: any[], clients?: any[], team?: any[] }) {
  const clientIdMap: Record<string,string> = {}
  ;(clients||[]).forEach((c:any) => { clientIdMap[c.name] = c.id })
  const teamIdMap: Record<string,string> = {}
  ;(team||[]).forEach((m:any) => { teamIdMap[m.name] = m.id })
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
                    {items.map((s:any) => {
                      const cid = s.clientId || clientIdMap[s.clientName]
                      const mid = teamIdMap[s.assignedTo]
                      return (
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
                        <td style={{fontSize:12,whiteSpace:'nowrap'}}>
                          {mid
                            ? <Link href={`/team/${mid}`} style={{color:'var(--accent)',textDecoration:'none',fontWeight:500}}>{s.assignedTo} ↗</Link>
                            : s.assignedTo}
                        </td>
                        <td style={{fontSize:12,color:'var(--text2)'}}>{s.period||s.date||'—'}</td>
                        <td><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
                        <td style={{fontSize:12,color:'var(--text2)',maxWidth:220}}>{s.notes||'—'}</td>
                      </tr>
                    )})}
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

// ── My Dashboard ─────────────────────────────────────────
function MyDashboard({ tasks, seo, team, clients }: any) {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const raw = localStorage.getItem('pms_user')
    if (raw) setUser(JSON.parse(raw))
  }, [])

  if (!user) return (
    <div className="empty-state card"><div className="icon">🔐</div><p>Please log in to view your dashboard</p></div>
  )

  const member = team.find((m:any) => m.id === user.teamId)
  const myTasks = tasks.filter((t:any) => t.assignedTo === user.name)
  const openTasks = myTasks.filter((t:any) => t.status !== 'Completed')
  const doneTasks = myTasks.filter((t:any) => t.status === 'Completed')
  const criticalHigh = openTasks.filter((t:any) => ['Critical','High'].includes(t.priority))
  const blocked = openTasks.filter((t:any) => ['Blocked','Open'].includes(t.status))
  const today = new Date().toISOString().slice(0,10)
  const overdue = openTasks.filter((t:any) => t.dueDate && t.dueDate < today)
  const dueToday = openTasks.filter((t:any) => t.dueDate === today)
  const mySEO = seo.filter((s:any) => s.assignedTo === user.name || (s.assignedTo||'').includes(user.name.split(' ')[0]))

  // Activity by date — last 14 days
  const last14: {date:string,done:number,total:number}[] = []
  for (let i=13; i>=0; i--) {
    const d = new Date(Date.now()-i*86400000).toISOString().slice(0,10)
    const dayDone = myTasks.filter((t:any) => t.completedAt === d).length
    const daySEO  = mySEO.filter((s:any) => s.date === d).length
    last14.push({date:d, done:dayDone, total:dayDone+daySEO})
  }
  const maxVal = Math.max(...last14.map(d=>d.total), 1)

  const col = member ? avatarColor(member.name) : '#3b5bdb'
  const initials = user.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)

  return (
    <div style={{display:'flex',flexDirection:'column',gap:16}}>
      {/* Hero */}
      <div className="card">
        <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
          <div style={{width:52,height:52,borderRadius:13,background:`linear-gradient(135deg,${col},${col}99)`,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:20,flexShrink:0}}>{initials}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:800}}>{user.name}</div>
            <div style={{fontSize:13,color:'var(--text2)',marginTop:2}}>{member?.designation || 'Team Member'}</div>
          </div>
          <Link href={`/team/${user.teamId}`} style={{padding:'8px 16px',background:'var(--accentBg)',color:'var(--accent)',borderRadius:9,textDecoration:'none',fontSize:13,fontWeight:600}}>
            View Full Profile →
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:12}}>
        {[
          {l:'Open Tasks',    v:openTasks.length,     c:'var(--accent)'},
          {l:'Completed',     v:doneTasks.length,      c:'var(--green)'},
          {l:'High Priority', v:criticalHigh.length,   c:'var(--red)'},
          {l:'Blocked',       v:blocked.length,        c:'var(--red)'},
          {l:'Due Today',     v:dueToday.length,       c:'var(--yellow)'},
          {l:'Overdue',       v:overdue.length,        c:'var(--orange)'},
          {l:'SEO Activities',v:mySEO.length,          c:'var(--purple)'},
          {l:'Clients',       v:new Set(myTasks.map((t:any)=>t.clientId)).size, c:'var(--blue)'},
        ].map((s,i) => (
          <div key={i} className="card" style={{textAlign:'center',padding:'14px 10px'}}>
            <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Activity Chart — last 14 days */}
      <div className="card">
        <div style={{fontWeight:700,fontSize:14,marginBottom:16}}>📊 Activity — Last 14 Days</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:6,height:80}}>
          {last14.map((d,i) => (
            <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <div style={{width:'100%',background:'var(--bg3)',borderRadius:4,overflow:'hidden',height:60,display:'flex',alignItems:'flex-end'}}>
                <div style={{
                  width:'100%',
                  height:`${Math.round((d.total/maxVal)*100)}%`,
                  background:d.total>0?`linear-gradient(180deg,var(--accent),var(--accent2))`:'transparent',
                  borderRadius:4,
                  transition:'height .3s',
                  minHeight: d.total>0?4:0
                }} title={`${d.date}: ${d.done} tasks, ${d.total-d.done} SEO`}/>
              </div>
              <div style={{fontSize:9,color:'var(--text3)',transform:'rotate(-45deg)',transformOrigin:'center',whiteSpace:'nowrap'}}>
                {d.date.slice(5)}
              </div>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:16,marginTop:12,fontSize:11,color:'var(--text3)'}}>
          <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:10,height:10,borderRadius:2,background:'var(--accent)'}}/> Tasks completed + SEO activities</div>
        </div>
      </div>

      {/* Progress bar */}
      {myTasks.length > 0 && (
        <div className="card">
          <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Overall Progress</div>
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
            <div style={{flex:1,height:10,background:'var(--bg3)',borderRadius:10,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${Math.round(doneTasks.length/myTasks.length*100)}%`,background:'linear-gradient(90deg,var(--green),#34d399)',borderRadius:10}}/>
            </div>
            <span style={{fontSize:13,fontWeight:700,color:'var(--green)'}}>{Math.round(doneTasks.length/myTasks.length*100)}%</span>
          </div>
          <div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:12}}>
            {[
              {l:'Done',c:doneTasks.length,co:'var(--green)'},
              {l:'In Progress',c:myTasks.filter((t:any)=>t.status==='In Progress').length,co:'var(--accent)'},
              {l:'Pending',c:myTasks.filter((t:any)=>t.status==='Pending').length,co:'var(--yellow)'},
              {l:'Blocked',c:blocked.length,co:'var(--red)'},
            ].map(s=>(
              <div key={s.l} style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:s.co}}/><span style={{color:'var(--text2)'}}>{s.l}:</span><span style={{fontWeight:700,color:s.co}}>{s.c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgent items */}
      {(overdue.length > 0 || dueToday.length > 0 || blocked.length > 0) && (
        <div className="card">
          <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>🚨 Needs Attention</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[...overdue.map((t:any)=>({...t,_flag:'⚠️ Overdue'})), ...dueToday.map((t:any)=>({...t,_flag:'🔴 Due Today'})), ...blocked.map((t:any)=>({...t,_flag:'🔴 Blocked'}))].slice(0,8).map((t:any)=>(
              <div key={t.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'9px 12px',background:'var(--redBg)',borderRadius:8,border:'1px solid #fca5a5',gap:10}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{t._flag} {t.title}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>🏢 {t.clientName}</div>
                </div>
                <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My open tasks grouped by client */}
      <div className="card">
        <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>
          📋 My Open Tasks ({openTasks.length})
          <Link href={`/team/${user.teamId}`} style={{fontSize:11,color:'var(--text3)',fontWeight:400,marginLeft:8,textDecoration:'none'}}>view full log →</Link>
        </div>
        {openTasks.length === 0
          ? <div className="empty-state"><div className="icon">🎉</div><p>All clear!</p></div>
          : (() => {
              const byClient: Record<string,any[]> = {}
              openTasks.forEach((t:any) => { const k=t.clientName||'Unknown'; if(!byClient[k])byClient[k]=[]; byClient[k].push(t) })
              return Object.entries(byClient).map(([cn, ct]:any) => (
                <div key={cn} style={{marginBottom:14}}>
                  <div style={{fontSize:11,fontWeight:700,color:'var(--accent)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:6,display:'flex',gap:6,alignItems:'center'}}>
                    🏢 {cn} <span style={{fontWeight:400,color:'var(--text3)'}}>({ct.length})</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:5,paddingLeft:8}}>
                    {ct.map((t:any) => (
                      <div key={t.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',background:'var(--bg3)',borderRadius:8,border:'1px solid var(--border)',gap:10}}>
                        <div style={{flex:1}}>
                          <div style={{fontWeight:600,fontSize:13}}>{t.title}</div>
                          <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>🏷 {t.type}{t.dueDate?` · ⏰ ${t.dueDate}`:''}</div>
                        </div>
                        <div style={{display:'flex',gap:5,flexShrink:0}}>
                          <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
                          <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            })()
        }
      </div>
    </div>
  )
}

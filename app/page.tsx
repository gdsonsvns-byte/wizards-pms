'use client'
import { useState, useEffect } from 'react'
import styles from './page.module.css'

const API = 'https://pms.wizards.co.in/api.php?action=get_all'
type Tab = 'overview'|'clients'|'tasks'|'seo'|'domains'|'schedule'|'team'

function priorityColor(p:string){ if(p==='High')return'badge-red'; if(p==='Medium')return'badge-yellow'; return'badge-blue'; }
function statusColor(s:string){
  if(['Active','Completed','Live','Ongoing'].includes(s))return'badge-green';
  if(['In Progress','Review Pending'].includes(s))return'badge-accent';
  if(['Pending','Upcoming','Resuming','Pending Approval','Details Pending'].includes(s))return'badge-yellow';
  if(['Overdue','Blocked'].includes(s))return'badge-red';
  return'badge-gray';
}
function timelineClass(s:string){
  if(s==='Completed')return'completed';
  if(['In Progress','Ongoing'].includes(s))return'active';
  if(s==='Blocked')return'blocked';
  return'pending';
}
function daysUntil(d:string){ if(!d)return null; return Math.ceil((new Date(d).getTime()-Date.now())/86400000); }
function expiryBadge(d:string){
  if(!d)return<span className="badge badge-gray">Not Set</span>;
  const days=daysUntil(d)!;
  if(days<0)return<span className="badge badge-red">Expired</span>;
  if(days<30)return<span className="badge badge-red">{days}d left</span>;
  if(days<90)return<span className="badge badge-yellow">{days}d left</span>;
  return<span className="badge badge-green">{new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</span>;
}

// ── Project Detail View ──────────────────────────────────────
function ProjectDetail({client, tasks, seo, schedule, domains, onBack}:any){
  const clientTasks   = tasks.filter((t:any)=>t.clientId===client.id);
  const clientSEO     = seo.filter((s:any)=>s.clientId===client.id);
  const clientEvents  = schedule.filter((e:any)=>e.clientId===client.id);
  const clientDomains = domains.filter((d:any)=>d.clientId===client.id);

  // Build unified timeline sorted by createdAt/date
  const timelineItems = [
    ...clientTasks.map((t:any)=>({...t, _type:'task', _date:t.createdAt||''})),
    ...clientSEO.map((s:any)=>({...s,   _type:'seo',  _date:s.date||''})),
    ...clientEvents.map((e:any)=>({...e,_type:'event',_date:e.date||''})),
  ].sort((a,b)=>a._date.localeCompare(b._date));

  const openTasks = clientTasks.filter((t:any)=>t.status!=='Completed');
  const done      = clientTasks.filter((t:any)=>t.status==='Completed');

  return(
    <div className={styles.projectDetail}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Clients</button>

      {/* Hero */}
      <div className={styles.projectHero}>
        <div className={styles.projectHeroTop}>
          <div className={styles.projectHeroLeft}>
            <div className={styles.projectBigAvatar}>{client.name.charAt(0)}</div>
            <div>
              <div className={styles.projectHeroName}>{client.name}</div>
              {client.website
                ?<a href={`https://${client.website}`} target="_blank" rel="noreferrer" className={styles.projectHeroUrl}>{client.website} ↗</a>
                :client.draftUrl
                  ?<a href={`https://${client.draftUrl}`} target="_blank" rel="noreferrer" className={styles.projectHeroUrl}>Draft: {client.draftUrl} ↗</a>
                  :<span style={{fontSize:12,color:'var(--text3)'}}>No URL yet</span>}
            </div>
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <span className={`badge ${statusColor(client.status)}`}>{client.status}</span>
            {client.tech&&<span className="badge badge-gray">🛠 {client.tech}</span>}
          </div>
        </div>

        <div className={styles.projectMetaGrid}>
          {client.assignedDev&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Developer</span><span className={styles.projectMetaValue}>👤 {client.assignedDev}</span></div>}
          {client.assignedSEO&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>SEO Team</span><span className={styles.projectMetaValue}>📈 {Array.isArray(client.assignedSEO)?client.assignedSEO.join(', '):client.assignedSEO}</span></div>}
          {client.assignedContent&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Content</span><span className={styles.projectMetaValue}>✍️ {client.assignedContent}</span></div>}
          {client.hostingProvider&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Hosting</span><span className={styles.projectMetaValue}>☁️ {client.hostingProvider}</span></div>}
          {client.domainProvider&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Domain</span><span className={styles.projectMetaValue}>🌐 {client.domainProvider}</span></div>}
          {client.since&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Client Since</span><span className={styles.projectMetaValue}>📅 {client.since}</span></div>}
          {(client.city||client.state)&&<div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Location</span><span className={styles.projectMetaValue}>📍 {[client.city,client.state].filter(Boolean).join(', ')}</span></div>}
          <div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Open Tasks</span><span className={styles.projectMetaValue} style={{color:'var(--accent)',fontWeight:700}}>{openTasks.length}</span></div>
          <div className={styles.projectMetaItem}><span className={styles.projectMetaLabel}>Completed</span><span className={styles.projectMetaValue} style={{color:'var(--green)',fontWeight:700}}>{done.length}</span></div>
        </div>

        {client.services?.length>0&&(
          <div style={{marginTop:12,display:'flex',gap:6,flexWrap:'wrap'}}>
            {client.services.map((s:string)=><span key={s} className="badge badge-accent">{s}</span>)}
          </div>
        )}
        {client.notes&&<div className={styles.projectNotes}>📝 {client.notes}</div>}
      </div>

      {/* Stats row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {[
          {label:'Total Tasks',value:clientTasks.length,color:'var(--accent)'},
          {label:'Open',value:openTasks.length,color:'var(--yellow)'},
          {label:'Completed',value:done.length,color:'var(--green)'},
          {label:'SEO Activities',value:clientSEO.length,color:'var(--purple)'},
        ].map((s,i)=>(
          <div key={i} className="card" style={{textAlign:'center',padding:'16px 12px'}}>
            <div style={{fontSize:26,fontWeight:800,color:s.color}}>{s.value}</div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:2}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionTitle}>🕐 Project Timeline</div>
        {timelineItems.length===0
          ?<div className="empty-state"><div className="icon">📭</div><p>No activities logged yet</p></div>
          :<div className={styles.timeline}>
            {timelineItems.map((item:any,i:number)=>(
              <div key={i} className={`${styles.timelineItem} ${styles[timelineClass(item.status)]}`}>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineHeader}>
                    <div className={styles.timelineTitle}>
                      {item._type==='task'&&'✅ '}
                      {item._type==='seo'&&'📈 '}
                      {item._type==='event'&&'📅 '}
                      {item.title||item.activity}
                    </div>
                    <span className={`badge ${statusColor(item.status)}`}>{item.status}</span>
                  </div>
                  {(item.description||item.notes)&&<div className={styles.timelineDesc}>{item.description||item.notes}</div>}
                  <div className={styles.timelineMeta}>
                    {item._date&&<span className={styles.timelineMetaItem}>📅 {item._date}</span>}
                    {item.assignedTo&&<span className={styles.timelineMetaItem}>👤 {item.assignedTo}</span>}
                    {item.priority&&<span className={`badge ${priorityColor(item.priority)}`} style={{fontSize:10}}>{item.priority}</span>}
                    {item.dueDate&&<span className={styles.timelineMetaItem}>⏰ Due {item.dueDate}</span>}
                    {item.type&&<span className={styles.timelineMetaItem}>🏷 {item.type}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>

      {/* Domain info */}
      {clientDomains.length>0&&(
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>🌐 Domain & Hosting</div>
          <table>
            <thead><tr><th>Domain</th><th>Registrar</th><th>Domain Expiry</th><th>Hosting</th><th>Hosting Expiry</th><th>SSL</th></tr></thead>
            <tbody>{clientDomains.map((d:any)=>(
              <tr key={d.id}>
                <td><a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{color:'var(--accent)',textDecoration:'none',fontWeight:600}}>{d.domain} ↗</a></td>
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

      {/* Upcoming events */}
      {clientEvents.filter((e:any)=>new Date(e.date)>=new Date()).length>0&&(
        <div className={styles.sectionCard}>
          <div className={styles.sectionTitle}>📅 Upcoming Events</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {clientEvents.filter((e:any)=>new Date(e.date)>=new Date()).map((e:any)=>(
              <div key={e.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg3)',borderRadius:8,border:'1px solid var(--border)'}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13}}>{e.title}</div>
                  <div style={{fontSize:12,color:'var(--text3)',marginTop:2}}>{e.date} {e.time&&`at ${e.time}`}</div>
                </div>
                <span className="badge badge-accent">{e.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard(){
  const [tab,setTab]       = useState<Tab>('overview');
  const [data,setData]     = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [error,setError]   = useState('');
  const [lastUpdated,setLastUpdated] = useState('');
  const [selectedClient,setSelectedClient] = useState<any>(null);

  useEffect(()=>{ fetchData(); const t=setInterval(fetchData,60000); return()=>clearInterval(t); },[]);

  async function fetchData(){
    try{
      const res = await fetch(API+'&t='+Date.now());
      const json = await res.json();
      if(json.status==='ok'){ setData(json.data); setLastUpdated(json.timestamp); setError(''); }
      else setError('Failed to load data');
    }catch(e){ setError('Cannot connect to database'); }
    setLoading(false);
  }

  if(loading)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',flexDirection:'column',gap:14}}>
      <div style={{width:40,height:40,background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:20}}>W</div>
      <div style={{color:'var(--text2)',fontSize:13}}>Loading PMS data...</div>
    </div>
  );
  if(error)return(
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'var(--bg)',flexDirection:'column',gap:10}}>
      <div style={{fontSize:28}}>⚠️</div>
      <div style={{color:'var(--red)',fontSize:13}}>{error}</div>
      <button onClick={fetchData} style={{padding:'8px 18px',background:'var(--accent)',color:'white',border:'none',borderRadius:8,cursor:'pointer',fontSize:13,marginTop:4}}>Retry</button>
    </div>
  );

  const clients  = data.clients||[];
  const tasks    = data.tasks||[];
  const seo      = data.seo||[];
  const domains  = data.domains||[];
  const schedule = data.schedule||[];
  const team     = data.team||[];

  const pendingTasks   = tasks.filter((t:any)=>t.status!=='Completed');
  const highPriority   = tasks.filter((t:any)=>t.priority==='High'&&t.status!=='Completed');
  const upcomingEvents = schedule.filter((e:any)=>new Date(e.date)>=new Date()).slice(0,5);
  const activeClients  = clients.filter((c:any)=>['Active','In Progress'].includes(c.status));

  const tabs:{id:Tab;label:string;icon:string;count?:number}[]=[
    {id:'overview',label:'Overview',icon:'⚡'},
    {id:'clients', label:'Clients', icon:'🏢',count:clients.length},
    {id:'tasks',   label:'Tasks',   icon:'✅',count:pendingTasks.length},
    {id:'seo',     label:'SEO',     icon:'📈',count:seo.length},
    {id:'domains', label:'Domains', icon:'🌐',count:domains.length},
    {id:'schedule',label:'Schedule',icon:'📅',count:upcomingEvents.length},
    {id:'team',    label:'Team',    icon:'👥',count:team.length},
  ];

  // When viewing a client detail
  if(selectedClient){
    return(
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>W</div>
            <div><div className={styles.logoName}>Wizards</div><div className={styles.logoSub}>Websites PMS</div></div>
          </div>
          <nav className={styles.nav}>
            {tabs.map(t=>(
              <button key={t.id} className={`${styles.navItem} ${tab===t.id?styles.navActive:''}`}
                onClick={()=>{setTab(t.id);setSelectedClient(null);}}>
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
        <main className={styles.main}>
          <header className={styles.header}>
            <div>
              <h1 className={styles.pageTitle}>🏢 {selectedClient.name}</h1>
              <p className={styles.pageSubtitle}>Full project timeline and details</p>
            </div>
            <div className={styles.headerMeta}>
              <button onClick={fetchData} style={{background:'var(--bg3)',border:'1px solid var(--border)',borderRadius:8,color:'var(--text2)',padding:'6px 12px',cursor:'pointer',fontSize:12}}>🔄 Refresh</button>
              <span className={styles.dateChip}>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</span>
            </div>
          </header>
          <div className={styles.content}>
            <ProjectDetail client={selectedClient} tasks={tasks} seo={seo} schedule={schedule} domains={domains} onBack={()=>setSelectedClient(null)} />
          </div>
        </main>
      </div>
    );
  }

  return(
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>W</div>
          <div><div className={styles.logoName}>Wizards</div><div className={styles.logoSub}>Websites PMS</div></div>
        </div>
        <nav className={styles.nav}>
          {tabs.map(t=>(
            <button key={t.id} className={`${styles.navItem} ${tab===t.id?styles.navActive:''}`} onClick={()=>setTab(t.id)}>
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

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>{tabs.find(t=>t.id===tab)?.icon} {tabs.find(t=>t.id===tab)?.label}</h1>
            <p className={styles.pageSubtitle}>
              {tab==='overview'&&'Agency performance at a glance'}
              {tab==='clients'&&'Click any client to view full project timeline'}
              {tab==='tasks'&&'All tasks and action items across clients'}
              {tab==='seo'&&'SEO activities and optimisation log'}
              {tab==='domains'&&'Domain, hosting & SSL tracker'}
              {tab==='schedule'&&'Upcoming events and meetings'}
              {tab==='team'&&'Team members, roles and responsibilities'}
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
              <div className={styles.statsGrid}>
                {[
                  {label:'Total Clients',value:clients.length,icon:'🏢',color:'var(--accent)'},
                  {label:'Active Tasks',value:pendingTasks.length,icon:'✅',color:'var(--blue)'},
                  {label:'High Priority',value:highPriority.length,icon:'🔥',color:'var(--red)'},
                  {label:'SEO Activities',value:seo.length,icon:'📈',color:'var(--green)'},
                  {label:'Domains',value:domains.length,icon:'🌐',color:'var(--yellow)'},
                  {label:'Team Members',value:team.length,icon:'👥',color:'var(--orange)'},
                ].map((s,i)=>(
                  <div key={i} className={`card ${styles.statCard}`}>
                    <div className={styles.statIcon} style={{color:s.color}}>{s.icon}</div>
                    <div className={styles.statValue} style={{color:s.color}}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div className={styles.overviewGrid}>
                <div className="card">
                  <h3 className={styles.cardTitle}>🔥 High Priority Tasks</h3>
                  {highPriority.length===0?<div className="empty-state"><div className="icon">✨</div><p>All clear!</p></div>:
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
                      <span className="badge badge-accent">{e.type}</span>
                    </div>
                  ))}</div>}
                </div>
                <div className="card">
                  <h3 className={styles.cardTitle}>🏢 Active Projects</h3>
                  <div className={styles.taskList}>{activeClients.slice(0,6).map((c:any)=>(
                    <div key={c.id} className={styles.taskItem} style={{cursor:'pointer'}} onClick={()=>{setSelectedClient(c);setTab('clients');}}>
                      <div><div className={styles.taskTitle}>{c.name}</div><div className={styles.taskMeta}>{c.website||c.draftUrl||'No URL'}</div></div>
                      <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                    </div>
                  ))}</div>
                </div>
                <div className="card">
                  <h3 className={styles.cardTitle}>👥 Team</h3>
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
                <div key={c.id} className={`card ${styles.clientCard}`} style={{cursor:'pointer'}} onClick={()=>setSelectedClient(c)}>
                  <div className={styles.clientHeader}>
                    <div className={styles.clientAvatar}>{c.name.charAt(0)}</div>
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
                  <div style={{fontSize:11,color:'var(--text3)',textAlign:'right',marginTop:2}}>Click to view full timeline →</div>
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
                    <td style={{fontSize:12}}>{t.assignedTo}</td>
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
                <thead><tr><th>Activity</th><th>Client</th><th>Assigned</th><th>Date</th><th>Status</th><th>Notes</th></tr></thead>
                <tbody>{seo.map((s:any)=>(
                  <tr key={s.id}>
                    <td style={{fontWeight:600}}>{s.activity}</td>
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
                    <td style={{fontSize:12}}>{e.date}</td>
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
              {team.map((m:any)=>(
                <div key={m.id} className={`card ${styles.clientCard}`}>
                  <div className={styles.clientHeader}>
                    <div className={styles.clientAvatar} style={{background:'linear-gradient(135deg,#0d9e6e,#059669)',fontSize:14}}>{m.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}</div>
                    <div><div className={styles.clientName}>{m.name}</div><div style={{fontSize:12,color:'var(--text2)'}}>{m.designation}</div></div>
                    <span className={`badge ${statusColor(m.status)} ${styles.clientStatus}`}>{m.status}</span>
                  </div>
                  <div className={styles.serviceChips}>{(m.skills||[]).map((s:string)=><span key={s} className="badge badge-gray">{s}</span>)}</div>
                  {m.responsibilities&&<div className={styles.clientNotes}>{m.responsibilities}</div>}
                  <div className={styles.clientStats}>
                    <div className={styles.clientStat}><span style={{color:'var(--accent)'}}>{tasks.filter((t:any)=>t.assignedTo===m.name&&t.status!=='Completed').length}</span><small>Open</small></div>
                    <div className={styles.clientStat}><span style={{color:'var(--green)'}}>{tasks.filter((t:any)=>t.assignedTo===m.name&&t.status==='Completed').length}</span><small>Done</small></div>
                    <div className={styles.clientStat}><span style={{color:'var(--purple)'}}>{(m.assignedClients||[]).length}</span><small>Clients</small></div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

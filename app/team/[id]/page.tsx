'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { fetchPMS, statusColor, priorityColor, avatarColor, daysUntil } from '../../lib/api'
import styles from '../../page.module.css'

export default function TeamMemberPage() {
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

  const member = data.team?.find((m:any) => m.id === id)
  if (!member) return <div className={styles.loader}><p>Member not found</p><Link href="/">← Back</Link></div>

  const tasks = data.tasks || []
  const myTasks = tasks.filter((t:any) => t.assignedTo === member.name)
  const openTasks = myTasks.filter((t:any) => t.status !== 'Completed')
  const doneTasks = myTasks.filter((t:any) => t.status === 'Completed')
  const highTasks = myTasks.filter((t:any) => ['High','Critical'].includes(t.priority) && t.status !== 'Completed')
  const blockedTasks = myTasks.filter((t:any) => ['Blocked','Open'].includes(t.status))

  const today = new Date().toISOString().slice(0,10)
  const col = avatarColor(member.name)
  const initials = member.name.split(' ').map((n:string)=>n[0]).join('').slice(0,2)

  // Group by client
  const byClient: Record<string,any[]> = {}
  openTasks.forEach((t:any) => { const k=t.clientName||'Unknown'; if(!byClient[k])byClient[k]=[]; byClient[k].push(t) })

  // Planned with date
  const plannedWithDate = openTasks.filter((t:any)=>t.dueDate).sort((a:any,b:any)=>a.dueDate.localeCompare(b.dueDate))
  const plannedNoDate = openTasks.filter((t:any)=>!t.dueDate)

  // Completed by date
  const completedByDate: Record<string,any[]> = {}
  doneTasks.forEach((t:any)=>{ const k=t.completedAt||'Unknown Date'; if(!completedByDate[k])completedByDate[k]=[]; completedByDate[k].push(t) })

  // Group planned by due date
  const byDate: Record<string,any[]> = {}
  plannedWithDate.forEach((t:any) => { if(!byDate[t.dueDate])byDate[t.dueDate]=[]; byDate[t.dueDate].push(t) })

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
          <span style={{fontSize:13,color:'var(--text2)'}}>Team</span>
          <span style={{color:'var(--text3)'}}>/</span>
          <span style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>{member.name}</span>
        </div>
        <button onClick={() => window.print()} style={{background:'var(--accent)',color:'white',border:'none',borderRadius:8,padding:'7px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>🖨️ Print Report</button>
      </div>

      {/* Print header */}
      <div className="print-header" style={{padding:'20px 28px',borderBottom:'2px solid #333',marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <div><div style={{fontSize:22,fontWeight:800}}>Wizards Websites</div><div style={{fontSize:13,color:'#666'}}>Team Member Report — {member.name}</div></div>
          <div style={{textAlign:'right',fontSize:12,color:'#666'}}><div>{new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</div><div>web.wizards.co.in</div></div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'24px 28px'}}>

        {/* Hero */}
        <div className="card" style={{marginBottom:20}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
            <div style={{display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:56,height:56,background:`linear-gradient(135deg,${col},${col}99)`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:22,flexShrink:0}}>{initials}</div>
              <div>
                <div style={{fontSize:22,fontWeight:800}}>{member.name}</div>
                <div style={{fontSize:13,color:'var(--text2)',marginTop:3}}>{member.designation}</div>
                {member.isSeniorPartner && <span className="badge badge-purple" style={{marginTop:6,display:'inline-flex'}}>⭐ Senior Partner</span>}
              </div>
            </div>
            <span className={`badge ${statusColor(member.status)}`}>{member.status}</span>
          </div>
          {member.skills?.length>0 && <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:14}}>{member.skills.map((s:string)=><span key={s} className="badge badge-gray">🏷 {s}</span>)}</div>}
          {member.responsibilities && <div style={{background:'var(--bg3)',borderRadius:8,padding:'10px 14px',marginTop:12,fontSize:13,color:'var(--text2)',lineHeight:1.6,borderLeft:'3px solid var(--green)'}}>📋 {member.responsibilities}</div>}

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))',gap:10,marginTop:14,paddingTop:14,borderTop:'1px solid var(--border)'}}>
            {[{l:'Total',v:myTasks.length,c:'var(--accent)'},{l:'Open',v:openTasks.length,c:'var(--yellow)'},{l:'Completed',v:doneTasks.length,c:'var(--green)'},{l:'High Priority',v:highTasks.length,c:'var(--red)'},{l:'Blocked',v:blockedTasks.length,c:'var(--red)'},{l:'Projects',v:Object.keys(byClient).length,c:'var(--purple)'}].map((s,i)=>(
              <div key={i} style={{textAlign:'center'}}>
                <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text3)',marginBottom:3}}>{s.l}</div>
                <div style={{fontSize:20,fontWeight:800,color:s.c}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        {myTasks.length > 0 && (
          <div className="card" style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>📊 Progress</div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
              <div style={{flex:1,height:10,background:'var(--bg3)',borderRadius:10,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${Math.round(doneTasks.length/myTasks.length*100)}%`,background:'linear-gradient(90deg,var(--green),#34d399)',borderRadius:10}}/>
              </div>
              <span style={{fontSize:13,fontWeight:700,color:'var(--green)',whiteSpace:'nowrap'}}>{Math.round(doneTasks.length/myTasks.length*100)}%</span>
            </div>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              {[{l:'Completed',c:doneTasks.length,co:'var(--green)'},{l:'In Progress',c:myTasks.filter((t:any)=>t.status==='In Progress').length,co:'var(--accent)'},{l:'Pending',c:myTasks.filter((t:any)=>t.status==='Pending').length,co:'var(--yellow)'},{l:'Blocked',c:blockedTasks.length,co:'var(--red)'}].map(s=>(
                <div key={s.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:s.co}}/><span style={{color:'var(--text2)'}}>{s.l}:</span><span style={{fontWeight:700,color:s.co}}>{s.c}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planned — Scheduled by date */}
        {plannedWithDate.length > 0 && (
          <div className="card" style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📅 Planned — Scheduled by Date</div>
            {Object.entries(byDate).map(([date, dateTasks]:any) => (
              <div key={date} style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <div style={{padding:'3px 12px',background:date<=today?'var(--redBg)':'var(--blueBg)',color:date<=today?'var(--red)':'var(--blue)',borderRadius:20,fontSize:12,fontWeight:700}}>
                    {date < today ? '⚠️ Overdue: ' : date === today ? '🔴 Today: ' : '📅 '}{date}
                  </div>
                  <div style={{flex:1,height:1,background:'var(--border)'}}/>
                  <span style={{fontSize:11,color:'var(--text3)'}}>{dateTasks.length} task{dateTasks.length>1?'s':''}</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:8}}>
                  {dateTasks.map((t:any) => <TaskCard key={t.id} t={t} today={today} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Planned — No date */}
        {plannedNoDate.length > 0 && (
          <div className="card" style={{marginBottom:20}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📌 Planned — No Date Set ({plannedNoDate.length})</div>
            {Object.entries(byClient).filter(([,t]:any)=>t.some((x:any)=>!x.dueDate)).map(([clientName,cTasks]:any) => {
              const nd = cTasks.filter((t:any)=>!t.dueDate)
              if (!nd.length) return null
              return (
                <div key={clientName} style={{marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--accent)',marginBottom:6}}>🏢 {clientName} ({nd.length})</div>
                  <div style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:8}}>
                    {nd.map((t:any) => <TaskCard key={t.id} t={t} today={today} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Daily log */}
        <div className="card" style={{marginBottom:20}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:14}}>📆 Daily Log — Completed Tasks</div>
          {doneTasks.length === 0 ? <div className="empty-state"><div className="icon">📭</div><p>No completed tasks yet</p></div> :
          Object.entries(completedByDate).sort((a,b)=>b[0].localeCompare(a[0])).map(([date, dt]:any)=>(
            <div key={date} style={{marginBottom:14}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                <div style={{padding:'3px 12px',background:'var(--greenBg)',color:'var(--green)',borderRadius:20,fontSize:12,fontWeight:700}}>✅ {date==='Unknown Date'?'Date not recorded':date}</div>
                <div style={{flex:1,height:1,background:'var(--border)'}}/>
                <span style={{fontSize:11,color:'var(--text3)'}}>{dt.length} done</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6,paddingLeft:8}}>
                {dt.map((t:any)=>(
                  <CompletedTaskCard key={t.id} t={t} />
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

function TaskCard({t, today}: {t:any, today:string}) {
  const [copied, setCopied] = useState(false)

  function buildCopyText() {
    const lines: string[] = []
    lines.push(`📋 ${t.title}`)
    lines.push(`🏢 Client: ${t.clientName}`)
    if (t.type)        lines.push(`🏷 Type: ${t.type}`)
    if (t.priority)    lines.push(`⚡ Priority: ${t.priority}`)
    if (t.status)      lines.push(`📌 Status: ${t.status}`)
    if (t.dueDate)     lines.push(`⏰ Due: ${t.dueDate}`)
    if (t.description) lines.push(`📝 ${t.description}`)
    if (t.notes)       lines.push(`💡 Notes: ${t.notes}`)
    if (t.followUpBy)  lines.push(`👁 Follow-up: ${t.followUpBy}`)
    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch(e) {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = buildCopyText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const isOverdue = t.dueDate && t.dueDate < today
  const isToday   = t.dueDate && t.dueDate === today

  return (
    <div style={{background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)',overflow:'hidden',boxShadow:'var(--shadow)'}}>
      {/* Client name bar at top */}
      <div style={{background:'var(--accentBg)',borderBottom:'1px solid var(--border)',padding:'5px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,fontWeight:700,color:'var(--accent)',letterSpacing:'.02em'}}>🏢 {t.clientName}</span>
        <span className="badge badge-gray" style={{fontSize:10}}>{t.type}</span>
      </div>

      {/* Main content */}
      <div style={{padding:'10px 14px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10}}>
          <div style={{fontWeight:700,fontSize:13,color:'var(--text)',lineHeight:1.4,flex:1}}>{t.title}</div>
          <div style={{display:'flex',flexDirection:'column',gap:4,alignItems:'flex-end',flexShrink:0}}>
            <span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span>
            <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
          </div>
        </div>

        {t.description && (
          <div style={{fontSize:12,color:'var(--text2)',marginTop:6,lineHeight:1.5}}>{t.description}</div>
        )}
        {t.notes && (
          <div style={{fontSize:11,color:'var(--text3)',marginTop:4,fontStyle:'italic'}}>💡 {t.notes}</div>
        )}

        {/* Footer row */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:10,gap:8,flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',fontSize:11,color:'var(--text3)'}}>
            {t.dueDate && (
              <span style={{color:isOverdue?'var(--red)':isToday?'var(--red)':'inherit',fontWeight:isToday||isOverdue?700:400}}>
                {isOverdue?'⚠️ Overdue:':isToday?'🔴 Due Today':'⏰'} {t.dueDate}
              </span>
            )}
            {t.followUpBy && <span>👁 {t.followUpBy}</span>}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            className="no-print"
            style={{
              display:'flex',alignItems:'center',gap:5,
              padding:'5px 12px',
              background:copied?'var(--greenBg)':'var(--bg3)',
              border:`1px solid ${copied?'#bbf7d0':'var(--border)'}`,
              borderRadius:7,cursor:'pointer',
              fontSize:11,fontWeight:600,
              color:copied?'var(--green)':'var(--text2)',
              transition:'all .2s',
              fontFamily:'inherit',
              flexShrink:0
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

function CompletedTaskCard({t}: {t:any}) {
  const [copied, setCopied] = useState(false)

  function buildCopyText() {
    const lines: string[] = []
    lines.push(`✅ ${t.title}`)
    lines.push(`🏢 Client: ${t.clientName}`)
    if (t.type)        lines.push(`🏷 Type: ${t.type}`)
    if (t.description) lines.push(`📝 ${t.description}`)
    if (t.completedAt) lines.push(`📅 Completed: ${t.completedAt}`)
    return lines.join('\n')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch(e) {
      const ta = document.createElement('textarea')
      ta.value = buildCopyText()
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div style={{background:'var(--bg2)',borderRadius:10,border:'1px solid #bbf7d0',overflow:'hidden'}}>
      {/* Client bar */}
      <div style={{background:'var(--greenBg)',borderBottom:'1px solid #bbf7d0',padding:'5px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <span style={{fontSize:11,fontWeight:700,color:'var(--green)'}}>🏢 {t.clientName}</span>
        <span className="badge badge-gray" style={{fontSize:10}}>{t.type}</span>
      </div>
      {/* Content */}
      <div style={{padding:'9px 14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:10}}>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:13,textDecoration:'line-through',opacity:.65}}>{t.title}</div>
          {t.description && <div style={{fontSize:11,color:'var(--text3)',marginTop:3,lineHeight:1.4}}>{t.description}</div>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          <span className="badge badge-green">✓ Done</span>
          <button
            onClick={handleCopy}
            className="no-print"
            style={{
              display:'flex',alignItems:'center',gap:5,
              padding:'5px 12px',
              background:copied?'var(--greenBg)':'var(--bg3)',
              border:`1px solid ${copied?'#bbf7d0':'var(--border)'}`,
              borderRadius:7,cursor:'pointer',
              fontSize:11,fontWeight:600,
              color:copied?'var(--green)':'var(--text2)',
              transition:'all .2s',
              fontFamily:'inherit'
            }}
          >
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}

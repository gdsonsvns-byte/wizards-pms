'use client'
import { useState } from 'react'
import clientsData from '../data/clients.json'
import tasksData from '../data/tasks.json'
import seoData from '../data/seo.json'
import domainsData from '../data/domains.json'
import scheduleData from '../data/schedule.json'
import styles from './page.module.css'

type Tab = 'overview' | 'clients' | 'tasks' | 'seo' | 'domains' | 'schedule'

function priorityColor(p: string) {
  if (p === 'High') return 'badge-red'
  if (p === 'Medium') return 'badge-yellow'
  return 'badge-blue'
}

function statusColor(s: string) {
  if (s === 'Active' || s === 'Completed' || s === 'Live') return 'badge-green'
  if (s === 'In Progress') return 'badge-blue'
  if (s === 'Pending' || s === 'Upcoming') return 'badge-yellow'
  if (s === 'Overdue') return 'badge-red'
  return 'badge-gray'
}

function daysUntil(dateStr: string) {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function expiryBadge(dateStr: string) {
  if (!dateStr) return <span className="badge badge-gray">Not Set</span>
  const days = daysUntil(dateStr)!
  if (days < 0) return <span className="badge badge-red">Expired</span>
  if (days < 30) return <span className="badge badge-red">{days}d left</span>
  if (days < 90) return <span className="badge badge-yellow">{days}d left</span>
  return <span className="badge badge-green">{new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
}

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>('overview')

  const clients = clientsData
  const tasks = tasksData
  const seo = seoData
  const domains = domainsData
  const schedule = scheduleData

  const pendingTasks = tasks.filter(t => t.status !== 'Completed')
  const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed')
  const upcomingEvents = schedule.filter(e => new Date(e.date) >= new Date()).slice(0, 5)

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: '⚡' },
    { id: 'clients', label: 'Clients', icon: '🏢', count: clients.length },
    { id: 'tasks', label: 'Tasks', icon: '✅', count: pendingTasks.length },
    { id: 'seo', label: 'SEO', icon: '📈', count: seo.length },
    { id: 'domains', label: 'Domains', icon: '🌐', count: domains.length },
    { id: 'schedule', label: 'Schedule', icon: '📅', count: upcomingEvents.length },
  ]

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>W</div>
          <div>
            <div className={styles.logoName}>Wizards</div>
            <div className={styles.logoSub}>Websites PMS</div>
          </div>
        </div>

        <nav className={styles.nav}>
          {tabs.map(t => (
            <button
              key={t.id}
              className={`${styles.navItem} ${tab === t.id ? styles.navActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className={styles.navIcon}>{t.icon}</span>
              <span className={styles.navLabel}>{t.label}</span>
              {t.count !== undefined && (
                <span className={styles.navCount}>{t.count}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.agencyBadge}>
            <div className={styles.agencyDot}></div>
            <span>Agency Active</span>
          </div>
          <div className={styles.lastUpdated}>
            Updated {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>
              {tabs.find(t => t.id === tab)?.icon} {tabs.find(t => t.id === tab)?.label}
            </h1>
            <p className={styles.pageSubtitle}>
              {tab === 'overview' && 'Agency performance at a glance'}
              {tab === 'clients' && 'All client accounts and services'}
              {tab === 'tasks' && 'Tasks and action items across all clients'}
              {tab === 'seo' && 'SEO activities and optimisation log'}
              {tab === 'domains' && 'Domain, hosting & SSL tracker'}
              {tab === 'schedule' && 'Upcoming events and meetings'}
            </p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.dateChip}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </header>

        <div className={styles.content}>

          {/* ─── OVERVIEW ─── */}
          {tab === 'overview' && (
            <div>
              <div className={styles.statsGrid}>
                {[
                  { label: 'Total Clients', value: clients.length, icon: '🏢', color: 'var(--accent)' },
                  { label: 'Active Tasks', value: pendingTasks.length, icon: '✅', color: 'var(--blue)' },
                  { label: 'High Priority', value: highPriority.length, icon: '🔥', color: 'var(--red)' },
                  { label: 'SEO Activities', value: seo.length, icon: '📈', color: 'var(--green)' },
                  { label: 'Domains Tracked', value: domains.length, icon: '🌐', color: 'var(--yellow)' },
                  { label: 'Upcoming Events', value: upcomingEvents.length, icon: '📅', color: 'var(--orange)' },
                ].map((s, i) => (
                  <div key={i} className={`card ${styles.statCard}`}>
                    <div className={styles.statIcon} style={{ color: s.color }}>{s.icon}</div>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className={styles.overviewGrid}>
                {/* Recent Tasks */}
                <div className="card">
                  <h3 className={styles.cardTitle}>🔥 High Priority Tasks</h3>
                  {highPriority.length === 0 ? (
                    <div className="empty-state"><div className="icon">✨</div><p>No high priority tasks</p></div>
                  ) : (
                    <div className={styles.taskList}>
                      {highPriority.slice(0, 5).map(t => (
                        <div key={t.id} className={styles.taskItem}>
                          <div>
                            <div className={styles.taskTitle}>{t.title}</div>
                            <div className={styles.taskMeta}>{t.clientName} · Due {t.dueDate}</div>
                          </div>
                          <span className={`badge ${statusColor(t.status)}`}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Upcoming Events */}
                <div className="card">
                  <h3 className={styles.cardTitle}>📅 Upcoming Events</h3>
                  {upcomingEvents.length === 0 ? (
                    <div className="empty-state"><div className="icon">📭</div><p>No upcoming events</p></div>
                  ) : (
                    <div className={styles.taskList}>
                      {upcomingEvents.map(e => (
                        <div key={e.id} className={styles.taskItem}>
                          <div>
                            <div className={styles.taskTitle}>{e.title}</div>
                            <div className={styles.taskMeta}>{e.clientName} · {e.date} {e.time}</div>
                          </div>
                          <span className={`badge ${statusColor(e.status)}`}>{e.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Clients Summary */}
                <div className="card">
                  <h3 className={styles.cardTitle}>🏢 Client Overview</h3>
                  <div className={styles.taskList}>
                    {clients.map(c => (
                      <div key={c.id} className={styles.taskItem}>
                        <div>
                          <div className={styles.taskTitle}>{c.name}</div>
                          <div className={styles.taskMeta}>{c.website}</div>
                        </div>
                        <span className={`badge ${statusColor(c.status)}`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Domain Alerts */}
                <div className="card">
                  <h3 className={styles.cardTitle}>⚠️ Domain & SSL Alerts</h3>
                  {domains.length === 0 ? (
                    <div className="empty-state"><div className="icon">🌐</div><p>No domains tracked</p></div>
                  ) : (
                    <div className={styles.taskList}>
                      {domains.map(d => (
                        <div key={d.id} className={styles.taskItem}>
                          <div>
                            <div className={styles.taskTitle}>{d.domain}</div>
                            <div className={styles.taskMeta}>{d.hostingProvider}</div>
                          </div>
                          {expiryBadge(d.domainExpiry)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── CLIENTS ─── */}
          {tab === 'clients' && (
            <div>
              {clients.length === 0 ? (
                <div className="card empty-state"><div className="icon">🏢</div><p>No clients yet</p></div>
              ) : (
                <div className={styles.clientGrid}>
                  {clients.map(c => (
                    <div key={c.id} className={`card ${styles.clientCard}`}>
                      <div className={styles.clientHeader}>
                        <div className={styles.clientAvatar}>{c.name.charAt(0)}</div>
                        <div>
                          <div className={styles.clientName}>{c.name}</div>
                          <a href={`https://${c.website}`} target="_blank" rel="noreferrer" className={styles.clientSite}>{c.website} ↗</a>
                        </div>
                        <span className={`badge ${statusColor(c.status)} ${styles.clientStatus}`}>{c.status}</span>
                      </div>
                      {c.email && <div className={styles.clientDetail}>✉️ {c.email}</div>}
                      {c.phone && <div className={styles.clientDetail}>📞 {c.phone}</div>}
                      <div className={styles.clientDetail}>📅 Since {c.since}</div>
                      <div className={styles.serviceChips}>
                        {c.services.map(s => <span key={s} className={`badge badge-purple`}>{s}</span>)}
                      </div>
                      {c.notes && <div className={styles.clientNotes}>{c.notes}</div>}
                      <div className={styles.clientStats}>
                        <div className={styles.clientStat}>
                          <span>{tasks.filter(t => t.clientId === c.id && t.status !== 'Completed').length}</span>
                          <small>Open Tasks</small>
                        </div>
                        <div className={styles.clientStat}>
                          <span>{seo.filter(s => s.clientId === c.id).length}</span>
                          <small>SEO Activities</small>
                        </div>
                        <div className={styles.clientStat}>
                          <span>{schedule.filter(e => e.clientId === c.id && new Date(e.date) >= new Date()).length}</span>
                          <small>Upcoming</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ─── TASKS ─── */}
          {tab === 'tasks' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {tasks.length === 0 ? (
                <div className="empty-state"><div className="icon">✅</div><p>No tasks yet</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Client</th>
                      <th>Type</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(t => (
                      <tr key={t.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{t.title}</div>
                          {t.description && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{t.description}</div>}
                        </td>
                        <td>{t.clientName}</td>
                        <td><span className="badge badge-purple">{t.type}</span></td>
                        <td><span className={`badge ${priorityColor(t.priority)}`}>{t.priority}</span></td>
                        <td style={{ color: t.dueDate && daysUntil(t.dueDate)! < 3 ? 'var(--red)' : 'inherit' }}>
                          {t.dueDate || '—'}
                        </td>
                        <td><span className={`badge ${statusColor(t.status)}`}>{t.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── SEO ─── */}
          {tab === 'seo' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {seo.length === 0 ? (
                <div className="empty-state"><div className="icon">📈</div><p>No SEO activities logged yet</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seo.map(s => (
                      <tr key={s.id}>
                        <td><span style={{ fontWeight: 500 }}>{s.activity}</span></td>
                        <td>{s.clientName}</td>
                        <td>{s.date}</td>
                        <td><span className={`badge ${statusColor(s.status)}`}>{s.status}</span></td>
                        <td style={{ color: 'var(--text2)', maxWidth: 300 }}>{s.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── DOMAINS ─── */}
          {tab === 'domains' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {domains.length === 0 ? (
                <div className="empty-state"><div className="icon">🌐</div><p>No domains tracked yet</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Domain</th>
                      <th>Client</th>
                      <th>Registrar</th>
                      <th>Domain Expiry</th>
                      <th>Hosting</th>
                      <th>Hosting Expiry</th>
                      <th>SSL Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map(d => (
                      <tr key={d.id}>
                        <td>
                          <a href={`https://${d.domain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>
                            {d.domain} ↗
                          </a>
                        </td>
                        <td>{d.clientName}</td>
                        <td>{d.registrar || '—'}</td>
                        <td>{expiryBadge(d.domainExpiry)}</td>
                        <td>{d.hostingProvider || '—'}</td>
                        <td>{expiryBadge(d.hostingExpiry)}</td>
                        <td>{expiryBadge(d.sslExpiry)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ─── SCHEDULE ─── */}
          {tab === 'schedule' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {schedule.length === 0 ? (
                <div className="empty-state"><div className="icon">📅</div><p>No events scheduled yet</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(e => (
                      <tr key={e.id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{e.title}</div>
                          {e.description && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>{e.description}</div>}
                        </td>
                        <td>{e.clientName}</td>
                        <td>{e.date}</td>
                        <td>{e.time || '—'}</td>
                        <td><span className="badge badge-blue">{e.type}</span></td>
                        <td><span className={`badge ${statusColor(e.status)}`}>{e.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

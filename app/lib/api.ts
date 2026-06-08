export const API_BASE = 'https://pms.wizards.co.in/api.php'

export async function fetchPMS() {
  const res = await fetch(`${API_BASE}?action=get_all&t=${Date.now()}`)
  const json = await res.json()
  if (json.status !== 'ok') throw new Error('Failed to load PMS data')
  return json.data
}

export function statusColor(s: string) {
  if (['Active','Completed','Live','Ongoing'].includes(s)) return 'badge-green'
  if (['In Progress','Review Pending','Active - Dev'].includes(s)) return 'badge-accent'
  if (['Pending','Upcoming','Resuming','Pending Approval','Details Pending','Planned'].includes(s)) return 'badge-yellow'
  if (['Overdue','Blocked','Open'].includes(s)) return 'badge-red'
  return 'badge-gray'
}

export function priorityColor(p: string) {
  if (['Critical','High'].includes(p)) return 'badge-red'
  if (p === 'Medium') return 'badge-yellow'
  return 'badge-blue'
}

export function avatarColor(name: string) {
  const colors = ['#3b5bdb','#0d9e6e','#d97706','#7c3aed','#dc2626','#ea580c','#2563eb','#0891b2']
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xFFFF
  return colors[h % colors.length]
}

export function daysUntil(d: string) {
  if (!d) return null
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
}

export function getClientCategory(client: any): 'active' | 'maintenance' | 'prospective' {
  const cat = (client.category || '').toLowerCase()
  if (cat === 'maintenance') return 'maintenance'
  if (cat === 'prospective') return 'prospective'
  if (['Ganga Papers Pvt Ltd','EarthyHues'].includes(client.name)) return 'maintenance'
  if (client.status === 'Details Pending') return 'prospective'
  return 'active'
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

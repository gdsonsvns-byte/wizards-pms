'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (pathname === '/login') { setChecked(true); return }
    const raw = localStorage.getItem('pms_user')
    if (!raw) { router.replace('/login'); return }
    try {
      const user = JSON.parse(raw)
      if (Date.now() > user.expiresAt) {
        localStorage.removeItem('pms_user')
        router.replace('/login')
      } else {
        setChecked(true)
      }
    } catch {
      localStorage.removeItem('pms_user')
      router.replace('/login')
    }
  }, [pathname])

  if (!checked && pathname !== '/login') {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f4f6f9',flexDirection:'column',gap:14}}>
        <div style={{width:40,height:40,background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:20}}>W</div>
        <div style={{color:'#8896a8',fontSize:13}}>Loading...</div>
      </div>
    )
  }
  return <>{children}</>
}

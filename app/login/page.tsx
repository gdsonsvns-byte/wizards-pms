'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep]     = useState<'email'|'otp'>('email')
  const [email, setEmail]   = useState('')
  const [otp, setOtp]       = useState('')
  const [name, setName]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleSendOTP() {
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); setLoading(false); return }
      setName(data.name)
      setStep('otp')
    } catch(e) {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  async function handleVerifyOTP() {
    if (!otp.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Verification failed'); setLoading(false); return }
      // Store session with 7-day expiry
      const session = {
        ...data.user,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 days
      }
      localStorage.setItem('pms_user', JSON.stringify(session))
      router.push('/')
    } catch(e) {
      setError('Network error. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f4f6f9',display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{background:'white',border:'1px solid #e2e6ed',borderRadius:20,padding:'36px 32px',width:'100%',maxWidth:400,boxShadow:'0 4px 24px rgba(0,0,0,.08)'}}>

        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:28}}>
          <div style={{width:42,height:42,background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:20,boxShadow:'0 4px 12px rgba(59,91,219,.3)'}}>W</div>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:'#141824'}}>Wizards Websites</div>
            <div style={{fontSize:11,color:'#8896a8',letterSpacing:'.04em',textTransform:'uppercase',marginTop:1}}>Agency PMS</div>
          </div>
        </div>

        {step === 'email' && (
          <>
            <div style={{fontSize:18,fontWeight:800,color:'#141824',marginBottom:6}}>Sign In</div>
            <div style={{fontSize:13,color:'#4a5568',marginBottom:24}}>Enter your work email to receive a login code.</div>

            <label style={{fontSize:12,fontWeight:700,color:'#4a5568',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key==='Enter' && handleSendOTP()}
              placeholder="your@email.com"
              style={{width:'100%',padding:'11px 14px',border:'1px solid #e2e6ed',borderRadius:10,fontSize:14,color:'#141824',outline:'none',fontFamily:'inherit',marginBottom:16,background:'#f4f6f9'}}
              autoFocus
            />

            {error && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'9px 12px',fontSize:13,color:'#dc2626',marginBottom:14}}>{error}</div>}

            <button
              onClick={handleSendOTP}
              disabled={loading || !email.trim()}
              style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:loading||!email.trim()?'not-allowed':'pointer',opacity:loading||!email.trim()?.5:1,fontFamily:'inherit',transition:'opacity .15s'}}
            >
              {loading ? 'Sending...' : 'Send Login Code →'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{fontSize:18,fontWeight:800,color:'#141824',marginBottom:6}}>Welcome, {name} 👋</div>
            <div style={{fontSize:13,color:'#4a5568',marginBottom:6}}>A 6-digit code was sent to:</div>
            <div style={{fontSize:13,fontWeight:700,color:'#3b5bdb',marginBottom:24}}>{email}</div>

            <label style={{fontSize:12,fontWeight:700,color:'#4a5568',display:'block',marginBottom:6,textTransform:'uppercase',letterSpacing:'.05em'}}>6-Digit Code</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
              onKeyDown={e => e.key==='Enter' && handleVerifyOTP()}
              placeholder="000000"
              maxLength={6}
              style={{width:'100%',padding:'14px',border:'1px solid #e2e6ed',borderRadius:10,fontSize:28,fontWeight:800,letterSpacing:10,textAlign:'center',color:'#3b5bdb',outline:'none',fontFamily:'monospace',marginBottom:16,background:'#f4f6f9'}}
              autoFocus
            />

            {error && <div style={{background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:8,padding:'9px 12px',fontSize:13,color:'#dc2626',marginBottom:14}}>{error}</div>}

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length !== 6}
              style={{width:'100%',padding:'12px',background:'linear-gradient(135deg,#3b5bdb,#5c7cfa)',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:700,cursor:loading||otp.length!==6?'not-allowed':'pointer',opacity:loading||otp.length!==6?.5:1,fontFamily:'inherit',marginBottom:12,transition:'opacity .15s'}}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In'}
            </button>

            <button
              onClick={() => { setStep('email'); setOtp(''); setError('') }}
              style={{width:'100%',padding:'10px',background:'transparent',color:'#8896a8',border:'1px solid #e2e6ed',borderRadius:10,fontSize:13,cursor:'pointer',fontFamily:'inherit'}}
            >
              ← Use a different email
            </button>

            <div style={{fontSize:11,color:'#8896a8',textAlign:'center',marginTop:12}}>Code expires in 10 minutes</div>
          </>
        )}

      </div>
    </div>
  )
}

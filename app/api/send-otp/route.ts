import { NextRequest, NextResponse } from 'next/server'

const TEAM: Record<string, { name: string; teamId: string }> = {
  'akshat.gd@gmail.com':           { name: 'Akshat Agrawal',   teamId: 'team_001' },
  'ravikhtn18@gmail.com':          { name: 'Ravi Khetan',      teamId: 'team_002' },
  'rahulkumarmaurya464@gmail.com': { name: 'Rahul Maurya',     teamId: 'team_003' },
  'priyeshrai369@gmail.com':       { name: 'Priyesh Rai',      teamId: 'team_007' },
  'rishi.wizards@gmail.com':       { name: 'Rishi Khatri',     teamId: 'team_004' },
  'ektandmitteamc@gmail.com':      { name: 'Ekta Yadav',       teamId: 'team_005' },
  'priyambada.wizards@gmail.com':  { name: 'Priyambada Gupta', teamId: 'team_006' },
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const key = email.trim().toLowerCase()
    const member = TEAM[key]

    if (!member) {
      return NextResponse.json({ error: 'Email not authorised' }, { status: 403 })
    }

    const otp = generateOTP()
    const expires = Date.now() + 10 * 60 * 1000 // 10 minutes

    // Store OTP payload in a cookie — survives across serverless instances
    const payload = Buffer.from(JSON.stringify({ otp, expires, email: key, ...member })).toString('base64')

    // Send email via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Wizards PMS <leads@wizards.co.in>',
        to: [key],
        subject: `PMS Login Code: ${otp}`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#f4f6f9;">
  <div style="background:white;border-radius:16px;padding:32px;border:1px solid #e2e6ed;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:38px;height:38px;background:linear-gradient(135deg,#3b5bdb,#5c7cfa);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:18px;">W</div>
      <span style="font-size:15px;font-weight:800;color:#141824;">Wizards Websites PMS</span>
    </div>
    <p style="color:#4a5568;font-size:14px;margin:0 0 8px;">Hi ${member.name},</p>
    <p style="color:#4a5568;font-size:14px;margin:0 0 24px;">Your one-time login code:</p>
    <div style="background:#eef2ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <div style="font-size:40px;font-weight:800;letter-spacing:10px;color:#3b5bdb;font-family:monospace;">${otp}</div>
    </div>
    <p style="color:#8896a8;font-size:12px;margin:0 0 6px;">⏱ Expires in <strong>10 minutes</strong></p>
    <p style="color:#8896a8;font-size:12px;margin:0;">Do not share this code with anyone.</p>
    <hr style="border:none;border-top:1px solid #e2e6ed;margin:24px 0 16px;">
    <p style="color:#c0c8d4;font-size:11px;margin:0;">Wizards Websites Agency · web.wizards.co.in</p>
  </div>
</div>`,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 500 })
    }

    // Set OTP in cookie — httpOnly, secure, 10-min expiry
    const response = NextResponse.json({ success: true, name: member.name })
    response.cookies.set('pms_otp', payload, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 10 * 60, // 10 minutes in seconds
      path: '/',
    })
    return response

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

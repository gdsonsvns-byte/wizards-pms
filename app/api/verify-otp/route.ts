import { NextRequest, NextResponse } from 'next/server'

// Import shared store from send-otp
// Note: In serverless, this works within the same warm instance
// For production scale, replace with Redis/DB. For this team size, fine.
import { otpStore } from '../send-otp/route'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    const key = email.trim().toLowerCase()
    const record = otpStore[key]

    if (!record) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    if (Date.now() > record.expires) {
      delete otpStore[key]
      return NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 })
    }

    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
    }

    // Valid — clear OTP
    delete otpStore[key]

    // Return session info — client stores in sessionStorage
    return NextResponse.json({
      success: true,
      user: {
        name:   record.name,
        teamId: record.teamId,
        email:  key,
      }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

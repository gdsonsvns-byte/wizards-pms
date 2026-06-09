import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()
    const key = email.trim().toLowerCase()

    // Read OTP payload from cookie
    const cookieVal = req.cookies.get('pms_otp')?.value
    if (!cookieVal) {
      return NextResponse.json({ error: 'No OTP found. Please request a new one.' }, { status: 400 })
    }

    let record: any
    try {
      record = JSON.parse(Buffer.from(cookieVal, 'base64').toString('utf8'))
    } catch {
      return NextResponse.json({ error: 'Invalid OTP session. Please request a new one.' }, { status: 400 })
    }

    // Check email matches
    if (record.email !== key) {
      return NextResponse.json({ error: 'Email mismatch. Please request a new one.' }, { status: 400 })
    }

    // Check expiry
    if (Date.now() > record.expires) {
      const response = NextResponse.json({ error: 'OTP expired. Please request a new one.' }, { status: 400 })
      response.cookies.delete('pms_otp')
      return response
    }

    // Check OTP
    if (record.otp !== otp.trim()) {
      return NextResponse.json({ error: 'Incorrect OTP. Please try again.' }, { status: 400 })
    }

    // Valid — clear OTP cookie, return user
    const response = NextResponse.json({
      success: true,
      user: {
        name:   record.name,
        teamId: record.teamId,
        email:  key,
      }
    })
    response.cookies.delete('pms_otp')
    return response

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

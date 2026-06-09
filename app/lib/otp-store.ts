// Shared in-memory OTP store
// Works within a single serverless instance — fine for 10-min OTPs on a small team

export const TEAM: Record<string, { name: string; teamId: string }> = {
  'akshat.gd@gmail.com':           { name: 'Akshat Agrawal',   teamId: 'team_001' },
  'ravikhtn18@gmail.com':          { name: 'Ravi Khetan',      teamId: 'team_002' },
  'rahulkumarmaurya464@gmail.com': { name: 'Rahul Maurya',     teamId: 'team_003' },
  'priyeshrai369@gmail.com':       { name: 'Priyesh Rai',      teamId: 'team_007' },
  'rishi.wizards@gmail.com':       { name: 'Rishi Khatri',     teamId: 'team_004' },
  'ekta30747@gmail.com':           { name: 'Ekta Yadav',       teamId: 'team_005' },
  'priyambada.wizards@gmail.com':  { name: 'Priyambada Gupta', teamId: 'team_006' },
}

export const otpStore: Record<string, {
  otp: string
  expires: number
  name: string
  teamId: string
}> = {}

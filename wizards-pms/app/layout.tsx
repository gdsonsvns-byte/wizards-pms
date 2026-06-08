import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wizards Websites | Agency PMS',
  description: 'Project Management System for Wizards Websites Agency',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

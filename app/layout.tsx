import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Borbor Carnival 25 - Voting Dashboard',
  description: 'Live voting analytics and management dashboard for Borbor Carnival 25',
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
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bookmark Reminder - Never Forget Great Content',
  description: 'Save bookmarks with smart reminders. Build learning habits through regular email reminders.',
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

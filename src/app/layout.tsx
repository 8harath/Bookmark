import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
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
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#000',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
              fontFamily: "'Courier New', monospace",
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#000',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                border: '3px solid #ff0000',
              },
              iconTheme: {
                primary: '#ff0000',
                secondary: '#fff',
              },
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}

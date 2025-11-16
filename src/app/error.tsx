'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error boundary caught:', error)
    }

    // In production, you would log to an error tracking service here
    // Example: Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="card">
          <h1 className="text-6xl mb-4">⚠️</h1>
          <h2 className="mb-4">SOMETHING WENT WRONG</h2>
          <p className="font-mono mb-4">
            An unexpected error occurred. Please try again.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 border-3 border-error bg-white text-left overflow-auto max-h-40">
              <p className="font-mono text-sm text-error break-words">
                {error.message}
              </p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <Button onClick={reset}>TRY AGAIN</Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = '/'}
            >
              GO HOME
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

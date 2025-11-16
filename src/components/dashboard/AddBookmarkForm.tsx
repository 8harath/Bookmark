'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components/ui'

interface AddBookmarkFormProps {
  onAdd: (url: string, scrapedData?: any) => Promise<void>
}

export function AddBookmarkForm({ onAdd }: AddBookmarkFormProps) {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isScraping, setIsScraping] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setIsScraping(true)

    try {
      // First, scrape the URL
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const scrapeData = await scrapeRes.json()
      setIsScraping(false)

      if (!scrapeData.success) {
        setError(scrapeData.error || 'Failed to load page content')
        setIsLoading(false)
        return
      }

      // Then create the bookmark with scraped data
      await onAdd(url, scrapeData.data)
      setUrl('')
    } catch (err: any) {
      console.error('Error adding bookmark:', err)
      setError(err.message || 'Failed to add bookmark')
    } finally {
      setIsLoading(false)
      setIsScraping(false)
    }
  }

  return (
    <Card className="mb-8">
      <h2 className="mb-4">ADD BOOKMARK</h2>

      {error && (
        <div className="mb-4 p-4 border-3 border-error bg-white">
          <p className="font-mono text-sm text-error">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-4">
        <Input
          type="url"
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="whitespace-nowrap">
          {isScraping ? 'LOADING...' : isLoading ? 'SAVING...' : 'SAVE BOOKMARK'}
        </Button>
      </form>

      {isScraping && (
        <p className="mt-3 font-mono text-sm">
          Extracting content from page...
        </p>
      )}
    </Card>
  )
}

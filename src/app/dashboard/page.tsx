'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BookmarkCard } from '@/components/dashboard/BookmarkCard'
import { AddBookmarkForm } from '@/components/dashboard/AddBookmarkForm'
import { Button, Loading } from '@/components/ui'
import { getUser } from '@/utils/auth'
import type { Database } from '@/types/database'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'archived'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest')

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadBookmarks()
    }
  }, [user, filter, sort])

  const loadUser = async () => {
    const currentUser = await getUser()
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    setUser(currentUser)
  }

  const loadBookmarks = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/bookmarks?filter=${filter}&sort=${sort}&limit=100`)
      const data = await res.json()
      setBookmarks(data.bookmarks || [])
    } catch (error) {
      console.error('Failed to load bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBookmark = async (url: string, scrapedData?: any) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title: scrapedData?.title || url,
          excerpt: scrapedData?.excerpt,
          content: scrapedData?.content,
          image_url: scrapedData?.image_url,
        }),
      })

      const data = await res.json()

      if (data.success) {
        await loadBookmarks()
      } else {
        throw new Error(data.error || 'Failed to add bookmark')
      }
    } catch (error) {
      throw error
    }
  }

  const handleUpdateBookmark = async (id: string, updates: Partial<Bookmark>) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (res.ok) {
        await loadBookmarks()
      }
    } catch (error) {
      console.error('Failed to update bookmark:', error)
    }
  }

  const handleDeleteBookmark = async (id: string) => {
    try {
      const res = await fetch(`/api/bookmarks/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        await loadBookmarks()
      }
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-4">MY BOOKMARKS</h1>
            <p className="font-mono">
              Save and organize your favorite content
            </p>
          </div>

          <AddBookmarkForm onAdd={handleAddBookmark} />

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <span className="font-mono text-sm uppercase font-bold">Filter:</span>
              <Button
                variant={filter === 'all' ? 'primary' : 'secondary'}
                onClick={() => setFilter('all')}
                className="text-sm px-4 py-2"
              >
                ALL
              </Button>
              <Button
                variant={filter === 'unread' ? 'primary' : 'secondary'}
                onClick={() => setFilter('unread')}
                className="text-sm px-4 py-2"
              >
                UNREAD
              </Button>
              <Button
                variant={filter === 'read' ? 'primary' : 'secondary'}
                onClick={() => setFilter('read')}
                className="text-sm px-4 py-2"
              >
                READ
              </Button>
              <Button
                variant={filter === 'archived' ? 'primary' : 'secondary'}
                onClick={() => setFilter('archived')}
                className="text-sm px-4 py-2"
              >
                ARCHIVED
              </Button>
            </div>

            <div className="flex gap-2 ml-auto">
              <span className="font-mono text-sm uppercase font-bold">Sort:</span>
              <Button
                variant={sort === 'newest' ? 'primary' : 'secondary'}
                onClick={() => setSort('newest')}
                className="text-sm px-4 py-2"
              >
                NEWEST
              </Button>
              <Button
                variant={sort === 'oldest' ? 'primary' : 'secondary'}
                onClick={() => setSort('oldest')}
                className="text-sm px-4 py-2"
              >
                OLDEST
              </Button>
              <Button
                variant={sort === 'title' ? 'primary' : 'secondary'}
                onClick={() => setSort('title')}
                className="text-sm px-4 py-2"
              >
                A-Z
              </Button>
            </div>
          </div>

          {/* Bookmarks Grid */}
          {isLoading ? (
            <Loading />
          ) : bookmarks.length === 0 ? (
            <div className="text-center py-16 border-4 border-black p-8">
              <h3 className="mb-4">NO BOOKMARKS YET</h3>
              <p className="font-mono">
                Add your first bookmark using the form above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  onUpdate={handleUpdateBookmark}
                  onDelete={handleDeleteBookmark}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

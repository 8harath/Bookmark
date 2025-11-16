'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, Button, Modal, Input } from '@/components/ui'
import type { Database } from '@/types/database'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

interface BookmarkCardProps {
  bookmark: Bookmark
  onUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BookmarkCard({ bookmark, onUpdate, onDelete }: BookmarkCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(bookmark.title)
  const [editExcerpt, setEditExcerpt] = useState(bookmark.excerpt || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = async () => {
    setIsLoading(true)
    try {
      await onUpdate(bookmark.id, {
        title: editTitle,
        excerpt: editExcerpt,
      })
      setIsEditOpen(false)
    } catch (error) {
      console.error('Failed to update bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await onDelete(bookmark.id)
      setIsDeleteOpen(false)
    } catch (error) {
      console.error('Failed to delete bookmark:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRead = async () => {
    await onUpdate(bookmark.id, { is_read: !bookmark.is_read })
  }

  const toggleArchive = async () => {
    await onUpdate(bookmark.id, { is_archived: !bookmark.is_archived })
  }

  const domain = new URL(bookmark.url).hostname.replace('www.', '')

  return (
    <>
      <Card>
        {/* Image */}
        {bookmark.image_url && (
          <div className="relative w-full h-48 mb-4 -m-6 -mb-2">
            <Image
              src={bookmark.image_url}
              alt={bookmark.title}
              fill
              className="object-cover border-b-4 border-black"
            />
          </div>
        )}

        {/* Content */}
        <div>
          <h3 className="text-lg mb-2 line-clamp-2">{bookmark.title}</h3>

          {bookmark.excerpt && (
            <p className="text-sm font-mono mb-4 line-clamp-3 normal-case">
              {bookmark.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 mb-4 text-xs font-mono">
            <span>{domain}</span>
            <span>•</span>
            <span>{new Date(bookmark.created_at).toLocaleDateString()}</span>
            {bookmark.is_read && <span className="ml-auto">✓ READ</span>}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn text-sm px-3 py-2 flex-1"
            >
              VISIT →
            </a>
            <Button
              variant="secondary"
              onClick={toggleRead}
              className="text-sm px-3 py-2"
            >
              {bookmark.is_read ? 'UNREAD' : 'READ'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsEditOpen(true)}
              className="text-sm px-3 py-2"
            >
              EDIT
            </Button>
            <Button
              variant="secondary"
              onClick={toggleArchive}
              className="text-sm px-3 py-2"
            >
              {bookmark.is_archived ? 'UNARCHIVE' : 'ARCHIVE'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsDeleteOpen(true)}
              className="text-sm px-3 py-2 border-error hover:bg-error hover:text-white"
            >
              DELETE
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="EDIT BOOKMARK">
        <div className="space-y-4">
          <Input
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            maxLength={500}
          />
          <div>
            <label className="block mb-2 font-bold uppercase text-sm">Excerpt</label>
            <textarea
              className="input w-full h-32 resize-none"
              value={editExcerpt}
              onChange={(e) => setEditExcerpt(e.target.value)}
              maxLength={1000}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleEdit} disabled={isLoading} className="flex-1">
              {isLoading ? 'SAVING...' : 'SAVE CHANGES'}
            </Button>
            <Button variant="secondary" onClick={() => setIsEditOpen(false)} className="flex-1">
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="DELETE BOOKMARK?">
        <p className="font-mono mb-6">
          This cannot be undone.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="flex-1 border-error bg-error text-white hover:bg-white hover:text-error"
          >
            {isLoading ? 'DELETING...' : 'DELETE'}
          </Button>
          <Button variant="secondary" onClick={() => setIsDeleteOpen(false)} className="flex-1">
            CANCEL
          </Button>
        </div>
      </Modal>
    </>
  )
}

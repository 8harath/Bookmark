import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, excerpt, tags, is_read, is_archived, image_url } = body

    // Build update object
    const updates: any = {}
    if (title !== undefined) {
      if (title.length > 500) {
        return NextResponse.json(
          { success: false, error: 'Title too long (max 500 characters)' },
          { status: 400 }
        )
      }
      updates.title = title
    }
    if (excerpt !== undefined) {
      if (excerpt && excerpt.length > 1000) {
        return NextResponse.json(
          { success: false, error: 'Excerpt too long (max 1000 characters)' },
          { status: 400 }
        )
      }
      updates.excerpt = excerpt
    }
    if (tags !== undefined) updates.tags = tags
    if (is_read !== undefined) updates.is_read = is_read
    if (is_archived !== undefined) updates.is_archived = is_archived
    if (image_url !== undefined) updates.image_url = image_url

    // Update bookmark
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Bookmark not found' },
          { status: 404 }
        )
      }
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      bookmark,
    })
  } catch (error: any) {
    console.error('PATCH bookmark error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete bookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark deleted',
    })
  } catch (error: any) {
    console.error('DELETE bookmark error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

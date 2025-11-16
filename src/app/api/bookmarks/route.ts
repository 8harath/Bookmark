import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, globalLimiter, getRateLimitHeaders } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting: 60 requests per minute
    const rateLimitResult = await rateLimit(request, user.id, 60, globalLimiter)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'newest'
    const filter = searchParams.get('filter') || 'all'

    // Build query
    let query = supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)

    // Apply filters
    if (filter === 'unread') {
      query = query.eq('is_read', false)
    } else if (filter === 'read') {
      query = query.eq('is_read', true)
    } else if (filter === 'archived') {
      query = query.eq('is_archived', true)
    } else {
      query = query.eq('is_archived', false)
    }

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sort === 'title') {
      query = query.order('title', { ascending: true })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: bookmarks, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookmarks' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      bookmarks: bookmarks || [],
      total: count || 0,
      has_more: (count || 0) > offset + limit,
    })
  } catch (error: any) {
    console.error('GET bookmarks error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rate limiting: 30 creates per minute
    const rateLimitResult = await rateLimit(request, user.id, 30, globalLimiter)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const { url, title, excerpt, image_url, tags, content } = body

    // Validate required fields
    if (!url || !title) {
      return NextResponse.json(
        { success: false, error: 'URL and title are required' },
        { status: 400 }
      )
    }

    // Validate URL length
    if (url.length > 2048) {
      return NextResponse.json(
        { success: false, error: 'URL too long (max 2048 characters)' },
        { status: 400 }
      )
    }

    // Validate title length
    if (title.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Title too long (max 500 characters)' },
        { status: 400 }
      )
    }

    // Check for duplicate URL
    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('url', url)
      .single()

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already saved this page',
          bookmark_id: existing.id,
        },
        { status: 409 }
      )
    }

    // Create bookmark
    const { data: bookmark, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        url,
        title,
        excerpt: excerpt || null,
        content: content || null,
        image_url: image_url || null,
        tags: tags || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create bookmark' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        bookmark,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST bookmark error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

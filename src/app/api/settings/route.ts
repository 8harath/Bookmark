import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

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

    // Get user settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: 500 }
      )
    }

    return NextResponse.json(settings || {})
  } catch (error: any) {
    console.error('GET settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()

    // Validate reminder frequency
    if (body.reminder_frequency && !['daily', 'weekly', 'biweekly', 'monthly'].includes(body.reminder_frequency)) {
      return NextResponse.json(
        { success: false, error: 'Invalid reminder frequency' },
        { status: 400 }
      )
    }

    // Validate day of week (0-6)
    if (body.reminder_day_of_week !== undefined && body.reminder_day_of_week !== null) {
      const day = parseInt(body.reminder_day_of_week)
      if (isNaN(day) || day < 0 || day > 6) {
        return NextResponse.json(
          { success: false, error: 'Invalid day of week (must be 0-6)' },
          { status: 400 }
        )
      }
    }

    // Validate day of month (1-31)
    if (body.reminder_day_of_month !== undefined && body.reminder_day_of_month !== null) {
      const day = parseInt(body.reminder_day_of_month)
      if (isNaN(day) || day < 1 || day > 31) {
        return NextResponse.json(
          { success: false, error: 'Invalid day of month (must be 1-31)' },
          { status: 400 }
        )
      }
    }

    // Validate email batch size (1-10)
    if (body.email_batch_size !== undefined) {
      const size = parseInt(body.email_batch_size)
      if (isNaN(size) || size < 1 || size > 10) {
        return NextResponse.json(
          { success: false, error: 'Invalid batch size (must be 1-10)' },
          { status: 400 }
        )
      }
    }

    // Update settings
    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(body)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error: any) {
    console.error('PATCH settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

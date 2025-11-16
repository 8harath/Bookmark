import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { generateReminderEmailHtml, generateReminderEmailText } from '@/utils/email-templates'
import type { Database } from '@/types/database'

const resend = new Resend(process.env.RESEND_API_KEY!)

// Use service role key for cron jobs (bypasses RLS)
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ user_id: string; error: string }>,
    }

    // Get current day of week (0 = Sunday, 6 = Saturday)
    const now = new Date()
    const currentDayOfWeek = now.getUTCDay()
    const currentDayOfMonth = now.getUTCDate()
    const currentHour = now.getUTCHours()

    // Get all users with reminders enabled
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('*')
      .eq('reminder_enabled', true)
      .eq('email_enabled', true)

    if (settingsError) {
      console.error('Failed to fetch user settings:', settingsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user settings' },
        { status: 500 }
      )
    }

    // Filter users whose reminders are due today
    const usersToRemind = settings.filter((setting) => {
      // Parse reminder time (HH:MM:SS)
      const [hour] = setting.reminder_time.split(':').map(Number)

      // Check if reminder should be sent this hour
      if (hour !== currentHour) {
        return false
      }

      // Check frequency
      switch (setting.reminder_frequency) {
        case 'daily':
          return true

        case 'weekly':
          return currentDayOfWeek === setting.reminder_day_of_week

        case 'biweekly':
          // Simple implementation: check if current week is even/odd
          const weekNumber = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000))
          return weekNumber % 2 === 0 && currentDayOfWeek === setting.reminder_day_of_week

        case 'monthly':
          // Handle months with fewer days
          const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
          const targetDay = Math.min(setting.reminder_day_of_month || 1, lastDayOfMonth)
          return currentDayOfMonth === targetDay

        default:
          return false
      }
    })

    // Process each user
    for (const setting of usersToRemind) {
      results.processed++

      try {
        // Get user email
        const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(
          setting.user_id
        )

        if (userError || !user || !user.email) {
          results.errors.push({
            user_id: setting.user_id,
            error: 'User not found or no email',
          })
          results.failed++
          continue
        }

        // Get bookmarks to remind
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', setting.user_id)
          .eq('is_archived', false)
          .or(`is_read.eq.false,last_reminded_at.is.null,last_reminded_at.lt.${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`)
          .order('created_at', { ascending: false })
          .limit(setting.email_batch_size)

        if (bookmarksError) {
          results.errors.push({
            user_id: setting.user_id,
            error: `Failed to fetch bookmarks: ${bookmarksError.message}`,
          })
          results.failed++
          continue
        }

        // Skip if no bookmarks to remind
        if (!bookmarks || bookmarks.length === 0) {
          await supabase.from('email_logs').insert({
            user_id: setting.user_id,
            email_type: 'reminder',
            status: 'skipped',
            error_message: 'No bookmarks to remind',
            bookmark_count: 0,
          })
          continue
        }

        // Generate email content
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const emailData = {
          bookmarks,
          settings: setting,
          dashboardUrl: `${appUrl}/dashboard`,
          settingsUrl: `${appUrl}/settings`,
          unsubscribeUrl: `${appUrl}/settings`, // For now, users can disable in settings
        }

        const htmlContent = generateReminderEmailHtml(emailData)
        const textContent = generateReminderEmailText(emailData)

        // Send email via Resend
        const { data: emailResult, error: emailError } = await resend.emails.send({
          from: 'Bookmark Reminder <onboarding@resend.dev>', // Change to your verified domain
          to: [user.email],
          subject: `📚 Your Bookmarks: ${bookmarks.length} saved read${bookmarks.length === 1 ? '' : 's'} waiting`,
          html: htmlContent,
          text: textContent,
          tags: [
            { name: 'type', value: 'reminder' },
            { name: 'user_id', value: setting.user_id },
          ],
        })

        if (emailError) {
          results.errors.push({
            user_id: setting.user_id,
            error: `Email send failed: ${emailError.message}`,
          })
          results.failed++

          // Log failure
          await supabase.from('email_logs').insert({
            user_id: setting.user_id,
            email_type: 'reminder',
            status: 'failed',
            error_message: emailError.message,
            bookmark_count: bookmarks.length,
          })

          continue
        }

        // Update bookmarks with reminder timestamp
        const bookmarkIds = bookmarks.map((b) => b.id)
        await supabase
          .from('bookmarks')
          .update({
            last_reminded_at: new Date().toISOString(),
            reminder_count: supabase.sql`reminder_count + 1`,
          })
          .in('id', bookmarkIds)

        // Log success
        await supabase.from('email_logs').insert({
          user_id: setting.user_id,
          email_type: 'reminder',
          status: 'sent',
          bookmark_count: bookmarks.length,
        })

        results.sent++
      } catch (error: any) {
        console.error(`Error processing user ${setting.user_id}:`, error)
        results.errors.push({
          user_id: setting.user_id,
          error: error.message || 'Unknown error',
        })
        results.failed++
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error: any) {
    console.error('Send reminders error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

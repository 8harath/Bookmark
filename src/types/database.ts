export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      bookmarks: {
        Row: {
          id: string
          user_id: string
          url: string
          title: string
          excerpt: string | null
          content: string | null
          image_url: string | null
          favicon_url: string | null
          tags: string[]
          is_read: boolean
          is_archived: boolean
          created_at: string
          last_reminded_at: string | null
          reminder_count: number
        }
        Insert: {
          id?: string
          user_id: string
          url: string
          title: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          favicon_url?: string | null
          tags?: string[]
          is_read?: boolean
          is_archived?: boolean
          created_at?: string
          last_reminded_at?: string | null
          reminder_count?: number
        }
        Update: {
          id?: string
          user_id?: string
          url?: string
          title?: string
          excerpt?: string | null
          content?: string | null
          image_url?: string | null
          favicon_url?: string | null
          tags?: string[]
          is_read?: boolean
          is_archived?: boolean
          created_at?: string
          last_reminded_at?: string | null
          reminder_count?: number
        }
      }
      user_settings: {
        Row: {
          user_id: string
          reminder_enabled: boolean
          reminder_frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          reminder_day_of_week: number | null
          reminder_day_of_month: number | null
          reminder_time: string
          reminder_timezone: string
          email_enabled: boolean
          email_batch_size: number
          include_images: boolean
          include_excerpts: boolean
          theme: 'light' | 'dark'
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          reminder_enabled?: boolean
          reminder_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          reminder_day_of_week?: number | null
          reminder_day_of_month?: number | null
          reminder_time?: string
          reminder_timezone?: string
          email_enabled?: boolean
          email_batch_size?: number
          include_images?: boolean
          include_excerpts?: boolean
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          reminder_enabled?: boolean
          reminder_frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly'
          reminder_day_of_week?: number | null
          reminder_day_of_month?: number | null
          reminder_time?: string
          reminder_timezone?: string
          email_enabled?: boolean
          email_batch_size?: number
          include_images?: boolean
          include_excerpts?: boolean
          theme?: 'light' | 'dark'
          created_at?: string
          updated_at?: string
        }
      }
      email_logs: {
        Row: {
          id: string
          user_id: string | null
          email_type: string
          sent_at: string
          status: string
          error_message: string | null
          bookmark_count: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          email_type: string
          sent_at?: string
          status: string
          error_message?: string | null
          bookmark_count?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          email_type?: string
          sent_at?: string
          status?: string
          error_message?: string | null
          bookmark_count?: number | null
        }
      }
    }
  }
}

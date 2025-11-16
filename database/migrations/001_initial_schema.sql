-- ============================================================================
-- BOOKMARK REMINDER APPLICATION - DATABASE SCHEMA
-- ============================================================================
-- This schema creates all tables, policies, and triggers for the application
-- Run this in the Supabase SQL Editor after creating your project
-- ============================================================================

-- ============================================================================
-- TABLE: bookmarks
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  favicon_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_reminded_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,

  -- Constraints
  CONSTRAINT bookmarks_url_check CHECK (char_length(url) <= 2048),
  CONSTRAINT bookmarks_title_check CHECK (char_length(title) <= 500)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON bookmarks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookmarks_last_reminded ON bookmarks(last_reminded_at);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_unread ON bookmarks(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- TABLE: user_settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Reminder Configuration
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_frequency TEXT DEFAULT 'weekly'
    CHECK (reminder_frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  reminder_day_of_week INTEGER CHECK (reminder_day_of_week BETWEEN 0 AND 6),
  reminder_day_of_month INTEGER CHECK (reminder_day_of_month BETWEEN 1 AND 31),
  reminder_time TIME DEFAULT '09:00:00',
  reminder_timezone TEXT DEFAULT 'UTC',

  -- Email Preferences
  email_enabled BOOLEAN DEFAULT true,
  email_batch_size INTEGER DEFAULT 5 CHECK (email_batch_size BETWEEN 1 AND 10),
  include_images BOOLEAN DEFAULT true,
  include_excerpts BOOLEAN DEFAULT true,

  -- UI Preferences
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: email_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL,
  error_message TEXT,
  bookmark_count INTEGER
);

-- Indexes for monitoring
CREATE INDEX IF NOT EXISTS idx_email_logs_user ON email_logs(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status, sent_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Bookmarks policies
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own bookmarks" ON bookmarks;
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own bookmarks" ON bookmarks;
CREATE POLICY "Users can update own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- User settings policies
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Email logs policies (read-only for users)
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;
CREATE POLICY "Users can view own email logs"
  ON email_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user_settings on user signup
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_settings();

-- ============================================================================
-- COMPLETED: Database schema is ready!
-- Next steps:
-- 1. Copy your Supabase project URL and keys to .env.local
-- 2. Set up authentication in the Next.js application
-- ============================================================================

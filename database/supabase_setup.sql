-- =============================================
-- ফাঁকিবাজ - Supabase Database Setup
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. User Topic Status Table
-- Stores each user's progress on topics
CREATE TABLE IF NOT EXISTS user_topic_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'ongoing', 'finished')),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, topic_id)
);

-- 2. User Activity Log Table
-- Tracks daily topic completions for streak & chart
CREATE TABLE IF NOT EXISTS user_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, activity_date)
);

-- =============================================
-- Row Level Security (RLS)
-- Each user can ONLY access their own data
-- =============================================

-- Enable RLS
ALTER TABLE user_topic_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for user_topic_status
CREATE POLICY "Users can view own topic status"
    ON user_topic_status FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topic status"
    ON user_topic_status FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topic status"
    ON user_topic_status FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topic status"
    ON user_topic_status FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for user_activity_log
CREATE POLICY "Users can view own activity"
    ON user_activity_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity"
    ON user_activity_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activity"
    ON user_activity_log FOR UPDATE
    USING (auth.uid() = user_id);

-- =============================================
-- Indexes for fast lookups
-- =============================================
CREATE INDEX IF NOT EXISTS idx_topic_status_user ON user_topic_status(user_id);
CREATE INDEX IF NOT EXISTS idx_topic_status_lookup ON user_topic_status(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_date ON user_activity_log(user_id, activity_date);

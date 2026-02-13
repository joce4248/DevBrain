-- ============================================
-- DevBrain: Supabase Auth Migration
-- ============================================
-- Run this SQL in your Supabase Dashboard (SQL Editor)
-- BEFORE using the app with authentication enabled.
-- ============================================

-- 1. Add user_id columns to existing tables
ALTER TABLE snippets ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE tags ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Enable Row Level Security on all tables
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE snippet_tags ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for snippets
CREATE POLICY "Users can view own snippets" ON snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own snippets" ON snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own snippets" ON snippets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own snippets" ON snippets
  FOR DELETE USING (auth.uid() = user_id);

-- 4. RLS Policies for tags
CREATE POLICY "Users can view own tags" ON tags
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tags" ON tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags" ON tags
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags" ON tags
  FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for snippet_tags (based on snippet ownership)
CREATE POLICY "Users can manage own snippet_tags" ON snippet_tags
  FOR ALL USING (snippet_id IN (SELECT id FROM snippets WHERE user_id = auth.uid()));

-- ============================================================
-- Leaders League: Mandalika Edition — Complete Setup (Safe Re-run)
-- Paste this ENTIRE block into Supabase SQL Editor and run it
-- ============================================================

-- 1. Create tables (IF NOT EXISTS = safe to re-run)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  cluster TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cluster TEXT NOT NULL,
  pp NUMERIC NOT NULL DEFAULT 0,
  dp NUMERIC NOT NULL DEFAULT 0,
  tp NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (safe if they don't exist)
DROP POLICY IF EXISTS "Anyone can read leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "Admin can insert leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "Admin can delete leaderboard" ON leaderboard;
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admin can read admin_users" ON admin_users;

-- 4. Leaderboard policies
CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard FOR SELECT USING (true);

CREATE POLICY "Admin can insert leaderboard"
  ON leaderboard FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can delete leaderboard"
  ON leaderboard FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- 5. Profile policies (read = public, write = admin only)
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Admin can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can update profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()));

-- 6. Admin users policy
CREATE POLICY "Admin can read admin_users"
  ON admin_users FOR SELECT USING (auth.uid() = id);

-- 7. Make your user an admin (skip if already exists)
INSERT INTO admin_users (id, email)
VALUES ('964e1979-a0a7-4b2f-b7bd-7f4e1f6161c4', 'jordysalim2@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage bucket for profile photos
-- NOTE: Run this separately if the above succeeds.
-- Go to Supabase Dashboard > Storage > Create bucket named "photos"
-- Set it to Public
-- Then add this storage policy:
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
-- ON CONFLICT (id) DO NOTHING;

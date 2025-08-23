-- Fix admin and video upload issues

-- 1. Set admin status for specific users
UPDATE user_profiles 
SET is_admin = true 
WHERE email IN ('admin@muratabjj.com', 'yukihamada@me.com', 'yuki@hamada.tokyo');

-- 2. Fix video upload policies - allow all authenticated users to upload
DROP POLICY IF EXISTS "Users can upload videos" ON videos;
CREATE POLICY "Users can upload videos" ON videos
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. Fix admin viewing policies - admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles admin
      WHERE (admin.id = auth.uid() OR admin.user_id = auth.uid())
      AND admin.is_admin = true
    )
  );

-- 4. Fix admin video management - admins can update/delete any video
DROP POLICY IF EXISTS "Admins can manage all videos" ON videos;
CREATE POLICY "Admins can manage all videos" ON videos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE (user_profiles.id = auth.uid() OR user_profiles.user_id = auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- 5. Ensure video viewing policy is correct
DROP POLICY IF EXISTS "View own or approved videos" ON videos;
CREATE POLICY "View own or approved videos" ON videos
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (approval_status = 'approved' AND is_published = true)
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE (user_profiles.id = auth.uid() OR user_profiles.user_id = auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- 6. Fix sparring_logs date issue - ensure date column is not required for inserts
ALTER TABLE sparring_logs ALTER COLUMN date SET DEFAULT CURRENT_DATE;

-- 7. Fix progress tracking table name
-- First check if the table exists
DO $$
BEGIN
  -- Create user_progress table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_progress') THEN
    CREATE TABLE user_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      technique_id UUID NOT NULL,
      proficiency_level INTEGER DEFAULT 1 CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
      last_practiced TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, technique_id)
    );
    
    -- Create indexes
    CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
    CREATE INDEX idx_user_progress_technique_id ON user_progress(technique_id);
    
    -- Enable RLS
    ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own progress" ON user_progress
      FOR SELECT USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert own progress" ON user_progress
      FOR INSERT WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update own progress" ON user_progress
      FOR UPDATE USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can delete own progress" ON user_progress
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- 8. Fix sparring_events event_type enum
ALTER TABLE sparring_events DROP CONSTRAINT IF EXISTS sparring_events_event_type_check;
ALTER TABLE sparring_events ADD CONSTRAINT sparring_events_event_type_check 
  CHECK (event_type IN ('guard-pass', 'sweep', 'submission', 'submission-attempt', 'takedown', 'position-change', 'escape', 'back-take'));

-- 9. Add missing columns to sparring_events
ALTER TABLE sparring_events
ADD COLUMN IF NOT EXISTS position_from TEXT,
ADD COLUMN IF NOT EXISTS position_to TEXT,
ADD COLUMN IF NOT EXISTS technique_used TEXT;

-- 10. Create techniques table if missing
CREATE TABLE IF NOT EXISTS techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  belt_level TEXT DEFAULT 'white',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on techniques
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;

-- Everyone can view techniques
CREATE POLICY "Anyone can view techniques" ON techniques
  FOR SELECT USING (true);

-- Only admins can manage techniques
CREATE POLICY "Admins can manage techniques" ON techniques
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE (user_profiles.id = auth.uid() OR user_profiles.user_id = auth.uid())
      AND user_profiles.is_admin = true
    )
  );
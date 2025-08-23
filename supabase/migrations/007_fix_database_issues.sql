-- Fix database issues for sparring logs, profiles, and videos

-- 1. Fix user_profiles table (rename from profiles if needed)
DO $$
BEGIN
  -- Check if profiles table exists and user_profiles doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    ALTER TABLE profiles RENAME TO user_profiles;
  END IF;
END $$;

-- Ensure user_profiles has all necessary columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS belt TEXT DEFAULT 'white',
ADD COLUMN IF NOT EXISTS stripes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_coach BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create unique constraint on user_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2. Fix sparring_logs table
CREATE TABLE IF NOT EXISTS sparring_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  partner_name TEXT,
  partner_belt TEXT,
  notes TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  techniques_practiced TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sparring_logs
CREATE INDEX IF NOT EXISTS idx_sparring_logs_user_date ON sparring_logs(user_id, date DESC);

-- 3. Fix sparring_events table
CREATE TABLE IF NOT EXISTS sparring_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sparring_log_id UUID NOT NULL REFERENCES sparring_logs(id) ON DELETE CASCADE,
  time_seconds INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  technique TEXT,
  position TEXT,
  success BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for sparring_events
CREATE INDEX IF NOT EXISTS idx_sparring_events_log ON sparring_events(sparring_log_id);

-- 4. Update RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public profiles for viewing other users (optional)
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

-- 5. Update RLS policies for sparring_logs
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sparring logs" ON sparring_logs;
DROP POLICY IF EXISTS "Users can create their own sparring logs" ON sparring_logs;
DROP POLICY IF EXISTS "Users can update their own sparring logs" ON sparring_logs;
DROP POLICY IF EXISTS "Users can delete their own sparring logs" ON sparring_logs;

CREATE POLICY "Users can view their own sparring logs" ON sparring_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sparring logs" ON sparring_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sparring logs" ON sparring_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sparring logs" ON sparring_logs
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Update RLS policies for sparring_events
ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their sparring events" ON sparring_events;

CREATE POLICY "Users can manage their sparring events" ON sparring_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM sparring_logs 
      WHERE sparring_logs.id = sparring_events.sparring_log_id 
      AND sparring_logs.user_id = auth.uid()
    )
  );

-- 7. Fix videos table policies (update existing policies)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own or approved videos" ON videos;
DROP POLICY IF EXISTS "Users can insert their own videos" ON videos;
DROP POLICY IF EXISTS "Users can update their own videos" ON videos;
DROP POLICY IF EXISTS "Users can delete their own videos" ON videos;

-- Recreate with proper conditions
CREATE POLICY "View own or approved videos" ON videos
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (approval_status = 'approved' AND is_published = true)
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Insert own videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Update own videos" ON videos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Delete own videos" ON videos
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Update function to handle profile updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.user_profiles
  SET
    email = new.email,
    full_name = COALESCE(new.raw_user_meta_data->>'full_name', full_name),
    avatar_url = COALESCE(new.raw_user_meta_data->>'avatar_url', avatar_url),
    updated_at = NOW()
  WHERE user_id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- 10. Ensure all existing users have profiles
INSERT INTO user_profiles (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
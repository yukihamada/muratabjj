-- Fix remaining database issues

-- 1. Fix user_profiles table structure
-- Check if id column exists, if not, rename user_id to id
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'user_profiles' AND column_name = 'id') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'user_profiles' AND column_name = 'user_id') THEN
      ALTER TABLE user_profiles RENAME COLUMN user_id TO id;
    ELSE
      ALTER TABLE user_profiles ADD COLUMN id UUID PRIMARY KEY DEFAULT gen_random_uuid();
    END IF;
  END IF;
END $$;

-- Add user_id column if it doesn't exist (for backward compatibility)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update user_id to match id if needed
UPDATE user_profiles SET user_id = id WHERE user_id IS NULL;

-- Create unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_user_id_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- 2. Fix RLS policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;

-- Use both id and user_id for compatibility
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
  FOR SELECT USING (true);

-- 3. Add is_published column to videos if missing
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;

-- 4. Fix videos policies with is_published
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

-- 5. Update trigger functions to handle both id and user_id
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, user_id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    user_id = EXCLUDED.user_id,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Ensure all existing users have profiles
INSERT INTO user_profiles (id, user_id, email)
SELECT id, id, email FROM auth.users
ON CONFLICT (id) DO UPDATE
SET user_id = EXCLUDED.user_id,
    email = EXCLUDED.email;
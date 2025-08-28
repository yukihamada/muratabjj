-- Fix infinite recursion in user_profiles RLS policies
-- The issue is caused by policies referencing the same table they're protecting

-- First, disable RLS temporarily to clean up
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Public can view coach profiles" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Create a function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_emails text[] := ARRAY[
    'admin@test.muratabjj.com',
    'shu.shu.4029@gmail.com',
    'yuki@hamada.tokyo'
  ];
  user_email text;
BEGIN
  -- Get user email from JWT
  user_email := auth.jwt() ->> 'email';
  
  -- Check if email is in admin list
  IF user_email = ANY(admin_emails) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create new non-recursive policies
-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Public can view profiles marked as coaches
CREATE POLICY "Public can view coach profiles" ON user_profiles
  FOR SELECT
  USING (is_coach = true);

-- 5. Admins can do everything (using function to avoid recursion)
CREATE POLICY "Admins can do all operations" ON user_profiles
  FOR ALL
  USING (is_admin_user());

-- Also fix any policies on other tables that might reference user_profiles
-- Fix videos table policies if they reference user_profiles
DROP POLICY IF EXISTS "Admin users can do everything" ON videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON videos;

-- Create admin policy for videos without recursion
CREATE POLICY "Admins can manage all videos" ON videos
  FOR ALL
  USING (is_admin_user());

-- Fix flows table policies if they reference user_profiles
DROP POLICY IF EXISTS "Admin users can do everything" ON flows;
DROP POLICY IF EXISTS "Admins can manage all flows" ON flows;

-- Create admin policy for flows without recursion
CREATE POLICY "Admins can manage all flows" ON flows
  FOR ALL
  USING (is_admin_user());

-- Fix other tables that might have similar issues
-- Techniques
DROP POLICY IF EXISTS "Admin users can do everything" ON techniques;
CREATE POLICY IF NOT EXISTS "Admins can manage all techniques" ON techniques
  FOR ALL
  USING (is_admin_user());

-- User progress
DROP POLICY IF EXISTS "Admin users can view all progress" ON user_progress;
CREATE POLICY IF NOT EXISTS "Admins can view all progress" ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- Sparring sessions
DROP POLICY IF EXISTS "Admin users can view all sessions" ON sparring_sessions;
CREATE POLICY IF NOT EXISTS "Admins can view all sessions" ON sparring_sessions
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin_user());

-- Grant execute permission on the admin check function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;

-- Add comment explaining the fix
COMMENT ON FUNCTION is_admin_user() IS 'Checks if the current user is an admin without causing infinite recursion. Uses JWT email claim instead of querying user_profiles table.';
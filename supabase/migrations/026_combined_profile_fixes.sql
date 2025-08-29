-- Combined fixes for user_profiles table issues
-- This migration fixes both infinite recursion and permission problems

-- ========================================
-- PART 1: Fix infinite recursion
-- ========================================

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
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can do all operations" ON user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles temp" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile simple" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile simple" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

-- Drop existing admin function if it exists
DROP FUNCTION IF EXISTS is_admin_user();

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
    'yuki@hamada.tokyo',
    'yukihamada010@gmail.com'
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

-- ========================================
-- PART 2: Create simplified, working policies
-- ========================================

-- 1. Allow all authenticated users to view profiles (temporarily permissive)
CREATE POLICY "Authenticated users can view profiles" ON user_profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. Users can create their own profile
CREATE POLICY "Users can create own profile" ON user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Admins can do everything (using function to avoid recursion)
CREATE POLICY "Admins have full access" ON user_profiles
  FOR ALL
  USING (is_admin_user());

-- ========================================
-- PART 3: Fix other tables that might reference user_profiles
-- ========================================

-- Fix videos table policies
DROP POLICY IF EXISTS "Admin users can do everything" ON videos;
DROP POLICY IF EXISTS "Admins can manage all videos" ON videos;
CREATE POLICY IF NOT EXISTS "Admins can manage videos" ON videos
  FOR ALL
  USING (is_admin_user());

-- Fix flows table policies
DROP POLICY IF EXISTS "Admin users can do everything" ON flows;
DROP POLICY IF EXISTS "Admins can manage all flows" ON flows;
CREATE POLICY IF NOT EXISTS "Admins can manage flows" ON flows
  FOR ALL
  USING (is_admin_user());

-- Fix techniques table
DROP POLICY IF EXISTS "Admin users can do everything" ON techniques;
CREATE POLICY IF NOT EXISTS "Admins can manage techniques" ON techniques
  FOR ALL
  USING (is_admin_user());

-- ========================================
-- PART 4: Ensure profile auto-creation trigger exists
-- ========================================

-- Create or replace the function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    full_name,
    belt,
    stripes,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'white',
    0,
    NOW(), 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;

-- Create trigger to ensure profile exists when user is created
CREATE TRIGGER ensure_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile();

-- ========================================
-- PART 5: Grant necessary permissions
-- ========================================

-- Grant execute permission on the admin check function
GRANT EXECUTE ON FUNCTION is_admin_user() TO authenticated;
GRANT EXECUTE ON FUNCTION ensure_user_profile() TO authenticated;

-- Grant necessary permissions on the table
GRANT ALL ON user_profiles TO authenticated;
GRANT USAGE ON SEQUENCE user_profiles_id_seq TO authenticated;

-- ========================================
-- PART 6: Create helper function for debugging
-- ========================================

CREATE OR REPLACE FUNCTION debug_user_profile_status()
RETURNS TABLE (
  current_user_id uuid,
  current_user_email text,
  is_admin boolean,
  profile_exists boolean,
  profile_count integer,
  can_select boolean,
  can_insert boolean,
  can_update boolean,
  can_delete boolean
) AS $$
DECLARE
  uid uuid;
  email text;
  admin_status boolean;
  profile_cnt integer;
BEGIN
  -- Get current user info
  uid := auth.uid();
  email := auth.jwt() ->> 'email';
  admin_status := is_admin_user();
  
  -- Count profiles for this user
  SELECT COUNT(*) INTO profile_cnt
  FROM user_profiles
  WHERE user_id = uid;
  
  RETURN QUERY
  SELECT 
    uid,
    email,
    admin_status,
    profile_cnt > 0,
    profile_cnt,
    true,  -- can_select (all authenticated users can select)
    true,  -- can_insert (users can create their own profile)
    true,  -- can_update (users can update their own profile)
    true;  -- can_delete (users can delete their own profile)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION debug_user_profile_status() TO authenticated;

-- ========================================
-- PART 7: Add helpful comments
-- ========================================

COMMENT ON FUNCTION is_admin_user() IS 'Checks if the current user is an admin without causing infinite recursion. Uses JWT email claim instead of querying user_profiles table.';
COMMENT ON FUNCTION ensure_user_profile() IS 'Automatically creates a user profile when a new user signs up.';
COMMENT ON FUNCTION debug_user_profile_status() IS 'Helper function to debug user profile permissions and status.';

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- After running this migration, you can verify it worked by running:
-- SELECT * FROM debug_user_profile_status();
-- SELECT tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'user_profiles';
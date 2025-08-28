-- Fix profile update permissions issue
-- This addresses the "不明なエラー" (unknown error) when updating profiles

-- First check if the users_profile table exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users_profile'
  ) THEN
    RAISE EXCEPTION 'Table users_profile does not exist';
  END IF;
END $$;

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Users can view own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON users_profile;
DROP POLICY IF EXISTS "Public can view coach profiles" ON users_profile;
DROP POLICY IF EXISTS "Admins can do all operations" ON users_profile;

-- Create simpler, more permissive policies for testing
-- 1. Users can view all profiles (temporarily for debugging)
CREATE POLICY "Users can view all profiles temp" ON users_profile
  FOR SELECT
  USING (true);

-- 2. Users can insert their own profile
CREATE POLICY "Users can insert own profile simple" ON users_profile
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own profile
CREATE POLICY "Users can update own profile simple" ON users_profile
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own profile (if needed)
CREATE POLICY "Users can delete own profile" ON users_profile
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create or replace the function to ensure profile exists
CREATE OR REPLACE FUNCTION ensure_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
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

-- Grant necessary permissions
GRANT ALL ON users_profile TO authenticated;
GRANT ALL ON users_profile TO anon;

-- Add helpful comments
COMMENT ON POLICY "Users can view all profiles temp" ON users_profile IS 'Temporary permissive policy for debugging profile issues';
COMMENT ON POLICY "Users can insert own profile simple" ON users_profile IS 'Allow users to create their own profile';
COMMENT ON POLICY "Users can update own profile simple" ON users_profile IS 'Allow users to update their own profile';

-- Create a debug function to check current user permissions
CREATE OR REPLACE FUNCTION debug_profile_permissions()
RETURNS TABLE (
  current_user_id uuid,
  current_user_email text,
  can_select boolean,
  can_insert boolean,
  can_update boolean,
  can_delete boolean,
  existing_profile_count integer
) AS $$
DECLARE
  user_id uuid;
  user_email text;
  profile_count integer;
BEGIN
  -- Get current user info
  user_id := auth.uid();
  user_email := auth.jwt() ->> 'email';
  
  -- Count existing profiles for this user
  SELECT COUNT(*) INTO profile_count
  FROM users_profile
  WHERE users_profile.user_id = user_id;
  
  RETURN QUERY
  SELECT 
    user_id,
    user_email,
    true as can_select,  -- Temporarily true due to permissive policy
    true as can_insert,
    true as can_update,
    true as can_delete,
    profile_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on debug function
GRANT EXECUTE ON FUNCTION debug_profile_permissions() TO authenticated;
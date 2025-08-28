-- Fix infinite recursion in user_profiles table policies
-- This migration removes all circular references in RLS policies

-- 1. Drop all existing policies on user_profiles that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can do anything" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can view coach profiles" ON user_profiles;

-- 2. Drop problematic policies from other tables that reference user_profiles
DROP POLICY IF EXISTS "Admins can manage all videos" ON videos;
DROP POLICY IF EXISTS "View own or approved videos" ON videos;
DROP POLICY IF EXISTS "Admins can manage techniques" ON techniques;

-- 3. Create new non-recursive policies for user_profiles

-- Allow users to view their own profile (using direct auth.uid() check)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow anyone to view profiles of coaches (no recursion)
CREATE POLICY "Anyone can view coach profiles" ON user_profiles
  FOR SELECT 
  USING (is_coach = true);

-- Admin policy using JWT claims instead of table lookup to avoid recursion
CREATE POLICY "Admins full access" ON user_profiles
  FOR ALL 
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@muratabjj.com', 
      'yukihamada@me.com', 
      'yuki@hamada.tokyo',
      'shu.shu.4029@gmail.com'
    )
  );

-- 4. Fix video policies to avoid recursion

-- View videos policy without recursion
CREATE POLICY "View own or approved videos" ON videos
  FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR (approval_status = 'approved' AND is_published = true)
    OR auth.jwt() ->> 'email' IN (
      'admin@muratabjj.com', 
      'yukihamada@me.com', 
      'yuki@hamada.tokyo',
      'shu.shu.4029@gmail.com'
    )
  );

-- Admin video management without recursion
CREATE POLICY "Admins can manage all videos" ON videos
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'admin@muratabjj.com', 
      'yukihamada@me.com', 
      'yuki@hamada.tokyo',
      'shu.shu.4029@gmail.com'
    )
  );

-- 5. Fix techniques policies if they exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'techniques') THEN
    CREATE POLICY "Admins can manage techniques" ON techniques
      FOR ALL 
      USING (
        auth.jwt() ->> 'email' IN (
          'admin@muratabjj.com', 
          'yukihamada@me.com', 
          'yuki@hamada.tokyo',
          'shu.shu.4029@gmail.com'
        )
      );
  END IF;
END $$;

-- 6. Create a secure function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean AS $$
BEGIN
  RETURN auth.jwt() ->> 'email' IN (
    'admin@muratabjj.com', 
    'yukihamada@me.com', 
    'yuki@hamada.tokyo',
    'shu.shu.4029@gmail.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update admin status in user_profiles table directly
UPDATE user_profiles 
SET is_admin = true 
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN (
    'admin@muratabjj.com', 
    'yukihamada@me.com', 
    'yuki@hamada.tokyo',
    'shu.shu.4029@gmail.com'
  )
);
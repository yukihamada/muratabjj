-- Fix infinite recursion in RLS policies for users_profile table
-- This migration removes circular references in policies

-- Drop existing policies that might cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profile;
DROP POLICY IF EXISTS "Anyone can view coach profiles" ON users_profile;
DROP POLICY IF EXISTS "Admins can view all profiles" ON users_profile;
DROP POLICY IF EXISTS "Admins can update all profiles" ON users_profile;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON users_profile;
DROP POLICY IF EXISTS "Admin users can view all profiles" ON users_profile;

-- Create new simplified policies without circular references

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON users_profile
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users_profile
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users_profile
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow admins to do everything (using JWT claims instead of table lookup)
CREATE POLICY "Admins can do anything" ON users_profile
FOR ALL USING (
  auth.jwt() ->> 'email' IN ('shu.shu.4029@gmail.com', 'yuki@hamada.tokyo')
);

-- Also fix videos table to ensure proper user tracking
DO $$ 
BEGIN
  -- Add user_id column to videos table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'videos' 
                 AND column_name = 'user_id') THEN
    ALTER TABLE videos ADD COLUMN user_id UUID REFERENCES auth.users(id);
  END IF;
  
  -- Ensure uploaded_by column exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'videos' 
                 AND column_name = 'uploaded_by') THEN
    ALTER TABLE videos ADD COLUMN uploaded_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Update admin users in profiles using direct email check
UPDATE users_profile
SET is_admin = TRUE
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('shu.shu.4029@gmail.com', 'yuki@hamada.tokyo')
);
-- Set admin status for yuki@hamada.tokyo
-- Run this in Supabase SQL Editor after the code changes are deployed

-- First, check if the user exists and has a profile
SELECT 
  u.id,
  u.email,
  up.id as profile_id,
  up.user_id,
  up.full_name,
  up.is_admin,
  up.is_coach
FROM auth.users u
LEFT JOIN users_profile up ON u.id = up.user_id
WHERE u.email = 'yuki@hamada.tokyo';

-- If profile doesn't exist, create it first
INSERT INTO users_profile (user_id, full_name, belt, stripes, is_admin, is_coach)
SELECT 
  u.id,
  'Yuki Hamada',
  'black',
  0,
  true,
  true
FROM auth.users u
WHERE u.email = 'yuki@hamada.tokyo'
AND NOT EXISTS (
  SELECT 1 FROM users_profile up 
  WHERE up.user_id = u.id
);

-- Update existing profile to admin
UPDATE users_profile 
SET 
  is_admin = true,
  is_coach = true,
  updated_at = NOW()
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'yuki@hamada.tokyo'
);

-- Verify the admin status
SELECT 
  u.id as user_id,
  u.email,
  up.id as profile_id,
  up.full_name,
  up.is_admin,
  up.is_coach,
  up.belt,
  up.stripes,
  up.created_at,
  up.updated_at
FROM auth.users u
JOIN users_profile up ON u.id = up.user_id
WHERE u.email = 'yuki@hamada.tokyo';
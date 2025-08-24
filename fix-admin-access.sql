-- Fix admin access for yuki@hamada.tokyo
-- This script updates the correct table 'profiles' with the correct column 'role'

-- Update the user's role to admin in the profiles table
UPDATE profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'yuki@hamada.tokyo'
);

-- Verify the update
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.belt,
  p.stripes,
  p.created_at,
  p.updated_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'yuki@hamada.tokyo';

-- Also check all admin users
SELECT 
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.belt,
  p.stripes,
  p.created_at,
  p.updated_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.role = 'admin';
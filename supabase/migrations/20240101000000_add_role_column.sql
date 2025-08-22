-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'coach'));

-- Update role for admin users based on email
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('shu.shu.4029@gmail.com', 'yuki@hamada.tokyo')
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
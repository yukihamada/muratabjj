-- Fix users_profile RLS policies and ensure proper permissions

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users_profile;

-- Create comprehensive policies
CREATE POLICY "Users can view their own profile" ON users_profile
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON users_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users_profile
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure the updated_at trigger exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users_profile;
CREATE TRIGGER update_users_profile_updated_at 
  BEFORE UPDATE ON users_profile 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure all existing users have profiles
INSERT INTO users_profile (user_id, full_name, belt, stripes, is_coach, is_admin)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  'white',
  0,
  FALSE,
  CASE 
    WHEN au.email IN ('shu.shu.4029@gmail.com', 'yuki@hamada.tokyo') THEN TRUE
    ELSE FALSE
  END
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM users_profile WHERE user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON users_profile TO authenticated;
GRANT USAGE ON SEQUENCE users_profile_id_seq TO authenticated;
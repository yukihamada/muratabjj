-- Fix users_profile table to match the API expectations
-- This migration ensures the users_profile table exists with all required fields

-- First, check if the table already exists
DO $$ 
BEGIN
  -- If users_profile doesn't exist, create it
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_profile') THEN
    CREATE TABLE users_profile (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
      full_name TEXT,
      belt TEXT DEFAULT 'white' CHECK (belt IN ('white', 'blue', 'purple', 'brown', 'black', 'coral', 'red')),
      stripes INTEGER DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
      preferred_position TEXT,
      height DECIMAL,
      weight DECIMAL,
      is_coach BOOLEAN DEFAULT FALSE,
      is_admin BOOLEAN DEFAULT FALSE,
      subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'dojo')),
      subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
      stripe_customer_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );

    -- Create trigger for updated_at
    CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    -- Enable RLS
    ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies
    CREATE POLICY "Users can view their own profile" ON users_profile
    FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can update their own profile" ON users_profile
    FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own profile" ON users_profile
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- If the table exists but is missing columns, add them
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_profile') THEN
    -- Add missing columns if they don't exist
    ALTER TABLE users_profile 
    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'dojo')),
    ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
  END IF;

  -- If profiles table exists, migrate data to users_profile
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') AND 
     EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users_profile') THEN
    -- Migrate data from profiles to users_profile if not already migrated
    INSERT INTO users_profile (user_id, full_name, belt, stripes, created_at, updated_at)
    SELECT id, full_name, belt, stripes, created_at, updated_at
    FROM profiles
    WHERE NOT EXISTS (
      SELECT 1 FROM users_profile WHERE users_profile.user_id = profiles.id
    );

    -- Update is_admin based on role in profiles table
    UPDATE users_profile
    SET is_admin = TRUE
    FROM profiles
    WHERE users_profile.user_id = profiles.id
    AND profiles.role = 'admin';

    -- Update is_coach based on role in profiles table
    UPDATE users_profile
    SET is_coach = TRUE
    FROM profiles
    WHERE users_profile.user_id = profiles.id
    AND profiles.role = 'coach';
  END IF;
END $$;

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (user_id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update admin users based on email
UPDATE users_profile
SET is_admin = TRUE
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('shu.shu.4029@gmail.com', 'yuki@hamada.tokyo')
);

-- Create sample data for existing users if they don't have profiles
INSERT INTO users_profile (user_id, full_name, belt, stripes, is_coach, is_admin)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email),
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
);
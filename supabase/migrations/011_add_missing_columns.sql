-- Add missing columns to user_profiles table

-- Add missing columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_techniques TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS goals TEXT,
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ja',
ADD COLUMN IF NOT EXISTS dojo_id UUID,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';

-- Now create the profiles view
DROP VIEW IF EXISTS profiles;

CREATE VIEW profiles AS
SELECT 
  id,
  user_id,
  email,
  full_name,
  avatar_url,
  belt,
  stripes,
  bio,
  experience_years,
  favorite_techniques,
  goals,
  is_public,
  language,
  is_admin,
  is_coach,
  dojo_id,
  subscription_tier,
  subscription_status,
  role,
  updated_at,
  created_at
FROM user_profiles;

-- Grant permissions on the view
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Create INSTEAD OF trigger function for the view
CREATE OR REPLACE FUNCTION handle_profiles_view_dml()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_profiles (
      id, user_id, email, full_name, avatar_url, belt, stripes,
      bio, experience_years, favorite_techniques, goals, is_public,
      language, is_admin, is_coach, dojo_id, subscription_tier,
      subscription_status, role
    ) VALUES (
      COALESCE(NEW.id, auth.uid()),
      COALESCE(NEW.user_id, NEW.id, auth.uid()),
      NEW.email,
      NEW.full_name,
      NEW.avatar_url,
      COALESCE(NEW.belt, 'white'),
      COALESCE(NEW.stripes, 0),
      NEW.bio,
      COALESCE(NEW.experience_years, 0),
      COALESCE(NEW.favorite_techniques, '{}'),
      NEW.goals,
      COALESCE(NEW.is_public, true),
      COALESCE(NEW.language, 'ja'),
      COALESCE(NEW.is_admin, false),
      COALESCE(NEW.is_coach, false),
      NEW.dojo_id,
      COALESCE(NEW.subscription_tier, 'free'),
      COALESCE(NEW.subscription_status, 'active'),
      COALESCE(NEW.role, 'user')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE user_profiles SET
      email = NEW.email,
      full_name = NEW.full_name,
      avatar_url = NEW.avatar_url,
      belt = NEW.belt,
      stripes = NEW.stripes,
      bio = NEW.bio,
      experience_years = NEW.experience_years,
      favorite_techniques = NEW.favorite_techniques,
      goals = NEW.goals,
      is_public = NEW.is_public,
      language = NEW.language,
      is_admin = NEW.is_admin,
      is_coach = NEW.is_coach,
      dojo_id = NEW.dojo_id,
      subscription_tier = NEW.subscription_tier,
      subscription_status = NEW.subscription_status,
      role = NEW.role,
      updated_at = NOW()
    WHERE id = OLD.id OR user_id = OLD.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM user_profiles WHERE id = OLD.id OR user_id = OLD.id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create INSTEAD OF triggers
CREATE TRIGGER profiles_view_insert
  INSTEAD OF INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profiles_view_dml();

CREATE TRIGGER profiles_view_update
  INSTEAD OF UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profiles_view_dml();

CREATE TRIGGER profiles_view_delete
  INSTEAD OF DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_profiles_view_dml();
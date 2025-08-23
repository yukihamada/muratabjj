-- Create profiles view for backward compatibility
-- This allows existing code to work while we migrate to user_profiles

-- Drop existing view if exists
DROP VIEW IF EXISTS profiles;

-- Create view that maps to user_profiles
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

-- Create RLS policies for the view
ALTER VIEW profiles ENABLE ROW LEVEL SECURITY;

-- View own profile
CREATE POLICY "Users can view their own profile via view" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() = user_id);

-- Update own profile (through view)
CREATE POLICY "Users can update their own profile via view" ON profiles
  FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

-- Insert own profile (through view)
CREATE POLICY "Users can insert their own profile via view" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

-- Public profiles
CREATE POLICY "Public profiles are viewable by everyone via view" ON profiles
  FOR SELECT USING (is_public = true);

-- Create trigger to handle inserts/updates through the view
CREATE OR REPLACE FUNCTION handle_profiles_view_dml()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_profiles VALUES (NEW.*);
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
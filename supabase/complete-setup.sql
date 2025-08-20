-- Complete Supabase Setup for Murata BJJ
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create all tables (from schema.sql)
-- Users Profile
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  belt_rank TEXT CHECK (belt_rank IN ('white', 'blue', 'purple', 'brown', 'black')),
  stripes INTEGER DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
  weight_class TEXT,
  preferred_position TEXT,
  years_training INTEGER DEFAULT 0,
  dojo_id UUID,
  is_coach BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Techniques
CREATE TABLE IF NOT EXISTS techniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('takedown', 'guard', 'pass', 'submission', 'escape', 'transition')),
  position TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
  description_ja TEXT,
  description_en TEXT,
  description_pt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ja TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  description_ja TEXT,
  description_en TEXT,
  description_pt TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  technique_id UUID REFERENCES techniques(id) ON DELETE SET NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  belt_requirement TEXT,
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Video Chapters
CREATE TABLE IF NOT EXISTS video_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  title_ja TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Video Transcripts
CREATE TABLE IF NOT EXISTS video_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ja', 'en', 'pt')),
  transcript JSONB NOT NULL,
  full_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(video_id, language)
);

-- User Progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technique_id UUID REFERENCES techniques(id) ON DELETE CASCADE NOT NULL,
  progress_level INTEGER DEFAULT 1 CHECK (progress_level >= 1 AND progress_level <= 5),
  last_practiced TIMESTAMPTZ,
  practice_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, technique_id)
);

-- Sparring Logs
CREATE TABLE IF NOT EXISTS sparring_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT,
  partner_belt TEXT,
  duration INTEGER,
  starting_position TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Sparring Events
CREATE TABLE IF NOT EXISTS sparring_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sparring_log_id UUID REFERENCES sparring_logs(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('pass', 'sweep', 'submission', 'escape', 'takedown', 'back_take')),
  technique_id UUID REFERENCES techniques(id) ON DELETE SET NULL,
  success BOOLEAN DEFAULT true,
  timestamp INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flows
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Flow Nodes
CREATE TABLE IF NOT EXISTS flow_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
  technique_id UUID REFERENCES techniques(id) ON DELETE SET NULL,
  custom_name TEXT,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  node_type TEXT DEFAULT 'technique',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Flow Edges
CREATE TABLE IF NOT EXISTS flow_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
  source_node_id UUID REFERENCES flow_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES flow_nodes(id) ON DELETE CASCADE NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dojos
CREATE TABLE IF NOT EXISTS dojos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description TEXT,
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'basic',
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dojo Members
CREATE TABLE IF NOT EXISTS dojo_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dojo_id UUID REFERENCES dojos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dojo_id, user_id)
);

-- Curriculums
CREATE TABLE IF NOT EXISTS curriculums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dojo_id UUID REFERENCES dojos(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  belt_level TEXT,
  order_index INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Curriculum Items
CREATE TABLE IF NOT EXISTS curriculum_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id UUID REFERENCES curriculums(id) ON DELETE CASCADE NOT NULL,
  technique_id UUID REFERENCES techniques(id) ON DELETE SET NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  order_index INTEGER NOT NULL,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'dojo')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Review Schedule
CREATE TABLE IF NOT EXISTS review_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  technique_id UUID REFERENCES techniques(id) ON DELETE CASCADE NOT NULL,
  next_review_date DATE NOT NULL,
  review_interval INTEGER DEFAULT 1,
  ease_factor FLOAT DEFAULT 2.5,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, technique_id)
);

-- 3. Create indexes
CREATE INDEX idx_videos_technique_id ON videos(technique_id);
CREATE INDEX idx_videos_instructor_id ON videos(instructor_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_technique_id ON user_progress(technique_id);
CREATE INDEX idx_sparring_logs_user_id ON sparring_logs(user_id);
CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_review_schedule_user_id ON review_schedule(user_id);
CREATE INDEX idx_review_schedule_next_review ON review_schedule(next_review_date);

-- 4. Enable RLS
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE dojos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dojo_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculums ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedule ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (from rls-policies.sql)
-- Users Profile policies
CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON users_profile FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Techniques policies (public read)
CREATE POLICY "Anyone can view techniques"
  ON techniques FOR SELECT
  USING (true);

CREATE POLICY "Coaches can manage techniques"
  ON techniques FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND is_coach = true
    )
  );

-- Videos policies
CREATE POLICY "Anyone can view non-premium videos"
  ON videos FOR SELECT
  USING (
    is_premium = false OR
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND plan_type IN ('pro', 'dojo')
    )
  );

CREATE POLICY "Coaches can manage videos"
  ON videos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND is_coach = true
    )
  );

-- User Progress policies
CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON user_progress FOR ALL
  USING (auth.uid() = user_id);

-- Sparring logs policies
CREATE POLICY "Users can view their own sparring logs"
  ON sparring_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sparring logs"
  ON sparring_logs FOR ALL
  USING (auth.uid() = user_id);

-- Flows policies
CREATE POLICY "Users can view public flows or their own"
  ON flows FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own flows"
  ON flows FOR ALL
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 6. Create functions
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID, required_plans TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = user_uuid
    AND status = 'active'
    AND plan_type = ANY(required_plans)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_dojo_role(user_uuid UUID, dojo_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM dojo_members
  WHERE user_id = user_uuid AND dojo_id = dojo_uuid;
  
  RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create auth trigger (from fix-auth-trigger.sql)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (
    user_id, 
    full_name, 
    belt_rank, 
    stripes,
    years_training,
    is_coach
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'white', 
    0,
    0,
    false
  );
  
  -- Create free subscription for new user
  INSERT INTO public.subscriptions (
    user_id, 
    plan_type, 
    status
  )
  VALUES (
    new.id, 
    'free', 
    'active'
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 9. Insert sample data (from seed.sql)
INSERT INTO techniques (name_ja, name_en, name_pt, category, position, difficulty, description_ja, description_en, description_pt) VALUES
-- Takedowns
('シングルレッグ', 'Single Leg', 'Single Leg', 'takedown', 'standing', 2, '片足タックル', 'Single leg takedown', 'Queda de uma perna'),
('ダブルレッグ', 'Double Leg', 'Double Leg', 'takedown', 'standing', 2, '両足タックル', 'Double leg takedown', 'Queda de duas pernas'),
('内股', 'Uchi Mata', 'Uchi Mata', 'takedown', 'standing', 3, '柔道技の応用', 'Judo technique', 'Técnica de judô'),
('背負投', 'Seoi Nage', 'Seoi Nage', 'takedown', 'standing', 3, '柔道技の応用', 'Judo technique', 'Técnica de judô'),
-- Guards
('クローズドガード', 'Closed Guard', 'Guarda Fechada', 'guard', 'bottom', 1, '基本的なガード', 'Basic guard position', 'Posição básica de guarda'),
('デラヒーバ', 'De La Riva', 'De La Riva', 'guard', 'bottom', 3, '足を絡めるガード', 'Leg entanglement guard', 'Guarda com enrosco de perna'),
('スパイダーガード', 'Spider Guard', 'Guarda Aranha', 'guard', 'bottom', 3, '袖を使ったガード', 'Sleeve-based guard', 'Guarda usando mangas'),
('バタフライガード', 'Butterfly Guard', 'Guarda Borboleta', 'guard', 'bottom', 2, '両足フックのガード', 'Double hook guard', 'Guarda com ganchos duplos'),
('Xガード', 'X-Guard', 'Guarda X', 'guard', 'bottom', 4, '足でXを作るガード', 'X-shaped leg guard', 'Guarda com pernas em X'),
('ハーフガード', 'Half Guard', 'Meia-Guarda', 'guard', 'bottom', 2, '片足を絡めるガード', 'One leg entangled guard', 'Guarda com uma perna enroscada')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Setup completed successfully!' as message;
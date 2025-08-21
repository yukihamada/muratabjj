-- ===================================
-- Murata BJJ - Complete Database Schema
-- ===================================
-- Run this file in Supabase SQL Editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================
-- 1. Users Profile Table
-- ===================================
CREATE TABLE IF NOT EXISTS users_profile (
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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for users_profile
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON users_profile
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON users_profile
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON users_profile
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================
-- 2. Videos Table
-- ===================================
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  category TEXT NOT NULL,
  position TEXT,
  belt TEXT DEFAULT 'white',
  uploaded_by UUID REFERENCES auth.users(id),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  recommended_belts TEXT[] DEFAULT ARRAY['white', 'blue', 'purple', 'brown', 'black'],
  min_belt TEXT DEFAULT 'white',
  safety_warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_competition_legal BOOLEAN DEFAULT TRUE,
  requires_supervision BOOLEAN DEFAULT FALSE,
  transcript TEXT,
  transcript_language TEXT DEFAULT 'ja',
  ai_detected_techniques TEXT[],
  ai_difficulty_score DECIMAL(3,2),
  ai_key_movements TEXT[],
  ai_common_mistakes TEXT[],
  ai_suggested_drills TEXT[],
  ai_analysis_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published videos are viewable by everyone" ON videos
FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view their own unpublished videos" ON videos
FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Coaches can upload videos" ON videos
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE user_id = auth.uid() AND is_coach = true
  )
);

CREATE POLICY "Coaches can update their own videos" ON videos
FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can do everything with videos" ON videos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- ===================================
-- 3. Video Chapters Table
-- ===================================
CREATE TABLE IF NOT EXISTS video_chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS policies for video_chapters
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chapters are viewable if video is viewable" ON video_chapters
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = video_chapters.video_id
    AND (videos.is_published = true OR videos.uploaded_by = auth.uid())
  )
);

CREATE POLICY "Video uploader can manage chapters" ON video_chapters
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = video_chapters.video_id
    AND videos.uploaded_by = auth.uid()
  )
);

-- ===================================
-- 4. Video Keypoints Table
-- ===================================
CREATE TABLE IF NOT EXISTS video_keypoints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  timestamp INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  keypoint_type TEXT DEFAULT 'general' CHECK (keypoint_type IN ('general', 'warning', 'tip', 'common_mistake')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS policies for video_keypoints
ALTER TABLE video_keypoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Keypoints are viewable if video is viewable" ON video_keypoints
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = video_keypoints.video_id
    AND (videos.is_published = true OR videos.uploaded_by = auth.uid())
  )
);

CREATE POLICY "Video uploader can manage keypoints" ON video_keypoints
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = video_keypoints.video_id
    AND videos.uploaded_by = auth.uid()
  )
);

-- ===================================
-- 5. Progress Tracking Table
-- ===================================
CREATE TABLE IF NOT EXISTS progress_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  progress_level INTEGER DEFAULT 1 CHECK (progress_level >= 1 AND progress_level <= 5),
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  watch_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, video_id)
);

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for progress_tracking
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON progress_tracking
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON progress_tracking
FOR INSERT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON progress_tracking
FOR UPDATE USING (auth.uid() = user_id);

-- ===================================
-- 6. Flows Table
-- ===================================
CREATE TABLE IF NOT EXISTS flows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  belt_level TEXT DEFAULT 'white',
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for flows
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flows" ON flows
FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create flows" ON flows
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flows" ON flows
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flows" ON flows
FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- 7. Flow Nodes Table
-- ===================================
CREATE TABLE IF NOT EXISTS flow_nodes (
  id TEXT NOT NULL,
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  position_x REAL NOT NULL,
  position_y REAL NOT NULL,
  data JSONB NOT NULL,
  style JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (id, flow_id)
);

-- RLS policies for flow_nodes
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view nodes of viewable flows" ON flow_nodes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = flow_nodes.flow_id
    AND (flows.user_id = auth.uid() OR flows.is_public = true)
  )
);

CREATE POLICY "Users can manage nodes of their flows" ON flow_nodes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = flow_nodes.flow_id
    AND flows.user_id = auth.uid()
  )
);

-- ===================================
-- 8. Flow Edges Table
-- ===================================
CREATE TABLE IF NOT EXISTS flow_edges (
  id TEXT NOT NULL,
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  target TEXT NOT NULL,
  source_handle TEXT,
  target_handle TEXT,
  type TEXT DEFAULT 'default',
  animated BOOLEAN DEFAULT FALSE,
  style JSONB,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (id, flow_id)
);

-- RLS policies for flow_edges
ALTER TABLE flow_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view edges of viewable flows" ON flow_edges
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = flow_edges.flow_id
    AND (flows.user_id = auth.uid() OR flows.is_public = true)
  )
);

CREATE POLICY "Users can manage edges of their flows" ON flow_edges
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM flows
    WHERE flows.id = flow_edges.flow_id
    AND flows.user_id = auth.uid()
  )
);

-- ===================================
-- 9. Curricula Table
-- ===================================
CREATE TABLE IF NOT EXISTS curricula (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  belt_level TEXT NOT NULL,
  duration_weeks INTEGER,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_curricula_updated_at BEFORE UPDATE ON curricula
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for curricula
ALTER TABLE curricula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published curricula are viewable by everyone" ON curricula
FOR SELECT USING (is_published = true);

CREATE POLICY "Coaches can view their own curricula" ON curricula
FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create curricula" ON curricula
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE user_id = auth.uid() AND is_coach = true
  )
);

CREATE POLICY "Coaches can update their own curricula" ON curricula
FOR UPDATE USING (auth.uid() = coach_id);

-- ===================================
-- 10. Curriculum Items Table
-- ===================================
CREATE TABLE IF NOT EXISTS curriculum_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  curriculum_id UUID REFERENCES curricula(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  day_number INTEGER,
  item_type TEXT NOT NULL CHECK (item_type IN ('video', 'flow', 'drill', 'assignment')),
  item_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS policies for curriculum_items
ALTER TABLE curriculum_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Curriculum items are viewable if curriculum is viewable" ON curriculum_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM curricula
    WHERE curricula.id = curriculum_items.curriculum_id
    AND (curricula.is_published = true OR curricula.coach_id = auth.uid())
  )
);

CREATE POLICY "Coaches can manage their curriculum items" ON curriculum_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM curricula
    WHERE curricula.id = curriculum_items.curriculum_id
    AND curricula.coach_id = auth.uid()
  )
);

-- ===================================
-- 11. Evaluations Table
-- ===================================
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  curriculum_item_id UUID REFERENCES curriculum_items(id) ON DELETE CASCADE,
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('technique', 'flow', 'sparring', 'general')),
  score INTEGER CHECK (score >= 1 AND score <= 5),
  feedback TEXT,
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS policies for evaluations
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own evaluations" ON evaluations
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Coaches can view evaluations they created" ON evaluations
FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can create evaluations" ON evaluations
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE user_id = auth.uid() AND is_coach = true
  )
);

-- ===================================
-- 12. Dojo Spaces Table
-- ===================================
CREATE TABLE IF NOT EXISTS dojo_spaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  is_private BOOLEAN DEFAULT TRUE,
  enrollment_code TEXT UNIQUE,
  max_members INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_dojo_spaces_updated_at BEFORE UPDATE ON dojo_spaces
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for dojo_spaces
ALTER TABLE dojo_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Dojo owners can manage their spaces" ON dojo_spaces
FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Members can view their dojo spaces" ON dojo_spaces
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM dojo_members
    WHERE dojo_members.dojo_id = dojo_spaces.id
    AND dojo_members.user_id = auth.uid()
    AND dojo_members.status = 'active'
  )
);

-- ===================================
-- 13. Dojo Members Table
-- ===================================
CREATE TABLE IF NOT EXISTS dojo_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  dojo_id UUID REFERENCES dojo_spaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(dojo_id, user_id)
);

-- RLS policies for dojo_members
ALTER TABLE dojo_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships" ON dojo_members
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Dojo admins can manage members" ON dojo_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM dojo_spaces
    WHERE dojo_spaces.id = dojo_members.dojo_id
    AND dojo_spaces.owner_id = auth.uid()
  )
);

-- ===================================
-- 14. Subscriptions Table
-- ===================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('pro', 'dojo')),
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- ===================================
-- 15. Sparring Logs Table
-- ===================================
CREATE TABLE IF NOT EXISTS sparring_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_name TEXT,
  duration INTEGER NOT NULL,
  starting_position TEXT,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TRIGGER update_sparring_logs_updated_at BEFORE UPDATE ON sparring_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for sparring_logs
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sparring logs" ON sparring_logs
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sparring logs" ON sparring_logs
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sparring logs" ON sparring_logs
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sparring logs" ON sparring_logs
FOR DELETE USING (auth.uid() = user_id);

-- ===================================
-- 16. Sparring Events Table
-- ===================================
CREATE TABLE IF NOT EXISTS sparring_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sparring_log_id UUID REFERENCES sparring_logs(id) ON DELETE CASCADE NOT NULL,
  timestamp INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  position_from TEXT,
  position_to TEXT,
  technique_used TEXT,
  success BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS policies for sparring_events
ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events of their sparring logs" ON sparring_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sparring_logs
    WHERE sparring_logs.id = sparring_events.sparring_log_id
    AND sparring_logs.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage events of their sparring logs" ON sparring_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM sparring_logs
    WHERE sparring_logs.id = sparring_events.sparring_log_id
    AND sparring_logs.user_id = auth.uid()
  )
);

-- ===================================
-- 17. Review Items Table
-- ===================================
CREATE TABLE IF NOT EXISTS review_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('technique', 'flow', 'video')),
  item_id UUID NOT NULL,
  title TEXT NOT NULL,
  difficulty DECIMAL(3,2) DEFAULT 0.5,
  repetitions INTEGER DEFAULT 0,
  ease_factor DECIMAL(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  next_review_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, item_type, item_id)
);

CREATE TRIGGER update_review_items_updated_at BEFORE UPDATE ON review_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies for review_items
ALTER TABLE review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own review items" ON review_items
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own review items" ON review_items
FOR ALL USING (auth.uid() = user_id);

-- ===================================
-- 18. Review History Table
-- ===================================
CREATE TABLE IF NOT EXISTS review_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  review_item_id UUID REFERENCES review_items(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quality INTEGER NOT NULL CHECK (quality >= 0 AND quality <= 5),
  reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  time_spent_seconds INTEGER,
  notes TEXT
);

-- RLS policies for review_history
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own review history" ON review_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own review history" ON review_history
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===================================
-- 19. AI Analysis Logs Table
-- ===================================
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('whisper', 'vision', 'flow_suggestion')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  tokens_used INTEGER,
  cost_cents INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS policies for ai_analysis_logs
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all analysis logs" ON ai_analysis_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users_profile
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Video uploaders can view their analysis logs" ON ai_analysis_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM videos
    WHERE videos.id = ai_analysis_logs.video_id
    AND videos.uploaded_by = auth.uid()
  )
);

-- ===================================
-- 20. Create initial admin trigger
-- ===================================
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_profile (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- ===================================
-- 21. Create indexes for performance
-- ===================================
CREATE INDEX idx_videos_belt ON videos(belt);
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_position ON videos(position);
CREATE INDEX idx_videos_is_published ON videos(is_published);
CREATE INDEX idx_progress_tracking_user_id ON progress_tracking(user_id);
CREATE INDEX idx_progress_tracking_video_id ON progress_tracking(video_id);
CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_flows_is_public ON flows(is_public);
CREATE INDEX idx_sparring_logs_user_id ON sparring_logs(user_id);
CREATE INDEX idx_sparring_logs_date ON sparring_logs(date);
CREATE INDEX idx_review_items_user_id ON review_items(user_id);
CREATE INDEX idx_review_items_next_review_date ON review_items(next_review_date);

-- ===================================
-- 22. Create views for statistics
-- ===================================
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  up.user_id,
  up.belt,
  up.stripes,
  COUNT(DISTINCT pt.video_id) as videos_watched,
  COUNT(DISTINCT CASE WHEN pt.progress_level >= 3 THEN pt.video_id END) as techniques_learned,
  COUNT(DISTINCT sl.id) as sparring_sessions,
  COALESCE(AVG(pt.progress_level), 0) as average_progress
FROM users_profile up
LEFT JOIN progress_tracking pt ON up.user_id = pt.user_id
LEFT JOIN sparring_logs sl ON up.user_id = sl.user_id
GROUP BY up.user_id, up.belt, up.stripes;

CREATE OR REPLACE VIEW ai_analysis_statistics AS
SELECT 
  COUNT(*) as total_analyses,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_analyses,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_analyses,
  SUM(COALESCE(tokens_used, 0)) as total_tokens_used,
  SUM(COALESCE(cost_cents, 0)) / 100.0 as total_cost_dollars
FROM ai_analysis_logs;

-- ===================================
-- Complete! 
-- ===================================
-- Your Murata BJJ database is now set up with all tables, 
-- policies, indexes, and views.
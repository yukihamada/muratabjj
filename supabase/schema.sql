-- Murata BJJ Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Profile Extension
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  belt_rank TEXT CHECK (belt_rank IN ('white', 'blue', 'purple', 'brown', 'black')),
  stripes INTEGER DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
  weight_class TEXT,
  preferred_position TEXT,
  years_training INTEGER DEFAULT 0,
  dojo_id UUID,
  is_coach BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Techniques Master Table
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos Table
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
  duration INTEGER, -- in seconds
  technique_id UUID REFERENCES techniques(id),
  instructor_id UUID REFERENCES users_profile(id),
  belt_requirement TEXT,
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Chapters
CREATE TABLE IF NOT EXISTS video_chapters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  title_ja TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_pt TEXT NOT NULL,
  start_time INTEGER NOT NULL, -- in seconds
  end_time INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video Transcripts (Auto-generated from Whisper API)
CREATE TABLE IF NOT EXISTS video_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('ja', 'en', 'pt')),
  transcript JSONB NOT NULL, -- Array of {text, start, end}
  full_text TEXT, -- For full-text search
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, language)
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id),
  progress_level INTEGER DEFAULT 0 CHECK (progress_level >= 0 AND progress_level <= 5),
  -- 0: Not started, 1: Understanding, 2: Steps, 3: Reproduction, 4: Flow, 5: Sparring
  last_practiced TIMESTAMPTZ,
  practice_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, technique_id)
);

-- Sparring Logs
CREATE TABLE IF NOT EXISTS sparring_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_name TEXT,
  partner_belt TEXT,
  duration INTEGER, -- in minutes
  starting_position TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sparring Events
CREATE TABLE IF NOT EXISTS sparring_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sparring_log_id UUID NOT NULL REFERENCES sparring_logs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('pass', 'sweep', 'submission', 'escape', 'takedown', 'back_take')),
  technique_id UUID REFERENCES techniques(id),
  success BOOLEAN DEFAULT true,
  timestamp INTEGER, -- seconds from start
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flows (User-created technique sequences)
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flow Nodes
CREATE TABLE IF NOT EXISTS flow_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES techniques(id),
  custom_name TEXT,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  node_type TEXT DEFAULT 'technique',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flow Edges (Connections between nodes)
CREATE TABLE IF NOT EXISTS flow_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
  label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dojos
CREATE TABLE IF NOT EXISTS dojos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT,
  logo_url TEXT,
  subscription_tier TEXT DEFAULT 'basic',
  max_students INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dojo Members
CREATE TABLE IF NOT EXISTS dojo_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dojo_id UUID NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'coach', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dojo_id, user_id)
);

-- Curriculums
CREATE TABLE IF NOT EXISTS curriculums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dojo_id UUID NOT NULL REFERENCES dojos(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  belt_level TEXT,
  order_index INTEGER,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Curriculum Items
CREATE TABLE IF NOT EXISTS curriculum_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id UUID NOT NULL REFERENCES curriculums(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES techniques(id),
  video_id UUID REFERENCES videos(id),
  flow_id UUID REFERENCES flows(id),
  order_index INTEGER NOT NULL,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'pro', 'dojo')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Review Schedule (For adaptive learning)
CREATE TABLE IF NOT EXISTS review_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id),
  next_review_date DATE NOT NULL,
  review_interval INTEGER DEFAULT 1, -- days
  ease_factor FLOAT DEFAULT 2.5,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, technique_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dojos_updated_at BEFORE UPDATE ON dojos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON curriculums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_schedule_updated_at BEFORE UPDATE ON review_schedule
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_videos_technique_id ON videos(technique_id);
CREATE INDEX idx_video_chapters_video_id ON video_chapters(video_id);
CREATE INDEX idx_video_transcripts_video_id ON video_transcripts(video_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_technique_id ON user_progress(technique_id);
CREATE INDEX idx_sparring_logs_user_id ON sparring_logs(user_id);
CREATE INDEX idx_sparring_events_sparring_log_id ON sparring_events(sparring_log_id);
CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_flow_nodes_flow_id ON flow_nodes(flow_id);
CREATE INDEX idx_flow_edges_flow_id ON flow_edges(flow_id);
CREATE INDEX idx_dojo_members_dojo_id ON dojo_members(dojo_id);
CREATE INDEX idx_dojo_members_user_id ON dojo_members(user_id);
CREATE INDEX idx_curriculums_dojo_id ON curriculums(dojo_id);
CREATE INDEX idx_curriculum_items_curriculum_id ON curriculum_items(curriculum_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_review_schedule_user_id ON review_schedule(user_id);
CREATE INDEX idx_review_schedule_next_review_date ON review_schedule(next_review_date);

-- Full-text search index on video transcripts
CREATE INDEX idx_video_transcripts_full_text ON video_transcripts USING GIN (to_tsvector('japanese', full_text));
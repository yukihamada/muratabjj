-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  belt TEXT CHECK (belt IN ('white', 'blue', 'purple', 'brown', 'black', 'coral', 'red')),
  stripes INTEGER DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'coach')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 動画テーブル
CREATE TABLE videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- 秒単位
  category TEXT CHECK (category IN ('technique', 'flow', 'drill', 'sparring', 'competition')),
  position TEXT CHECK (position IN ('standing', 'guard', 'mount', 'side-control', 'back', 'turtle', 'half-guard')),
  technique_type TEXT,
  
  -- 公開設定
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES profiles(id),
  
  -- 推奨・制限設定
  recommended_belts TEXT[] DEFAULT ARRAY[]::TEXT[],
  min_belt TEXT CHECK (min_belt IN ('white', 'blue', 'purple', 'brown', 'black', 'coral', 'red')),
  
  -- 安全注意
  safety_warnings TEXT[],
  is_competition_legal BOOLEAN DEFAULT true,
  requires_supervision BOOLEAN DEFAULT false,
  
  -- メタデータ
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- 文字起こし
  transcript JSONB,
  transcript_language TEXT DEFAULT 'ja'
);

-- 動画チャプター
CREATE TABLE video_chapters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL, -- 秒単位
  end_time INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 動画キーポイント
CREATE TABLE video_keypoints (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  timestamp INTEGER NOT NULL, -- 秒単位
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('technique', 'safety', 'detail', 'common-mistake')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- フロー（技の連携）
CREATE TABLE flows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL, -- React Flow形式のノードとエッジデータ
  category TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 習得度トラッキング
CREATE TABLE progress_tracking (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  video_id UUID REFERENCES videos(id),
  flow_id UUID REFERENCES flows(id),
  progress_level INTEGER DEFAULT 1 CHECK (progress_level >= 1 AND progress_level <= 5),
  -- 1: 理解, 2: 手順, 3: 再現, 4: 連携, 5: 実戦
  notes TEXT,
  last_practiced TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, video_id),
  UNIQUE(user_id, flow_id)
);

-- スパーログ
CREATE TABLE sparring_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  partner_name TEXT,
  duration INTEGER NOT NULL, -- 秒単位
  starting_position TEXT,
  notes TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- スパーイベント
CREATE TABLE sparring_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sparring_log_id UUID REFERENCES sparring_logs(id) ON DELETE CASCADE,
  timestamp INTEGER NOT NULL, -- スパー開始からの秒数
  event_type TEXT NOT NULL CHECK (event_type IN ('guard-pass', 'sweep', 'submission', 'submission-attempt', 'takedown', 'position-change')),
  position_from TEXT,
  position_to TEXT,
  technique_used TEXT,
  success BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_keypoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sparring_events ENABLE ROW LEVEL SECURITY;

-- プロファイルポリシー
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 動画ポリシー
CREATE POLICY "Published videos are viewable by everyone" ON videos
  FOR SELECT USING (is_published = true);

CREATE POLICY "Users can view own uploaded videos" ON videos
  FOR SELECT USING (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can upload videos" ON videos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update own videos" ON videos
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Admins can update any video" ON videos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- チャプターとキーポイントのポリシー
CREATE POLICY "Chapters viewable if video is viewable" ON video_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = video_chapters.video_id
      AND (videos.is_published = true OR videos.uploaded_by = auth.uid())
    )
  );

CREATE POLICY "Keypoints viewable if video is viewable" ON video_keypoints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM videos
      WHERE videos.id = video_keypoints.video_id
      AND (videos.is_published = true OR videos.uploaded_by = auth.uid())
    )
  );

-- フローポリシー
CREATE POLICY "Public flows are viewable by everyone" ON flows
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own flows" ON flows
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create flows" ON flows
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own flows" ON flows
  FOR UPDATE USING (auth.uid() = created_by);

-- 進捗トラッキングポリシー
CREATE POLICY "Users can view own progress" ON progress_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own progress" ON progress_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- スパーログポリシー
CREATE POLICY "Users can view own sparring logs" ON sparring_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sparring logs" ON sparring_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sparring logs" ON sparring_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- スパーイベントポリシー
CREATE POLICY "Users can view own sparring events" ON sparring_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own sparring events" ON sparring_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sparring_logs
      WHERE sparring_logs.id = sparring_events.sparring_log_id
      AND sparring_logs.user_id = auth.uid()
    )
  );

-- 関数とトリガー
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 
    CASE 
      WHEN new.email = 'admin@muratabjj.com' THEN 'admin'
      WHEN new.email = 'coach@muratabjj.com' THEN 'coach'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 更新時刻の自動更新
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_flows_updated_at BEFORE UPDATE ON flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_progress_tracking_updated_at BEFORE UPDATE ON progress_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
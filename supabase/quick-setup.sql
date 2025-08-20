-- Murata BJJ クイックセットアップ
-- このスクリプトをSupabaseのSQL Editorで実行してください

-- 1. UUID拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 基本テーブルの作成（最小限）
-- ユーザープロファイル
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  belt_rank TEXT DEFAULT 'white',
  stripes INTEGER DEFAULT 0,
  is_coach BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 技術マスター
CREATE TABLE IF NOT EXISTS techniques (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_pt TEXT NOT NULL,
  category TEXT NOT NULL,
  position TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 動画
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
  technique_id UUID REFERENCES techniques(id),
  instructor_id UUID REFERENCES auth.users(id),
  belt_requirement TEXT DEFAULT 'white',
  is_premium BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- サブスクリプション
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLSを有効化
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. 基本的なRLSポリシー
-- ユーザープロファイル
CREATE POLICY "Users can view their own profile"
  ON users_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON users_profile FOR UPDATE
  USING (auth.uid() = user_id);

-- 技術（全員閲覧可能）
CREATE POLICY "Anyone can view techniques"
  ON techniques FOR SELECT
  USING (true);

-- 動画（無料は全員、プレミアムは有料会員のみ）
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

-- サブスクリプション
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- 5. 認証トリガー
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- プロファイル作成
  INSERT INTO public.users_profile (user_id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  
  -- 無料サブスクリプション作成
  INSERT INTO public.subscriptions (user_id, plan_type, status)
  VALUES (new.id, 'free', 'active');
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 6. 権限設定
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- 7. サンプル技術データ
INSERT INTO techniques (name_ja, name_en, name_pt, category, position) VALUES
('クローズドガード', 'Closed Guard', 'Guarda Fechada', 'guard', 'bottom'),
('デラヒーバ', 'De La Riva', 'De La Riva', 'guard', 'bottom'),
('三角絞め', 'Triangle Choke', 'Triângulo', 'submission', 'various'),
('腕十字', 'Armbar', 'Armlock', 'submission', 'various'),
('パスガード', 'Guard Pass', 'Passagem', 'pass', 'top')
ON CONFLICT DO NOTHING;

-- 完了メッセージ
SELECT 'セットアップ完了！' as message;
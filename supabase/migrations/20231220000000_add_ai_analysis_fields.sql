-- AI解析結果を格納するためのカラムを追加

-- videosテーブルにAI解析関連のカラムを追加
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS ai_detected_techniques TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_suggested_category TEXT,
ADD COLUMN IF NOT EXISTS ai_suggested_position TEXT,
ADD COLUMN IF NOT EXISTS ai_difficulty_score INTEGER CHECK (ai_difficulty_score >= 1 AND ai_difficulty_score <= 5),
ADD COLUMN IF NOT EXISTS ai_key_points TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_suggested_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_analysis_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_analyzed_by UUID REFERENCES profiles(id);

-- flowsテーブルにAI生成フラグを追加
ALTER TABLE flows 
ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_generation_source_video_id UUID REFERENCES videos(id);

-- AI解析ログテーブルを作成
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('video_analysis', 'flow_generation', 'auto_tagging')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data JSONB,
  result_data JSONB,
  error_message TEXT,
  processing_time_seconds INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id)
);

-- AI解析ログのインデックス
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_video_id ON ai_analysis_logs(video_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_status ON ai_analysis_logs(status);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_type ON ai_analysis_logs(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_logs_created_at ON ai_analysis_logs(created_at);

-- AI分析統計ビューを作成
CREATE OR REPLACE VIEW ai_analysis_stats AS
SELECT 
  COUNT(*) as total_videos,
  COUNT(CASE WHEN ai_analysis_completed = true THEN 1 END) as analyzed_videos,
  COUNT(CASE WHEN ai_analysis_completed = false THEN 1 END) as pending_videos,
  COUNT(CASE WHEN array_length(safety_warnings, 1) > 0 THEN 1 END) as videos_with_warnings,
  AVG(ai_difficulty_score) as avg_difficulty_score,
  COUNT(CASE WHEN is_competition_legal = false THEN 1 END) as competition_illegal_videos,
  COUNT(CASE WHEN requires_supervision = true THEN 1 END) as supervision_required_videos
FROM videos
WHERE is_published = true;

-- RLS (Row Level Security) ポリシーを設定
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;

-- 管理者のみがAI解析ログにアクセス可能
CREATE POLICY "Only admins can access AI analysis logs" ON ai_analysis_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- AI分析統計ビューへのアクセス権限
GRANT SELECT ON ai_analysis_stats TO authenticated;

-- コメント追加
COMMENT ON TABLE ai_analysis_logs IS 'AI解析の実行ログと結果を記録';
COMMENT ON COLUMN videos.ai_detected_techniques IS 'AI が検出した技術のリスト';
COMMENT ON COLUMN videos.ai_suggested_category IS 'AI が提案するカテゴリ';
COMMENT ON COLUMN videos.ai_suggested_position IS 'AI が提案するポジション';
COMMENT ON COLUMN videos.ai_difficulty_score IS 'AI が評価した難易度 (1-5)';
COMMENT ON COLUMN videos.ai_key_points IS 'AI が抽出した重要なポイント';
COMMENT ON COLUMN videos.ai_suggested_tags IS 'AI が提案するタグ';
COMMENT ON COLUMN videos.ai_analysis_completed IS 'AI解析が完了しているかどうか';
COMMENT ON COLUMN videos.ai_analyzed_at IS 'AI解析が完了した日時';
COMMENT ON COLUMN videos.ai_analyzed_by IS 'AI解析を実行したユーザー';
COMMENT ON COLUMN flows.is_ai_generated IS 'AI によって生成されたフローかどうか';
COMMENT ON COLUMN flows.ai_generation_source_video_id IS 'フロー生成のもとになった動画ID';
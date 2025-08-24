-- Fix videos table for multilingual support and upload issues
-- 動画テーブルの多言語対応とアップロード問題の修正

-- 1. Add missing multilingual columns to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS title_ja TEXT,
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS title_pt TEXT,
ADD COLUMN IF NOT EXISTS description_ja TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_pt TEXT,
ADD COLUMN IF NOT EXISTS technique_id UUID REFERENCES techniques(id),
ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS belt_requirement TEXT,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS transcription_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transcription_result TEXT,
ADD COLUMN IF NOT EXISTS ai_analysis_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_analysis_result JSONB,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Update existing title column to be nullable (since we have multilingual versions)
ALTER TABLE videos ALTER COLUMN title DROP NOT NULL;

-- 3. Add constraint to ensure at least one title is provided
ALTER TABLE videos ADD CONSTRAINT videos_title_check 
CHECK (title_ja IS NOT NULL OR title_en IS NOT NULL OR title_pt IS NOT NULL OR title IS NOT NULL);

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_videos_instructor_id ON videos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_videos_technique_id ON videos(technique_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_belt_requirement ON videos(belt_requirement);

-- 5. Update RLS policies for video uploads
DROP POLICY IF EXISTS "Users can insert own videos" ON videos;
CREATE POLICY "Users can insert own videos" ON videos
FOR INSERT WITH CHECK (
  auth.uid() = instructor_id OR 
  auth.uid() = user_id OR 
  auth.uid() = uploaded_by
);

-- 6. Update view policy
DROP POLICY IF EXISTS "Users can view videos" ON videos;
CREATE POLICY "Users can view videos" ON videos
FOR SELECT USING (
  is_published = true OR
  auth.uid() = instructor_id OR
  auth.uid() = user_id OR
  auth.uid() = uploaded_by OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.is_admin = true
  )
);

-- 7. Update existing videos to have user_id set
UPDATE videos 
SET user_id = uploaded_by 
WHERE user_id IS NULL AND uploaded_by IS NOT NULL;

-- 8. Add default values for new columns
UPDATE videos 
SET transcription_status = 'pending'
WHERE transcription_status IS NULL;

UPDATE videos 
SET is_premium = false
WHERE is_premium IS NULL;

UPDATE videos 
SET ai_analysis_enabled = false
WHERE ai_analysis_enabled IS NULL;

-- 9. Add trigger for updated_at column
DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at 
BEFORE UPDATE ON videos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Grant necessary permissions
GRANT ALL ON videos TO authenticated;
GRANT SELECT ON videos TO anon;
-- Video transcriptions table
CREATE TABLE IF NOT EXISTS video_transcriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  transcription_text TEXT NOT NULL,
  language VARCHAR(5) DEFAULT 'ja',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_video_transcriptions_video_id ON video_transcriptions(video_id);
CREATE INDEX idx_video_transcriptions_language ON video_transcriptions(language);

-- RLS policies
ALTER TABLE video_transcriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can read transcriptions for published videos
CREATE POLICY "Read transcriptions for published videos" ON video_transcriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcriptions.video_id 
      AND videos.is_published = true
    )
  );

-- Video owners can manage their transcriptions
CREATE POLICY "Video owners can manage transcriptions" ON video_transcriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM videos 
      WHERE videos.id = video_transcriptions.video_id 
      AND videos.instructor_id = auth.uid()
    )
  );

-- Add transcription_status to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS transcription_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS transcription_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for transcription status
CREATE INDEX idx_videos_transcription_status ON videos(transcription_status);
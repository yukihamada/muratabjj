-- Add approval status to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for approval status
CREATE INDEX IF NOT EXISTS idx_videos_approval_status ON videos(approval_status);
CREATE INDEX IF NOT EXISTS idx_videos_user_approval ON videos(user_id, approval_status);

-- Update RLS policies for videos table
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;
DROP POLICY IF EXISTS "Users can view published videos" ON videos;

-- Allow users to view:
-- 1. Their own videos (regardless of approval status)
-- 2. Approved videos from other users
CREATE POLICY "Users can view their own or approved videos" ON videos
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR approval_status = 'approved'
  );

-- Allow users to insert their own videos
CREATE POLICY "Users can insert their own videos" ON videos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own videos (but not approval status)
CREATE POLICY "Users can update their own videos" ON videos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id 
    AND (approval_status IS NOT DISTINCT FROM OLD.approval_status)
    AND (approved_at IS NOT DISTINCT FROM OLD.approved_at)
    AND (approved_by IS NOT DISTINCT FROM OLD.approved_by)
  );

-- Allow users to delete their own videos
CREATE POLICY "Users can delete their own videos" ON videos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to approve videos (admin only)
CREATE OR REPLACE FUNCTION approve_video(video_id UUID, status VARCHAR, reason TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Only admins can approve videos';
  END IF;

  -- Update video status
  UPDATE videos
  SET 
    approval_status = status,
    approved_at = CASE WHEN status = 'approved' THEN NOW() ELSE NULL END,
    approved_by = CASE WHEN status IN ('approved', 'rejected') THEN auth.uid() ELSE NULL END,
    rejection_reason = CASE WHEN status = 'rejected' THEN reason ELSE NULL END
  WHERE id = video_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing videos to be approved by default
UPDATE videos 
SET approval_status = 'approved', approved_at = NOW() 
WHERE approval_status IS NULL;
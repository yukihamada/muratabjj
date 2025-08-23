-- Final fixes for database

-- 1. Add missing columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_coach BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS belt TEXT DEFAULT 'white',
ADD COLUMN IF NOT EXISTS stripes INTEGER DEFAULT 0;

-- 2. Fix the videos policy
DROP POLICY IF EXISTS "View own or approved videos" ON videos;

CREATE POLICY "View own or approved videos" ON videos
  FOR SELECT USING (
    auth.uid() = user_id 
    OR (approval_status = 'approved' AND is_published = true)
    OR EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE (user_profiles.id = auth.uid() OR user_profiles.user_id = auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- 3. Ensure the video approval function works
CREATE OR REPLACE FUNCTION approve_video(video_id UUID, status VARCHAR, reason TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE (user_profiles.id = auth.uid() OR user_profiles.user_id = auth.uid())
    AND is_admin = true
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

-- 4. Set admin status for specific email
UPDATE user_profiles 
SET is_admin = true 
WHERE email IN ('admin@muratabjj.com', 'yukihamada@me.com');

-- 5. Ensure all existing videos are approved
UPDATE videos 
SET approval_status = 'approved', approved_at = NOW() 
WHERE approval_status = 'pending' OR approval_status IS NULL;
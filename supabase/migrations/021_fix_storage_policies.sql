-- Fix storage RLS policies for video uploads
-- Execute this in Supabase Dashboard > SQL Editor

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view all videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "upload_own_folder" ON storage.objects;
DROP POLICY IF EXISTS "view_all_videos" ON storage.objects;
DROP POLICY IF EXISTS "delete_own_videos" ON storage.objects;
DROP POLICY IF EXISTS "upload_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "view_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "upload_avatars" ON storage.objects;
DROP POLICY IF EXISTS "view_avatars" ON storage.objects;

-- Videos bucket policies - allow authenticated users to upload, view, delete
CREATE POLICY "videos_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "videos_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "videos_update_policy" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "videos_delete_policy" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos'
  AND auth.role() = 'authenticated'
);

-- Thumbnails bucket - allow authenticated users full access
CREATE POLICY "thumbnails_all_policy" ON storage.objects
FOR ALL USING (
  bucket_id = 'thumbnails'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'thumbnails'
  AND auth.role() = 'authenticated'
);

-- Avatars bucket - allow authenticated users full access
CREATE POLICY "avatars_all_policy" ON storage.objects
FOR ALL USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- Enable RLS if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Also enable RLS on buckets table if needed
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create a policy for bucket access (authenticated users can see all buckets)
DROP POLICY IF EXISTS "buckets_select_policy" ON storage.buckets;
CREATE POLICY "buckets_select_policy" ON storage.buckets
FOR SELECT USING (auth.role() = 'authenticated');
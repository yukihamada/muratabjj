-- Fix specifically for upload failures related to user_profiles
-- This ensures file uploads work by simplifying storage policies

-- Step 1: Check and fix storage policies that might reference user_profiles
DO $$
BEGIN
    -- Drop any storage policies that might reference user_profiles
    -- Note: Exact policy names may vary, adjust as needed
    
    -- For avatars bucket
    PERFORM 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%avatar%';
    IF FOUND THEN
        EXECUTE 'DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects';
        EXECUTE 'DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects';
    END IF;
    
    -- For videos bucket
    PERFORM 1 FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%video%';
    IF FOUND THEN
        EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects';
        EXECUTE 'DROP POLICY IF EXISTS "Public video access" ON storage.objects';
        EXECUTE 'DROP POLICY IF EXISTS "Users can update own videos" ON storage.objects';
        EXECUTE 'DROP POLICY IF EXISTS "Users can delete own videos" ON storage.objects';
    END IF;
END $$;

-- Step 2: Create simple storage policies without user_profiles references

-- For avatars/profile images
CREATE POLICY "avatar_upload_authenticated" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id = 'profile-images');

CREATE POLICY "avatar_select_public" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'profile-images');

CREATE POLICY "avatar_update_own" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'profile-images' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'profile-images' AND owner = auth.uid());

CREATE POLICY "avatar_delete_own" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'profile-images' AND owner = auth.uid());

-- For videos
CREATE POLICY "video_upload_authenticated" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'videos');

CREATE POLICY "video_select_public" ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'videos');

CREATE POLICY "video_update_own" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'videos' AND owner = auth.uid())
    WITH CHECK (bucket_id = 'videos' AND owner = auth.uid());

CREATE POLICY "video_delete_own" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'videos' AND owner = auth.uid());

-- Step 3: Ensure buckets exist and have proper settings
DO $$
BEGIN
    -- Create profile-images bucket if not exists
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'profile-images', 
        'profile-images', 
        true, 
        5242880, -- 5MB
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 5242880,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    
    -- Create videos bucket if not exists
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'videos', 
        'videos', 
        true, 
        104857600, -- 100MB
        ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
    )
    ON CONFLICT (id) DO UPDATE
    SET public = true,
        file_size_limit = 104857600,
        allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
END $$;

-- Step 4: Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;

-- Verification
SELECT 'Storage policies fixed. Buckets configured:' as message;
SELECT id, name, public, file_size_limit FROM storage.buckets WHERE id IN ('profile-images', 'videos');
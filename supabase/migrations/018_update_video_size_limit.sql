-- Update video bucket size limit to 5GB
-- Run this in Supabase SQL Editor

-- Update existing videos bucket to allow 5GB files
UPDATE storage.buckets 
SET file_size_limit = 5368709120 -- 5GB in bytes
WHERE id = 'videos';

-- Verify the update
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'videos';

-- Note: If you're using Supabase Pro plan or higher, you can increase this further
-- Free tier might have limitations on total storage and file sizes
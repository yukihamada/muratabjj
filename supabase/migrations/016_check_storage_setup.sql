-- Check if storage schema and buckets exist
-- This is a diagnostic query, not a migration

-- Check if storage schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'storage';

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check storage objects (limit to recent)
SELECT 
  id,
  bucket_id,
  name,
  owner,
  created_at,
  updated_at,
  metadata
FROM storage.objects
ORDER BY created_at DESC
LIMIT 10;

-- Check RLS policies on storage.objects
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects';

-- Check RLS policies on storage.buckets
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'buckets';
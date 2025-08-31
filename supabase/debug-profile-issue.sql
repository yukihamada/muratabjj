-- Debug profile update issue
-- Run each query separately to diagnose the problem

-- 1. Check if table exists and its exact name
SELECT 
    tablename,
    schemaname,
    tableowner
FROM pg_tables 
WHERE tablename LIKE '%user%profile%'
   OR tablename LIKE '%profile%';

-- 2. Check current user
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as current_email,
    auth.role() as current_role;

-- 3. Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 4. List all policies
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
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 5. Try to select your own profile
SELECT * FROM user_profiles WHERE user_id = auth.uid();

-- 6. Check if you can insert (dry run)
SELECT 
    CASE 
        WHEN auth.uid() IS NULL THEN 'Not authenticated'
        WHEN EXISTS (SELECT 1 FROM user_profiles WHERE user_id = auth.uid()) THEN 'Profile exists'
        ELSE 'Profile does not exist'
    END as profile_status;

-- 7. Check column names and data types
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
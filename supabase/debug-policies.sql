-- Debug: Check current policies on user_profiles table
-- Run this first to see what policies are causing the infinite recursion

-- 1. List all policies on user_profiles
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

-- 2. Check if there are any functions that might be causing issues
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN ('is_admin_user', 'is_admin', 'check_admin_status')
    OR prosrc LIKE '%user_profiles%';

-- 3. Check triggers on user_profiles
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as trigger_function,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'user_profiles'::regclass;

-- 4. Check if auth.users has any triggers that reference user_profiles
SELECT 
    tgname as trigger_name,
    tgfoid::regproc as trigger_function,
    tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'auth.users'::regclass;
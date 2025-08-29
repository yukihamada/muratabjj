-- EMERGENCY FIX: Complete reset of user_profiles policies to fix infinite recursion
-- This script completely removes all policies and creates minimal working ones

-- Step 1: Disable RLS completely
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies forcefully
DO $$ 
DECLARE
    pol record;
BEGIN
    -- Drop all policies on user_profiles
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_profiles', pol.policyname);
    END LOOP;
    
    -- Also drop policies on other tables that might reference user_profiles
    FOR pol IN 
        SELECT DISTINCT tablename, policyname 
        FROM pg_policies 
        WHERE qual LIKE '%user_profiles%' 
           OR with_check LIKE '%user_profiles%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- Step 3: Drop any admin check functions that might reference user_profiles
DROP FUNCTION IF EXISTS is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS check_admin_status() CASCADE;
DROP FUNCTION IF EXISTS is_admin_by_email() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;

-- Step 4: Create a simple admin check function that ONLY uses auth.jwt()
CREATE OR REPLACE FUNCTION is_admin_by_email()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        CASE 
            WHEN auth.jwt() ->> 'email' IN (
                'admin@test.muratabjj.com',
                'shu.shu.4029@gmail.com',
                'yuki@hamada.tokyo',
                'yukihamada010@gmail.com'
            ) THEN true
            ELSE false
        END;
$$;

-- Step 5: Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create MINIMAL policies - no complex logic, no joins, no subqueries
-- Policy 1: Users can see their own profile only
CREATE POLICY "own_profile_select" ON user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Users can insert their own profile only
CREATE POLICY "own_profile_insert" ON user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile only
CREATE POLICY "own_profile_update" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Admins can see all profiles (using simple email check)
CREATE POLICY "admin_select_all" ON user_profiles
    FOR SELECT
    USING (is_admin_by_email());

-- Policy 5: Public profiles (coaches) can be viewed by anyone
CREATE POLICY "public_coach_profiles" ON user_profiles
    FOR SELECT
    USING (is_coach = true);

-- Step 7: Grant permissions
GRANT EXECUTE ON FUNCTION is_admin_by_email() TO authenticated;
GRANT ALL ON user_profiles TO authenticated;

-- Step 8: Create a safe profile creation function
CREATE OR REPLACE FUNCTION safe_ensure_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Use a simple INSERT with ON CONFLICT to avoid any recursion
    INSERT INTO user_profiles (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Failed to create user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 9: Recreate trigger with the safe function
DROP TRIGGER IF EXISTS ensure_user_profile_trigger ON auth.users;
CREATE TRIGGER ensure_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION safe_ensure_user_profile();

-- Step 10: Add comments for documentation
COMMENT ON POLICY "own_profile_select" ON user_profiles IS 'Users can only view their own profile';
COMMENT ON POLICY "own_profile_insert" ON user_profiles IS 'Users can only create their own profile';
COMMENT ON POLICY "own_profile_update" ON user_profiles IS 'Users can only update their own profile';
COMMENT ON POLICY "admin_select_all" ON user_profiles IS 'Admins can view all profiles based on email';
COMMENT ON POLICY "public_coach_profiles" ON user_profiles IS 'Coach profiles are publicly viewable';
COMMENT ON FUNCTION is_admin_by_email() IS 'Simple admin check using JWT email claim only - no table queries';

-- Verification query
SELECT 'Policies reset complete. Run the debug query to verify:' as message;
SELECT tablename, policyname, cmd FROM pg_policies WHERE tablename = 'user_profiles';
#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

console.log('📝 Adding role column to profiles table...\n');
console.log('Please run the following SQL in Supabase SQL Editor:\n');

const sql = `
-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'coach'));

-- Update role for admin users
UPDATE profiles
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('shu.shu.4029@gmail.com', 'yuki@hamada.tokyo')
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
`;

console.log(sql);
console.log('\n✅ After running this SQL, the admin page should work correctly.');
console.log('🔗 Go to: https://app.supabase.com → SQL Editor → New Query');
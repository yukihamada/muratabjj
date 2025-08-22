#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const https = require('https');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project reference from URL');
  process.exit(1);
}

console.log(`🔧 Project reference: ${projectRef}`);
console.log('📝 Executing SQL to add role column...\n');

const sql = `
-- Add role column to profiles table
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

// Execute SQL using Supabase Management API
const postData = JSON.stringify({
  query: sql
});

const options = {
  hostname: 'api.supabase.com',
  port: 443,
  path: `/v1/projects/${projectRef}/database/query`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length,
    'Authorization': `Bearer ${supabaseServiceKey}`,
    'apikey': supabaseServiceKey
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ SQL executed successfully!');
        console.log('📊 Result:', result);
        console.log('\n🎉 The admin page should now work correctly.');
      } else {
        console.error('❌ Failed to execute SQL:');
        console.error(`Status: ${res.statusCode}`);
        console.error('Response:', result);
        
        if (res.statusCode === 401) {
          console.log('\n⚠️  Authentication failed. The Management API requires different credentials.');
          console.log('📝 Please run the SQL manually in Supabase Dashboard.');
        }
      }
    } catch (e) {
      console.error('❌ Error parsing response:', e.message);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request error:', error.message);
});

req.write(postData);
req.end();
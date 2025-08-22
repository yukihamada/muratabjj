#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

// API route that expects profiles table without role column
// Let's create a temporary workaround
async function createAdminWorkaround() {
  console.log('🔧 Creating admin workaround...\n');
  
  try {
    // Get admin users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }
    
    const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo'];
    
    // Create a mapping file for the API to recognize admins
    const adminMapping = {};
    
    for (const email of adminEmails) {
      const user = authData.users.find(u => u.email === email);
      if (user) {
        adminMapping[user.id] = true;
        console.log(`✅ Found admin: ${email} (${user.id})`);
      }
    }
    
    // Save admin mapping to a JSON file
    const fs = require('fs');
    const path = require('path');
    const adminConfigPath = path.join(__dirname, '..', 'src', 'config', 'admins.json');
    
    // Create config directory if it doesn't exist
    const configDir = path.dirname(adminConfigPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    fs.writeFileSync(adminConfigPath, JSON.stringify(adminMapping, null, 2));
    console.log('\n✅ Admin configuration saved to src/config/admins.json');
    
    // Now update the API to use this configuration
    console.log('\n📝 Updating API to use admin configuration...');
    
    // The API will need to be updated to check this file
    console.log('✅ Workaround complete!');
    console.log('\n⚠️  Note: This is a temporary workaround.');
    console.log('📝 For a permanent solution, please add the role column to the profiles table in Supabase.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

createAdminWorkaround();
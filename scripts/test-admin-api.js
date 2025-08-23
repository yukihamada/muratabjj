#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdminAPI() {
  console.log('🧪 Testing Admin API...\n');
  
  try {
    // ログイン
    const adminEmail = 'yuki@hamada.tokyo';
    console.log(`📧 Logging in as ${adminEmail}...`);
    
    // 既存のセッションをチェック
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('❌ No active session. Please login first at https://www.muratabjj.com');
      return;
    }
    
    console.log('✅ Active session found');
    console.log(`   User: ${session.user.email}`);
    
    // API呼び出し
    console.log('\n📡 Calling admin API...');
    const response = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('\n📊 Response:', JSON.stringify(data, null, 2));
    
    if (data.users) {
      console.log(`\n✅ Found ${data.users.length} users`);
      data.users.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ${user.full_name || 'No name'}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testAdminAPI();
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

async function checkProfiles() {
  console.log('🔍 Checking profiles table...\n');
  
  try {
    // profilesテーブルから全データを取得
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
      return;
    }
    
    console.log(`✅ Found ${profiles.length} profiles:`);
    profiles.forEach(profile => {
      console.log(`\n📋 Profile ID: ${profile.id}`);
      console.log(`   Full Name: ${profile.full_name || 'Not set'}`);
      console.log(`   Belt: ${profile.belt || 'white'}`);
      console.log(`   Stripes: ${profile.stripes || 0}`);
      console.log(`   Role: ${profile.role || 'Not set'}`);
      console.log(`   Created: ${profile.created_at}`);
    });
    
    // auth.usersとの関連を確認
    console.log('\n\n🔗 Checking auth.users connection...');
    const { data: authData } = await supabase.auth.admin.listUsers();
    
    if (authData) {
      console.log(`\n✅ Found ${authData.users.length} auth users:`);
      authData.users.forEach(user => {
        const hasProfile = profiles.some(p => p.id === user.id);
        console.log(`   - ${user.email} ${hasProfile ? '✅ has profile' : '❌ no profile'}`);
      });
    }
    
    // roleカラムの状態を確認
    const admins = profiles.filter(p => p.role === 'admin');
    console.log(`\n👮 Admin users: ${admins.length}`);
    admins.forEach(admin => {
      console.log(`   - ${admin.full_name || admin.id}`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkProfiles();
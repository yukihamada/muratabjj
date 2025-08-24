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

async function checkAdminStatus() {
  console.log('🔍 Checking admin status for yuki@hamada.tokyo...\n');
  
  try {
    // Get auth user
    const { data: authData } = await supabase.auth.admin.listUsers();
    const yukiUser = authData.users.find(u => u.email === 'yuki@hamada.tokyo');
    
    if (!yukiUser) {
      console.error('❌ User yuki@hamada.tokyo not found in auth.users');
      return;
    }
    
    console.log('✅ Found auth user:');
    console.log(`   ID: ${yukiUser.id}`);
    console.log(`   Email: ${yukiUser.email}`);
    console.log(`   Created: ${yukiUser.created_at}`);
    
    // Check profiles table
    console.log('\n📋 Checking profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', yukiUser.id)
      .single();
      
    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
      return;
    }
    
    if (profile) {
      console.log('✅ Found profile:');
      console.log(`   Full Name: ${profile.full_name || 'Not set'}`);
      console.log(`   Belt: ${profile.belt}`);
      console.log(`   Role: ${profile.role}`);
      console.log(`   Is Admin: ${profile.role === 'admin' ? '✅ YES' : '❌ NO'}`);
      
      if (profile.role !== 'admin') {
        console.log('\n⚠️  User is not an admin!');
        console.log('🔧 Updating to admin...');
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', yukiUser.id);
          
        if (updateError) {
          console.error('❌ Failed to update:', updateError.message);
        } else {
          console.log('✅ Updated to admin successfully!');
        }
      }
    }
    
    // Check user_profiles table (if exists)
    console.log('\n📋 Checking user_profiles table...');
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`id.eq.${yukiUser.id},user_id.eq.${yukiUser.id}`)
      .single();
      
    if (userProfileError) {
      if (userProfileError.message.includes('not exist')) {
        console.log('ℹ️  user_profiles table does not exist');
      } else {
        console.log('⚠️  user_profiles query error:', userProfileError.message);
      }
    } else if (userProfile) {
      console.log('✅ Found user_profile:');
      console.log(`   Is Admin: ${userProfile.is_admin ? '✅ YES' : '❌ NO'}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

checkAdminStatus();
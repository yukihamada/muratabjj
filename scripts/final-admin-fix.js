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

async function finalAdminFix() {
  console.log('🔧 Final Admin Fix for yuki@hamada.tokyo...\n');
  
  try {
    // Get auth user
    const { data: authData } = await supabase.auth.admin.listUsers();
    const yukiUser = authData.users.find(u => u.email === 'yuki@hamada.tokyo');
    
    if (!yukiUser) {
      console.error('❌ User yuki@hamada.tokyo not found');
      return;
    }
    
    console.log(`✅ Found user: ${yukiUser.email} (${yukiUser.id})`);
    
    // Check both tables to understand the current state
    console.log('\n🔍 Checking current state...');
    
    // Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', yukiUser.id)
      .single();
    
    console.log('📋 profiles table:');
    if (profileError) {
      console.log(`   ❌ ${profileError.message}`);
    } else {
      console.log(`   ✅ Found: ${profile.full_name || 'No name'}, role: ${profile.role || 'no role'}`);
    }
    
    // Check user_profiles table
    const { data: userProfile, error: userProfileError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`id.eq.${yukiUser.id},user_id.eq.${yukiUser.id}`)
      .single();
    
    console.log('📋 user_profiles table:');
    if (userProfileError) {
      console.log(`   ❌ ${userProfileError.message}`);
      
      if (userProfileError.code === 'PGRST116') {
        console.log('   📝 Creating user_profiles entry...');
        const { data: newUserProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: yukiUser.id,
            full_name: profile?.full_name || '濱田優貴',
            belt: profile?.belt || 'white',
            stripes: profile?.stripes || 0,
            is_admin: true,
            is_coach: true,
            subscription_plan: 'pro',
            subscription_status: 'active'
          })
          .select()
          .single();
          
        if (createError) {
          console.error('   ❌ Failed to create:', createError.message);
        } else {
          console.log('   ✅ Created user_profiles entry with admin privileges');
        }
      }
    } else {
      console.log(`   ✅ Found: is_admin=${userProfile.is_admin}, is_coach=${userProfile.is_coach}`);
      
      if (!userProfile.is_admin) {
        console.log('   📝 Updating to admin...');
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            is_admin: true,
            is_coach: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', yukiUser.id);
          
        if (updateError) {
          console.error('   ❌ Failed to update:', updateError.message);
        } else {
          console.log('   ✅ Updated to admin successfully');
        }
      }
    }
    
    // Final verification
    console.log('\n✅ Final verification:');
    const { data: finalUserProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`id.eq.${yukiUser.id},user_id.eq.${yukiUser.id}`)
      .single();
    
    if (finalUserProfile) {
      console.log(`   Admin status: ${finalUserProfile.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`   Coach status: ${finalUserProfile.is_coach ? '✅ YES' : '❌ NO'}`);
      console.log(`   Subscription: ${finalUserProfile.subscription_plan || 'free'}`);
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

finalAdminFix();
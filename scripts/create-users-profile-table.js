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

async function createUsersProfileTable() {
  console.log('🔧 Creating users_profile table via API...\n');
  
  try {
    // First, let's check if we can access the auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Cannot access auth.users:', authError.message);
      return;
    }
    
    console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
    
    // Try to select from users_profile to check if it exists
    const { data: existingProfiles, error: profileError } = await supabase
      .from('users_profile')
      .select('user_id')
      .limit(1);
    
    if (profileError && profileError.message.includes('relation "public.users_profile" does not exist')) {
      console.log('❌ users_profile table does not exist');
      console.log('\n📝 The table needs to be created via Supabase Dashboard SQL Editor');
      console.log('📂 Use the SQL from: supabase/migrations/005_fix_users_profile_table.sql\n');
      
      // Let's at least create profiles for existing users using the profiles table
      console.log('🔍 Checking if profiles table exists...');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (!profilesError && profiles) {
        console.log(`✅ Found ${profiles.length} profiles in profiles table`);
        console.log('\n📋 Existing profiles:');
        profiles.forEach(profile => {
          console.log(`   - ${profile.full_name || profile.id} (${profile.belt || 'white'} belt)`);
        });
      }
      
      return;
    }
    
    if (!profileError) {
      console.log('✅ users_profile table exists!');
      
      // Create profiles for users who don't have one
      const { data: allProfiles } = await supabase
        .from('users_profile')
        .select('user_id');
      
      const existingUserIds = new Set(allProfiles?.map(p => p.user_id) || []);
      const usersWithoutProfiles = authUsers.users.filter(user => !existingUserIds.has(user.id));
      
      if (usersWithoutProfiles.length > 0) {
        console.log(`\n📝 Creating profiles for ${usersWithoutProfiles.length} users...`);
        
        for (const user of usersWithoutProfiles) {
          const isAdmin = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo'].includes(user.email);
          
          const { error: insertError } = await supabase
            .from('users_profile')
            .insert({
              user_id: user.id,
              full_name: user.user_metadata?.full_name || user.email,
              belt: 'white',
              stripes: 0,
              is_coach: false,
              is_admin: isAdmin,
              subscription_plan: 'free',
              subscription_status: 'inactive'
            });
            
          if (insertError) {
            console.error(`❌ Failed to create profile for ${user.email}:`, insertError.message);
          } else {
            console.log(`✅ Created profile for ${user.email}${isAdmin ? ' (admin)' : ''}`);
          }
        }
      } else {
        console.log('\n✅ All users have profiles');
      }
      
      // Update admin status
      const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo'];
      console.log('\n🔐 Updating admin status...');
      
      for (const email of adminEmails) {
        const user = authUsers.users.find(u => u.email === email);
        if (user) {
          const { error: updateError } = await supabase
            .from('users_profile')
            .update({ is_admin: true })
            .eq('user_id', user.id);
            
          if (!updateError) {
            console.log(`✅ Set admin status for ${email}`);
          }
        }
      }
      
      // Display final status
      const { data: finalProfiles } = await supabase
        .from('users_profile')
        .select('*');
        
      console.log(`\n📊 Final status: ${finalProfiles?.length || 0} user profiles`);
      const admins = finalProfiles?.filter(p => p.is_admin) || [];
      console.log(`👮 Admin users: ${admins.length}`);
      admins.forEach(admin => {
        console.log(`   - ${admin.full_name || 'Unknown'}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📝 Please create the users_profile table manually in Supabase Dashboard');
  }
}

createUsersProfileTable();
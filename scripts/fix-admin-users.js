#!/usr/bin/env node

/**
 * Fix admin users table issue
 * This script ensures the users_profile table exists and has the correct structure
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminUsers() {
  console.log('🔧 Fixing admin users table...\n');

  try {
    // 1. Check if users_profile table exists
    console.log('1. Checking users_profile table...');
    const { data: profileCheck, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .select('*')
      .limit(1);

    if (profileError) {
      console.log('❌ users_profile table error:', profileError.message);
      console.log('\n📝 Please run the following SQL in Supabase SQL Editor:');
      console.log('   supabase/migrations/005_fix_users_profile_table.sql');
      return;
    }

    console.log('✅ users_profile table exists');

    // 2. Get all auth users
    console.log('\n2. Fetching auth users...');
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`✅ Found ${users.length} auth users`);

    // 3. Check and create missing profiles
    console.log('\n3. Checking for missing profiles...');
    let missingCount = 0;
    let createdCount = 0;

    for (const user of users) {
      const { data: profile, error: checkError } = await supabaseAdmin
        .from('users_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        missingCount++;
        const isAdmin = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo'].includes(user.email);
        
        const { error: insertError } = await supabaseAdmin
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
          console.log(`❌ Error creating profile for ${user.email}:`, insertError.message);
        } else {
          createdCount++;
          console.log(`✅ Created profile for ${user.email}${isAdmin ? ' (Admin)' : ''}`);
        }
      }
    }

    if (missingCount === 0) {
      console.log('✅ All users have profiles');
    } else {
      console.log(`\n📊 Created ${createdCount} out of ${missingCount} missing profiles`);
    }

    // 4. Update admin status for known admins
    console.log('\n4. Updating admin status...');
    const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo'];
    
    for (const email of adminEmails) {
      const user = users.find(u => u.email === email);
      if (user) {
        const { error: updateError } = await supabaseAdmin
          .from('users_profile')
          .update({ is_admin: true })
          .eq('user_id', user.id);

        if (updateError) {
          console.log(`❌ Error updating admin status for ${email}:`, updateError.message);
        } else {
          console.log(`✅ Updated admin status for ${email}`);
        }
      }
    }

    // 5. Display final statistics
    console.log('\n5. Final statistics:');
    const { data: allProfiles, error: statsError } = await supabaseAdmin
      .from('users_profile')
      .select('*');

    if (!statsError && allProfiles) {
      console.log(`   Total profiles: ${allProfiles.length}`);
      console.log(`   Admins: ${allProfiles.filter(p => p.is_admin).length}`);
      console.log(`   Coaches: ${allProfiles.filter(p => p.is_coach).length}`);
      console.log(`   Pro/Dojo subscribers: ${allProfiles.filter(p => p.subscription_plan !== 'free').length}`);
    }

    console.log('\n✨ Admin users fix completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the fix
fixAdminUsers();
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

async function updateAdminProfiles() {
  console.log('🔧 Updating admin profiles...\n');
  
  try {
    // Get auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }
    
    const adminEmails = ['shu.shu.4029@gmail.com', 'yuki@hamada.tokyo'];
    console.log('🔍 Looking for admin users:', adminEmails.join(', '));
    
    // Update each admin user
    for (const email of adminEmails) {
      const user = authData.users.find(u => u.email === email);
      
      if (user) {
        console.log(`\n📧 Found user: ${email} (ID: ${user.id})`);
        
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError && profileError.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log('   ➕ Creating profile...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              full_name: user.user_metadata?.full_name || email,
              belt: 'black',
              stripes: 0,
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.error('   ❌ Failed to create profile:', insertError.message);
          } else {
            console.log('   ✅ Profile created with admin role');
          }
        } else if (profile) {
          // Profile exists, update role to admin
          console.log('   📝 Updating existing profile...');
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              role: 'admin',
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('   ❌ Failed to update profile:', updateError.message);
          } else {
            console.log('   ✅ Profile updated to admin role');
          }
        }
      } else {
        console.log(`\n⚠️  User not found: ${email}`);
      }
    }
    
    // Display final status
    console.log('\n📊 Final status:');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (allProfiles) {
      console.log(`Total profiles: ${allProfiles.length}`);
      const admins = allProfiles.filter(p => p.role === 'admin');
      console.log(`Admin profiles: ${admins.length}`);
      admins.forEach(admin => {
        console.log(`   - ${admin.full_name || admin.id}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

updateAdminProfiles();
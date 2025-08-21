#!/usr/bin/env node

/**
 * Seed test users for Murata BJJ
 * This creates test users with different roles and subscription tiers
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test users data
const testUsers = [
  {
    email: 'admin@test.muratabjj.com',
    password: 'Admin123!@#',
    profile: {
      display_name: 'Admin User',
      role: 'admin',
      belt: 'black',
      subscription_tier: 'pro',
      bio_ja: '管理者アカウント',
      bio_en: 'Administrator account',
      bio_pt: 'Conta de administrador'
    }
  },
  {
    email: 'coach@test.muratabjj.com',
    password: 'Coach123!@#',
    profile: {
      display_name: 'Coach Tanaka',
      role: 'coach',
      belt: 'brown',
      subscription_tier: 'pro',
      bio_ja: 'テスト道場のコーチ',
      bio_en: 'Test dojo coach',
      bio_pt: 'Treinador do dojo de teste'
    }
  },
  {
    email: 'pro@test.muratabjj.com',
    password: 'Pro123!@#',
    profile: {
      display_name: 'Pro User',
      role: 'student',
      belt: 'purple',
      subscription_tier: 'pro',
      bio_ja: 'プロプランユーザー',
      bio_en: 'Pro plan user',
      bio_pt: 'Usuário do plano Pro'
    }
  },
  {
    email: 'user@test.muratabjj.com',
    password: 'User123!@#',
    profile: {
      display_name: 'Regular User',
      role: 'student',
      belt: 'blue',
      subscription_tier: 'free',
      bio_ja: '一般ユーザー',
      bio_en: 'Regular user',
      bio_pt: 'Usuário regular'
    }
  },
  {
    email: 'beginner@test.muratabjj.com',
    password: 'Beginner123!@#',
    profile: {
      display_name: 'Beginner Student',
      role: 'student',
      belt: 'white',
      subscription_tier: 'free',
      bio_ja: '初心者ユーザー',
      bio_en: 'Beginner user',
      bio_pt: 'Usuário iniciante'
    }
  }
];

async function createUser(userData) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      throw authError;
    }

    console.log(`✅ Created auth user: ${userData.email}`);

    // Create or update profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        ...userData.profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log(`✅ Created profile for: ${userData.profile.display_name}`);

    // If user has pro subscription, create subscription record
    if (userData.profile.subscription_tier === 'pro') {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: authData.user.id,
          stripe_customer_id: `cus_test_${authData.user.id.substring(0, 8)}`,
          stripe_subscription_id: `sub_test_${authData.user.id.substring(0, 8)}`,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          plan_id: 'pro_monthly',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (subError) {
        console.warn(`⚠️  Could not create subscription for ${userData.email}:`, subError.message);
      } else {
        console.log(`✅ Created subscription for: ${userData.email}`);
      }
    }

    return authData.user;
  } catch (error) {
    console.error(`❌ Failed to create user ${userData.email}:`, error.message);
    return null;
  }
}

async function seedUsers() {
  try {
    console.log('🌱 Starting user seed...\n');

    const createdUsers = [];

    for (const userData of testUsers) {
      const user = await createUser(userData);
      if (user) {
        createdUsers.push(user);
      }
    }

    console.log('\n✨ User seed completed!');
    console.log(`\n📊 Created ${createdUsers.length} test users:`);
    
    testUsers.forEach(user => {
      console.log(`\n${user.profile.display_name}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.profile.role}`);
      console.log(`   Belt: ${user.profile.belt}`);
      console.log(`   Subscription: ${user.profile.subscription_tier}`);
    });

    console.log('\n🎯 You can now log in with these test accounts!');

  } catch (error) {
    console.error('❌ User seed failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed
seedUsers();
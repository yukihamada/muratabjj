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

async function testAPI() {
  console.log('🧪 Admin API Test with Service Key\n');
  
  try {
    // 1. ユーザー確認
    console.log('1️⃣ ユーザーデータ確認');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }
    
    const yukiUser = authUsers.users.find(u => u.email === 'yuki@hamada.tokyo');
    
    if (!yukiUser) {
      console.error('❌ User yuki@hamada.tokyo not found');
      return;
    }
    
    console.log('✅ ユーザー確認');
    console.log(`   ID: ${yukiUser.id}`);
    console.log(`   Email: ${yukiUser.email}`);
    console.log(`   作成日: ${new Date(yukiUser.created_at).toLocaleString('ja-JP')}`);
    
    // 2. プロファイル確認
    console.log('\n2️⃣ プロファイル確認');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', yukiUser.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
    } else {
      console.log('✅ プロファイル取得成功');
      console.log(`   名前: ${profile.full_name || '未設定'}`);
      console.log(`   管理者: ${profile.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`   コーチ: ${profile.is_coach ? '✅ YES' : '❌ NO'}`);
      console.log(`   帯: ${profile.belt || 'white'}`);
      console.log(`   ストライプ: ${profile.stripes || 0}`);
      console.log(`   サブスクリプション: ${profile.subscription_tier || 'free'}`);
      console.log(`   ステータス: ${profile.subscription_status || 'inactive'}`);
    }
    
    // 3. 全ユーザーリスト
    console.log('\n3️⃣ 全ユーザーリスト');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allProfilesError) {
      console.error('❌ Error fetching all profiles:', allProfilesError.message);
    } else {
      console.log(`✅ ${allProfiles.length} ユーザー取得`);
      console.log('\n📋 ユーザーリスト:');
      
      allProfiles.forEach(p => {
        const authUser = authUsers.users.find(u => u.id === p.user_id);
        console.log(`\n   ${authUser?.email || 'Unknown email'}`);
        console.log(`   - 名前: ${p.full_name || '未設定'}`);
        console.log(`   - 権限: ${p.is_admin ? '管理者' : p.is_coach ? 'コーチ' : 'ユーザー'}`);
        console.log(`   - 帯: ${p.belt || 'white'} (${p.stripes || 0} stripes)`);
        console.log(`   - プラン: ${p.subscription_tier || 'free'}`);
      });
    }
    
    // 4. 管理者ユーザーのみ
    console.log('\n4️⃣ 管理者ユーザー');
    const { data: adminProfiles, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('is_admin', true);
    
    if (adminError) {
      console.error('❌ Error fetching admin profiles:', adminError.message);
    } else {
      console.log(`✅ ${adminProfiles.length} 名の管理者`);
      adminProfiles.forEach(admin => {
        const authUser = authUsers.users.find(u => u.id === admin.user_id);
        console.log(`   - ${authUser?.email || admin.id}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

testAPI();
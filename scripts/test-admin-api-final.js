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
    // 1. ログインテスト
    console.log('1️⃣ ログインテスト');
    console.log('   Email: yuki@hamada.tokyo');
    console.log('   パスワードを入力してください...\n');
    
    const password = 'Test123!@#'; // テスト用パスワード
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'yuki@hamada.tokyo',
      password: password
    });
    
    if (authError) {
      console.error('❌ ログインエラー:', authError.message);
      console.log('\n💡 ヒント: ブラウザでログインしてからもう一度試してください');
      return;
    }
    
    console.log('✅ ログイン成功');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Session: ${authData.session ? 'Active' : 'None'}`);
    
    // 2. プロファイル確認
    console.log('\n2️⃣ プロファイル確認');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ プロファイル取得エラー:', profileError.message);
    } else {
      console.log('✅ プロファイル取得成功');
      console.log(`   名前: ${profile.full_name || '未設定'}`);
      console.log(`   管理者: ${profile.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`   コーチ: ${profile.is_coach ? '✅ YES' : '❌ NO'}`);
      console.log(`   帯: ${profile.belt || 'white'}`);
      console.log(`   サブスクリプション: ${profile.subscription_tier || 'free'}`);
    }
    
    // 3. Admin API呼び出し
    console.log('\n3️⃣ Admin API呼び出し');
    console.log('   URL: http://localhost:3000/api/admin/users');
    
    try {
      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ API呼び出し成功');
        console.log(`   ユーザー数: ${data.users?.length || 0}`);
        
        if (data.users && data.users.length > 0) {
          console.log('\n📋 ユーザーリスト:');
          data.users.forEach(user => {
            console.log(`   - ${user.email} (${user.full_name || '名前未設定'})`);
            console.log(`     管理者: ${user.is_admin ? '✅' : '❌'}, コーチ: ${user.is_coach ? '✅' : '❌'}`);
          });
        }
      } else {
        console.log('❌ API呼び出し失敗');
        console.log(`   エラー: ${data.error || 'Unknown error'}`);
        if (data.details) {
          console.log(`   詳細: ${data.details}`);
        }
      }
    } catch (fetchError) {
      console.error('❌ APIアクセスエラー:', fetchError.message);
      console.log('\n💡 ヒント: 開発サーバーが起動していることを確認してください');
      console.log('   npm run dev');
    }
    
    // 4. 本番環境テスト
    console.log('\n4️⃣ 本番環境API呼び出し');
    console.log('   URL: https://www.muratabjj.com/api/admin/users');
    
    try {
      const prodResponse = await fetch('https://www.muratabjj.com/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${authData.session.access_token}`
        }
      });
      
      console.log(`   Status: ${prodResponse.status} ${prodResponse.statusText}`);
      
      const prodData = await prodResponse.json();
      
      if (prodResponse.ok) {
        console.log('✅ 本番API呼び出し成功');
        console.log(`   ユーザー数: ${prodData.users?.length || 0}`);
      } else {
        console.log('❌ 本番API呼び出し失敗');
        console.log(`   エラー: ${prodData.error || 'Unknown error'}`);
      }
    } catch (prodError) {
      console.error('❌ 本番APIアクセスエラー:', prodError.message);
    }
    
  } catch (err) {
    console.error('❌ テストエラー:', err.message);
  }
}

// パスワード入力のプロンプト
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('パスワードを入力してください: ', (password) => {
  rl.close();
  
  // パスワードを使ってテスト実行
  global.testPassword = password;
  testAdminAPI();
});
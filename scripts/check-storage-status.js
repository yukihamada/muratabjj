#!/usr/bin/env node

/**
 * Check Supabase Storage Status
 * このスクリプトでSupabaseストレージの状態を確認します
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  console.error('必要な環境変数: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStorageStatus() {
  console.log('🔍 Supabaseストレージの状態を確認中...\n')
  
  try {
    // 1. バケット一覧を取得
    console.log('1. バケット一覧を取得...')
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ バケット一覧取得エラー:', listError.message)
      return
    }
    
    console.log('✅ 既存のバケット:')
    buckets.forEach(bucket => {
      console.log(`   - ${bucket.name} (公開: ${bucket.public ? 'はい' : 'いいえ'})`)
    })
    
    // 2. 必要なバケットの存在確認
    const requiredBuckets = ['videos', 'thumbnails', 'avatars']
    const existingBuckets = buckets.map(b => b.name)
    const missingBuckets = requiredBuckets.filter(name => !existingBuckets.includes(name))
    
    console.log('\n2. 必要なバケットの確認...')
    if (missingBuckets.length === 0) {
      console.log('✅ すべての必要なバケットが存在します')
    } else {
      console.log('⚠️ 不足しているバケット:')
      missingBuckets.forEach(name => console.log(`   - ${name}`))
      
      console.log('\n📋 Supabaseダッシュボードでの手動作成手順:')
      console.log('1. https://app.supabase.com でプロジェクトを開く')
      console.log('2. 左メニューから「Storage」を選択')
      console.log('3. 「Create bucket」ボタンをクリック')
      missingBuckets.forEach(name => {
        const isPublic = name === 'videos' || name === 'thumbnails'
        console.log(`4. バケット「${name}」を作成 (公開: ${isPublic ? 'はい' : 'いいえ'})`)
      })
    }
    
    // 3. ストレージポリシーの確認
    console.log('\n3. ストレージポリシーの確認...')
    
    if (existingBuckets.includes('videos')) {
      // テストファイルのアップロードを試行
      const testFileName = `test-${Date.now()}.txt`
      const testContent = 'test content'
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(testFileName, testContent, { upsert: true })
      
      if (uploadError) {
        console.log('⚠️ アップロードテストが失敗しました:')
        console.log(`   エラー: ${uploadError.message}`)
        
        if (uploadError.message.includes('policy')) {
          console.log('\n📋 RLSポリシーの修正が必要です:')
          console.log('以下のSQLをSupabaseのSQL Editorで実行してください:')
          console.log(`
-- Allow authenticated users to upload videos
CREATE POLICY "videos_upload_policy" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to view videos  
CREATE POLICY "videos_select_policy" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);
          `)
        }
      } else {
        console.log('✅ アップロードテスト成功')
        
        // テストファイルを削除
        await supabase.storage.from('videos').remove([testFileName])
      }
    }
    
    console.log('\n🎯 推奨アクション:')
    if (missingBuckets.length > 0) {
      console.log('1. 上記の手順でバケットを手動作成')
    }
    console.log('2. アプリでの動画アップロードをテスト')
    console.log('3. エラーが続く場合は、RLSポリシーを確認')
    
  } catch (error) {
    console.error('❌ ストレージ確認中にエラーが発生:', error.message)
  }
}

checkStorageStatus()
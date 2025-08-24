#!/usr/bin/env node

/**
 * Fix Supabase Storage Bucket Configuration
 * バケットの設定（ファイルサイズ制限、MIMEタイプ）を修正
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixBucketConfiguration() {
  console.log('🔧 バケット設定を修正中...\n')
  
  try {
    // 1. 現在のバケット設定を確認
    console.log('1. 現在のバケット設定を確認...')
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ バケット取得エラー:', error.message)
      return
    }
    
    console.log('現在のバケット設定:')
    buckets.forEach(bucket => {
      console.log(`📁 ${bucket.name}:`)
      console.log(`   - 公開: ${bucket.public}`)
      console.log(`   - ファイルサイズ制限: ${bucket.file_size_limit || '制限なし'}`)
      console.log(`   - 許可MIMEタイプ: ${bucket.allowed_mime_types?.join(', ') || 'すべて許可'}`)
    })
    
    // 2. バケット設定の更新を試行
    console.log('\n2. バケット設定の更新を試行...')
    
    const updates = [
      {
        name: 'videos',
        updates: {
          public: true,
          file_size_limit: 5368709120, // 5GB
          allowed_mime_types: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/avi']
        }
      },
      {
        name: 'thumbnails', 
        updates: {
          public: true,
          file_size_limit: 10485760, // 10MB
          allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'avatars',
        updates: {
          public: true, 
          file_size_limit: 5242880, // 5MB
          allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        }
      }
    ]
    
    for (const { name, updates: bucketUpdates } of updates) {
      console.log(`\n🔄 「${name}」バケットを更新中...`)
      
      const { error: updateError } = await supabase.storage.updateBucket(name, bucketUpdates)
      
      if (updateError) {
        console.log(`⚠️ 更新失敗: ${updateError.message}`)
        
        if (updateError.message.includes('not supported') || updateError.message.includes('permission')) {
          console.log('💡 Supabaseダッシュボードでの手動設定が必要です:')
          console.log(`1. https://app.supabase.com でプロジェクトを開く`)
          console.log(`2. Storage → ${name} → Settings`)
          console.log(`3. ファイルサイズ制限: ${Math.round(bucketUpdates.file_size_limit / 1024 / 1024)}MB`)
          console.log(`4. 許可MIMEタイプ: ${bucketUpdates.allowed_mime_types.join(', ')}`)
        }
      } else {
        console.log(`✅ 「${name}」バケットの更新完了`)
      }
    }
    
    // 3. RLSポリシーの状況を確認
    console.log('\n3. ストレージのRLSポリシーを確認...')
    
    console.log('📋 以下のSQLをSupabaseのSQL Editorで実行してください:')
    console.log(`
-- すべてのストレージオブジェクトのポリシーを削除（既存のものをクリア）
DROP POLICY IF EXISTS "videos_all_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "videos_select_policy" ON storage.objects;

-- 認証されたユーザーがvideosバケットに完全アクセス
CREATE POLICY "videos_full_access" ON storage.objects
FOR ALL USING (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- 認証されたユーザーがthumbnailsバケットに完全アクセス
CREATE POLICY "thumbnails_full_access" ON storage.objects
FOR ALL USING (
  bucket_id = 'thumbnails' AND
  auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.role() = 'authenticated'
);

-- 認証されたユーザーがavatarsバケットに完全アクセス
CREATE POLICY "avatars_full_access" ON storage.objects
FOR ALL USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated'
);
    `)
    
  } catch (error) {
    console.error('❌ 設定修正中にエラー:', error.message)
  }
}

fixBucketConfiguration()
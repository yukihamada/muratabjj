#!/usr/bin/env node

/**
 * Fix MOV file support in Supabase Storage
 * MOVファイルサポートの修正
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

async function fixMovSupport() {
  console.log('🎬 MOVファイルサポートを修正中...\n')
  
  try {
    // 1. videosバケット設定の更新
    console.log('1. videosバケット設定を更新...')
    
    const { error: updateError } = await supabase.storage.updateBucket('videos', {
      public: true,
      file_size_limit: 524288000, // 500MB
      allowed_mime_types: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/mov',
        'video/avi',
        'video/webm',
        // Appleデバイスの追加MIMEタイプ
        'video/x-quicktime',
        'application/octet-stream' // フォールバック用
      ]
    })
    
    if (updateError) {
      console.log('⚠️ バケット更新エラー:', updateError.message)
      
      if (updateError.message.includes('not supported') || updateError.message.includes('permission')) {
        console.log('\n💡 手動でSupabaseダッシュボードから設定してください:')
        console.log('1. https://app.supabase.com → プロジェクト選択')
        console.log('2. Storage → videos → Settings')
        console.log('3. 許可MIMEタイプに以下を追加:')
        console.log('   - video/mp4')
        console.log('   - video/quicktime')
        console.log('   - video/x-msvideo')
        console.log('   - video/mov')
        console.log('   - video/avi')
        console.log('   - video/webm')
        console.log('   - video/x-quicktime')
        console.log('   - application/octet-stream')
      }
    } else {
      console.log('✅ バケット設定更新完了')
    }
    
    // 2. MOVファイルのテストアップロード
    console.log('\n2. MOVファイル対応テスト...')
    
    // 小さなテストファイルを作成
    const testContent = new Blob(['test MOV content'], { type: 'video/quicktime' })
    const testFile = new File([testContent], 'test.MOV', { type: 'video/quicktime' })
    
    console.log('テストファイル情報:', {
      name: testFile.name,
      type: testFile.type,
      size: testFile.size
    })
    
    const testFileName = `test-mov-${Date.now()}.MOV`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(testFileName, testFile, { upsert: true })
    
    if (uploadError) {
      console.log('⚠️ MOVテストアップロード失敗:', uploadError.message)
      
      if (uploadError.message.includes('mime')) {
        console.log('\n📋 以下のSQLをSupabase SQL Editorで実行してください:')
        console.log(`
-- バケットのMIMEタイプ制限を緩和
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/quicktime', 
  'video/x-msvideo',
  'video/mov',
  'video/avi',
  'video/webm',
  'video/x-quicktime',
  'application/octet-stream'
]
WHERE name = 'videos';
        `)
      }
    } else {
      console.log('✅ MOVファイルテストアップロード成功')
      
      // テストファイルを削除
      await supabase.storage.from('videos').remove([uploadData.path])
      console.log('🗑️ テストファイルを削除')
    }
    
    // 3. 現在のバケット設定を確認
    console.log('\n3. 現在のバケット設定を確認...')
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.log('⚠️ バケット一覧取得エラー:', listError.message)
    } else {
      const videosBucket = buckets.find(b => b.name === 'videos')
      if (videosBucket) {
        console.log('📁 videosバケット設定:')
        console.log('   - ファイルサイズ制限:', videosBucket.file_size_limit || '制限なし')
        console.log('   - 許可MIMEタイプ:', videosBucket.allowed_mime_types?.join(', ') || 'すべて許可')
        console.log('   - 公開:', videosBucket.public ? 'はい' : 'いいえ')
      }
    }
    
    console.log('\n🎯 推奨アクション:')
    console.log('1. アプリで実際のMOVファイルをテストアップロード')
    console.log('2. エラーが続く場合は、上記SQLを実行')
    console.log('3. 必要に応じてファイル拡張子チェックを緩和')
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

fixMovSupport()
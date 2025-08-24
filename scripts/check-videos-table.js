#!/usr/bin/env node

/**
 * Check videos table structure and identify missing columns
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

async function checkVideosTable() {
  console.log('📊 videosテーブルの構造をチェック中...\n')
  
  try {
    // 1. Check table structure
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'videos' })
      .single()
    
    if (columnError) {
      // Fallback: Try to get column info using information_schema
      console.log('⚠️ カスタム関数が利用できません。別の方法でカラム情報を取得します...')
      
      const { data: schemaInfo, error: schemaError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'videos')
        .eq('table_schema', 'public')
      
      if (schemaError) {
        console.error('❌ テーブル構造の取得に失敗:', schemaError.message)
        
        // Try a simple query to see what happens
        console.log('\n🔍 シンプルなクエリでテーブルをテスト...')
        const { data: testData, error: testError } = await supabase
          .from('videos')
          .select('*')
          .limit(1)
        
        if (testError) {
          console.error('❌ videosテーブルへのアクセスエラー:', testError.message)
          
          if (testError.message.includes('relation') || testError.message.includes('does not exist')) {
            console.log('\n💡 videosテーブルが存在しません。以下のSQLを実行してください:')
            console.log(`
-- videosテーブルの作成
CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ja TEXT,
  title_en TEXT,
  title_pt TEXT,
  title TEXT, -- 後方互換性のため
  description_ja TEXT,
  description_en TEXT,
  description_pt TEXT,
  description TEXT, -- 後方互換性のため
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER,
  technique_id UUID,
  instructor_id UUID REFERENCES auth.users(id),
  user_id UUID REFERENCES auth.users(id),
  uploaded_by UUID REFERENCES auth.users(id),
  belt_requirement TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT FALSE,
  transcription_status TEXT DEFAULT 'pending',
  transcription_result TEXT,
  ai_analysis_enabled BOOLEAN DEFAULT FALSE,
  ai_analysis_result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 制約
  CONSTRAINT videos_title_check 
    CHECK (title_ja IS NOT NULL OR title_en IS NOT NULL OR title_pt IS NOT NULL OR title IS NOT NULL)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_videos_instructor_id ON videos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_technique_id ON videos(technique_id);

-- RLS有効化
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- ポリシー
CREATE POLICY "Users can insert own videos" ON videos
FOR INSERT WITH CHECK (
  auth.uid() = instructor_id OR 
  auth.uid() = user_id OR 
  auth.uid() = uploaded_by
);

CREATE POLICY "Users can view videos" ON videos
FOR SELECT USING (
  is_published = true OR
  auth.uid() = instructor_id OR
  auth.uid() = user_id OR
  auth.uid() = uploaded_by
);
            `)
          }
          return
        }
        
        console.log('✅ videosテーブルは存在しますが、構造情報を取得できませんでした')
        if (testData && testData.length > 0) {
          console.log('📄 サンプルデータの列名:', Object.keys(testData[0]))
        }
        return
      }
      
      console.log('📋 現在のvideosテーブルの構造:')
      schemaInfo.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL可' : 'NOT NULL'}`)
      })
      
      // Check for missing columns
      const requiredColumns = [
        'title_ja', 'title_en', 'title_pt',
        'description_ja', 'description_en', 'description_pt',
        'technique_id', 'instructor_id', 'belt_requirement',
        'is_premium', 'transcription_status', 'ai_analysis_enabled'
      ]
      
      const existingColumns = schemaInfo.map(col => col.column_name)
      const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col))
      
      if (missingColumns.length > 0) {
        console.log('\n⚠️ 不足しているカラム:', missingColumns.join(', '))
        console.log('\n📋 以下のSQLを実行してカラムを追加してください:')
        
        missingColumns.forEach(col => {
          let colDef = 'TEXT'
          if (col === 'technique_id' || col === 'instructor_id') colDef = 'UUID'
          if (col === 'is_premium' || col === 'ai_analysis_enabled') colDef = 'BOOLEAN DEFAULT FALSE'
          if (col === 'transcription_status') colDef = 'TEXT DEFAULT \'pending\''
          
          console.log(`ALTER TABLE videos ADD COLUMN IF NOT EXISTS ${col} ${colDef};`)
        })
        
        console.log('\n-- 外部キー制約の追加')
        console.log('ALTER TABLE videos ADD CONSTRAINT fk_videos_instructor FOREIGN KEY (instructor_id) REFERENCES auth.users(id);')
        console.log('ALTER TABLE videos ADD CONSTRAINT fk_videos_user FOREIGN KEY (user_id) REFERENCES auth.users(id);')
      } else {
        console.log('\n✅ すべての必要なカラムが存在します')
      }
      
      return
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

checkVideosTable()
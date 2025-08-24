#!/usr/bin/env node

/**
 * Check exact column names in videos table
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

async function checkColumns() {
  console.log('📊 videosテーブルの正確なカラム名を取得中...\n')
  
  try {
    // Try to insert a dummy record to see what columns are expected
    const { data, error } = await supabase
      .from('videos')
      .insert({})
      .select()
    
    if (error) {
      console.log('❌ エラーメッセージ:', error.message)
      
      // Parse error message for column information
      if (error.message.includes('null value in column')) {
        const match = error.message.match(/null value in column "([^"]+)"/)
        if (match) {
          console.log(`\n📝 必須カラム: "${match[1]}"`)
        }
      }
      
      // Try to get sample data to see column structure
      const { data: sampleData, error: sampleError } = await supabase
        .from('videos')
        .select('*')
        .limit(1)
      
      if (!sampleError && sampleData && sampleData.length > 0) {
        console.log('\n✅ 実際のカラム名:')
        Object.keys(sampleData[0]).forEach(col => {
          const value = sampleData[0][col]
          const type = value === null ? 'null' : typeof value
          console.log(`  - ${col} (${type})`)
        })
      }
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

checkColumns()
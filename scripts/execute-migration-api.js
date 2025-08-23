#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

// Supabase設定
const SUPABASE_URL = 'https://vyddhllzjjpqxbouqivf.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZGRobGx6ampwcXhib3VxaXZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzkyNTE4OSwiZXhwIjoyMDY5NTAxMTg5fQ.SsTxDDMPOrZ7d8nzfN_6Srhd4fLJZW64L4G18h4zCaw'

async function executeSql(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: sql })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    return true
  } catch (error) {
    console.error('❌ Error:', error.message)
    return false
  }
}

async function runMigration() {
  console.log('🚀 マイグレーション実行中...\n')

  const migrationFile = 'supabase/migrations/007_fix_database_issues.sql'
  const sqlContent = fs.readFileSync(path.join(__dirname, '..', migrationFile), 'utf8')

  // SQLを個別のステートメントに分割
  const statements = sqlContent
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`📋 ${statements.length}個のSQLステートメントを実行します...\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i]
    const preview = statement.substring(0, 50).replace(/\n/g, ' ')
    
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `)
    
    const result = await executeSql(statement + ';')
    
    if (result) {
      console.log('✅')
      success++
    } else {
      console.log('❌')
      failed++
    }
  }

  console.log(`\n📊 結果: 成功 ${success}, 失敗 ${failed}`)

  if (failed > 0) {
    console.log('\n⚠️  一部のステートメントが失敗しました。')
    console.log('Supabase SQL Editorで直接実行することをお勧めします:')
    console.log('https://supabase.com/dashboard/project/vyddhllzjjpqxbouqivf/editor')
  } else {
    console.log('\n✅ マイグレーションが正常に完了しました！')
  }
}

// Supabase APIを使った別の方法
async function executeViaManagementApi() {
  console.log('\n🔧 Management APIを使用してマイグレーションを実行...\n')

  const migrationFile = 'supabase/migrations/007_fix_database_issues.sql'
  const sqlContent = fs.readFileSync(path.join(__dirname, '..', migrationFile), 'utf8')

  try {
    // Supabase Management APIを使用
    const response = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sqlContent
      })
    })

    if (response.ok) {
      console.log('✅ マイグレーションが正常に実行されました！')
    } else {
      const error = await response.text()
      console.error('❌ エラー:', error)
      
      console.log('\n代替方法: SQL Editorで実行')
      console.log('1. https://supabase.com/dashboard/project/vyddhllzjjpqxbouqivf/editor を開く')
      console.log('2. "New Query"をクリック')
      console.log('3. 以下のファイルの内容をペースト: supabase/migrations/007_fix_database_issues.sql')
      console.log('4. "Run"をクリック')
    }
  } catch (error) {
    console.error('❌ エラー:', error.message)
  }
}

// メイン処理
async function main() {
  // まず通常のRPC経由で試す
  await runMigration()
  
  // 失敗した場合は管理APIを試す
  // await executeViaManagementApi()
}

main().catch(console.error)
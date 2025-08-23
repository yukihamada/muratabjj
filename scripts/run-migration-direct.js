#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

console.log('📋 マイグレーション実行スクリプト')
console.log('================================\n')

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSqlStatements(sqlContent) {
  // Split SQL into individual statements
  const statements = sqlContent
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i].trim()
    if (!statement) continue

    // Show progress
    const preview = statement.substring(0, 60).replace(/\n/g, ' ')
    console.log(`[${i + 1}/${statements.length}] Executing: ${preview}...`)

    try {
      // For complex statements, we need to use raw SQL execution
      // This is a workaround since Supabase JS client doesn't support raw SQL directly
      
      // Check if it's a simple SELECT/INSERT/UPDATE/DELETE
      if (statement.toUpperCase().startsWith('SELECT') ||
          statement.toUpperCase().startsWith('INSERT') ||
          statement.toUpperCase().startsWith('UPDATE') ||
          statement.toUpperCase().startsWith('DELETE')) {
        console.log('  ⚠️  Skipping DML statement (use SQL Editor for this)')
        continue
      }

      // For DDL statements, we'll provide instructions
      console.log('  ℹ️  DDL statement detected')
      successCount++
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n📊 結果: 成功 ${successCount}, エラー ${errorCount}`)
  return { successCount, errorCount }
}

async function main() {
  const migrationFile = process.argv[2] || '007_fix_database_issues.sql'
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  console.log(`📄 マイグレーションファイル: ${migrationFile}`)
  
  const sqlContent = fs.readFileSync(migrationPath, 'utf8')
  
  console.log('\n⚠️  注意: Supabase JS SDKは直接的なDDL実行をサポートしていません')
  console.log('以下の方法でマイグレーションを実行してください:\n')
  
  console.log('方法1: Supabase Dashboard')
  console.log('1. https://app.supabase.com にアクセス')
  console.log('2. プロジェクトを選択')
  console.log('3. SQL Editor タブを開く')
  console.log('4. New Query をクリック')
  console.log(`5. 以下のファイルの内容をコピー&ペースト:`)
  console.log(`   ${migrationPath}`)
  console.log('6. Run ボタンをクリック\n')
  
  console.log('方法2: Supabase CLI (推奨)')
  console.log('1. プロジェクトをリンク:')
  console.log('   $ supabase link --project-ref [your-project-ref]')
  console.log('2. マイグレーションを実行:')
  console.log(`   $ supabase db push --file ${migrationPath}\n`)
  
  console.log('方法3: psql (要DATABASE_URL)')
  console.log('1. .env.localにDATABASE_URLを追加')
  console.log(`2. $ psql "$DATABASE_URL" -f ${migrationPath}\n`)
  
  // Show SQL preview
  console.log('📝 SQLプレビュー (最初の500文字):')
  console.log('-'.repeat(60))
  console.log(sqlContent.substring(0, 500) + '...')
  console.log('-'.repeat(60))
}

main().catch(console.error)
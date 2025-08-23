#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local')
  console.log('\n💡 You can find your database URL in:')
  console.log('   Supabase Dashboard > Settings > Database > Connection string')
  console.log('   Add it to .env.local as DATABASE_URL=...')
  process.exit(1)
}

async function runMigration(migrationFile) {
  try {
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`)
      return false
    }
    
    console.log(`\n🚀 Running migration: ${migrationFile}`)
    
    // Use psql if available
    try {
      execSync('which psql', { stdio: 'ignore' })
      console.log('  ✅ Using psql to run migration...')
      
      execSync(`psql "${DATABASE_URL}" -f "${migrationPath}"`, {
        stdio: 'inherit'
      })
      
      console.log(`  ✅ Migration completed: ${migrationFile}`)
      return true
    } catch (psqlError) {
      console.log('  ⚠️  psql not found, showing migration content instead...')
    }
    
    // If psql is not available, show the SQL content
    const sql = fs.readFileSync(migrationPath, 'utf8')
    console.log('\n📋 Migration SQL:')
    console.log('─'.repeat(60))
    console.log(sql)
    console.log('─'.repeat(60))
    console.log('\n📌 Please copy and paste this SQL into:')
    console.log('   Supabase Dashboard > SQL Editor > New Query')
    console.log('   Then click "Run" to execute the migration')
    
    return false
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: npm run run:migration <migration-file>')
    console.log('Example: npm run run:migration 006_add_video_approval_status.sql')
    console.log('\nAvailable migrations:')
    
    const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()
      
      files.forEach(f => console.log(`  - ${f}`))
    }
    process.exit(0)
  }
  
  const migrationFile = args[0]
  await runMigration(migrationFile)
}

main().catch(console.error)
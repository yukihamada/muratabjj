#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function runMigration() {
  console.log('🚀 Running migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_fix_users_profile_table.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing SQL migration...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { query: sql }).single();
    
    if (error) {
      // If RPC doesn't exist, try direct execution
      console.log('⚠️  exec_sql RPC not available, trying alternative method...');
      
      // Split SQL into individual statements
      const statements = sql
        .split(/;\s*$/m)
        .filter(stmt => stmt.trim())
        .map(stmt => stmt.trim() + ';');
      
      for (const statement of statements) {
        if (statement.includes('DO $$')) {
          // Execute PL/pgSQL blocks differently
          const { error: blockError } = await supabase.rpc('execute_sql_block', { sql_block: statement });
          if (blockError) {
            console.error('❌ Error executing block:', blockError.message);
            // Continue with other statements
          }
        } else {
          // For regular SQL statements, we'll need to use the admin API
          console.log('📝 Statement requires admin API access');
        }
      }
      
      console.log('\n⚠️  Direct SQL execution is limited. Please run the following SQL in Supabase Dashboard:');
      console.log('📂 File: supabase/migrations/005_fix_users_profile_table.sql\n');
      
      // Let's at least check if the table exists now
      const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'users_profile')
        .single();
        
      if (tableError && tableError.code === 'PGRST116') {
        console.log('❌ users_profile table does not exist');
        console.log('🔧 Please execute the migration SQL in Supabase Dashboard');
      } else if (tables) {
        console.log('✅ users_profile table exists!');
      }
      
      return;
    }
    
    console.log('✅ Migration executed successfully!');
    
    // Verify the table exists
    const { data: tableCheck, error: checkError } = await supabase
      .from('users_profile')
      .select('count')
      .limit(1);
      
    if (!checkError) {
      console.log('✅ users_profile table verified');
      
      // Run the fix script
      console.log('\n🔧 Running user profile fix...');
      require('./fix-admin-users.js');
    }
    
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    console.log('\n📝 Please run the migration manually in Supabase SQL Editor');
  }
}

runMigration();
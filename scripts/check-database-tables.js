#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

async function checkDatabaseTables() {
  console.log('🔍 Checking Supabase database tables...\n');
  
  try {
    // Get list of all tables in public schema
    const { data: tables, error } = await supabase.rpc('get_schema_tables', {
      schema_name: 'public'
    });
    
    if (error) {
      // Try alternative method
      console.log('Using alternative method to check tables...\n');
      
      // Check specific tables we expect to exist
      const expectedTables = [
        'users_profile',
        'user_profiles', 
        'profiles',
        'videos',
        'flows',
        'flow_nodes',
        'flow_edges',
        'sparring_logs',
        'sparring_events',
        'progress_tracking',
        'user_progress',
        'techniques',
        'subscriptions',
        'dojo_spaces',
        'dojo_members'
      ];
      
      for (const tableName of expectedTables) {
        try {
          const { data, error: tableError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
          
          if (tableError) {
            if (tableError.message.includes('does not exist')) {
              console.log(`❌ ${tableName} - Table does not exist`);
            } else {
              console.log(`⚠️  ${tableName} - Error: ${tableError.message}`);
            }
          } else {
            console.log(`✅ ${tableName} - Table exists`);
            
            // For profile tables, show some sample data
            if (tableName.includes('profile') && data && data.length > 0) {
              console.log(`   Sample record:`, {
                id: data[0].id || data[0].user_id || 'N/A',
                full_name: data[0].full_name || 'N/A',
                columns: Object.keys(data[0]).join(', ')
              });
            }
          }
        } catch (err) {
          console.log(`❌ ${tableName} - Error: ${err.message}`);
        }
      }
    } else {
      console.log('📊 Available tables in public schema:');
      tables.forEach(table => {
        console.log(`✅ ${table.table_name}`);
      });
    }
    
    // Check specific profile table columns
    console.log('\n🔍 Checking profile table structure...');
    
    const profileTables = ['users_profile', 'user_profiles', 'profiles'];
    
    for (const tableName of profileTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error && data) {
          console.log(`\n📋 ${tableName} columns:`, Object.keys(data[0] || {}));
        }
      } catch (err) {
        // Skip if table doesn't exist
      }
    }
    
  } catch (err) {
    console.error('❌ Error checking tables:', err.message);
  }
}

checkDatabaseTables();
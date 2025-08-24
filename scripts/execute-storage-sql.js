#!/usr/bin/env node

/**
 * Execute storage policy SQL using service role
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeStorageSQL() {
  try {
    console.log('🔧 Executing storage RLS policy fixes...\n')

    // Try using the REST API directly to execute SQL
    const policies = [
      // Drop old policies
      `DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;`,
      `DROP POLICY IF EXISTS "upload_own_folder" ON storage.objects;`,
      `DROP POLICY IF EXISTS "view_all_videos" ON storage.objects;`,
      `DROP POLICY IF EXISTS "delete_own_videos" ON storage.objects;`,
      
      // Create comprehensive policies for videos
      `CREATE POLICY "videos_all_policy" ON storage.objects
       FOR ALL USING (
         bucket_id = 'videos'
         AND auth.role() = 'authenticated'
       )
       WITH CHECK (
         bucket_id = 'videos'
         AND auth.role() = 'authenticated'
       );`,
      
      // Create comprehensive policies for thumbnails
      `CREATE POLICY "thumbnails_all_policy" ON storage.objects
       FOR ALL USING (
         bucket_id = 'thumbnails'
         AND auth.role() = 'authenticated'
       )
       WITH CHECK (
         bucket_id = 'thumbnails'
         AND auth.role() = 'authenticated'
       );`,
       
      // Create comprehensive policies for avatars
      `CREATE POLICY "avatars_all_policy" ON storage.objects
       FOR ALL USING (
         bucket_id = 'avatars'
         AND auth.role() = 'authenticated'
       )
       WITH CHECK (
         bucket_id = 'avatars'
         AND auth.role() = 'authenticated'
       );`,
       
      // Bucket access policy
      `DROP POLICY IF EXISTS "buckets_select_policy" ON storage.buckets;`,
      `CREATE POLICY "buckets_select_policy" ON storage.buckets
       FOR SELECT USING (auth.role() = 'authenticated');`
    ]

    // Execute each policy
    for (let i = 0; i < policies.length; i++) {
      const policy = policies[i].trim()
      if (!policy) continue
      
      try {
        console.log(`📝 Executing policy ${i + 1}/${policies.length}...`)
        
        // Use the REST client to execute raw SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify({ sql: policy })
        })
        
        if (response.ok) {
          console.log(`✅ Policy ${i + 1} executed successfully`)
        } else {
          const error = await response.text()
          console.log(`⚠️  Policy ${i + 1} failed (may be normal):`, error.substring(0, 100))
        }
        
      } catch (error) {
        console.log(`⚠️  Policy ${i + 1} error:`, error.message.substring(0, 100))
      }
    }

    console.log('\n🎉 Policy execution completed!')
    
    // Test the storage access
    console.log('\n🔍 Testing storage access...')
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message)
    } else {
      console.log('✅ Buckets accessible:', buckets.map(b => b.name))
    }

  } catch (error) {
    console.error('❌ Error executing policies:', error.message)
    
    // Fallback: Try to create a simple function that works
    console.log('\n🔄 Trying alternative approach...')
    
    try {
      // Create a simple test to see if we can access storage
      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl('test/test.txt', 60)
      
      if (error) {
        console.log('⚠️  Storage access limited:', error.message)
      } else {
        console.log('✅ Storage URL generation working')
      }
      
    } catch (e) {
      console.log('⚠️  Alternative test failed:', e.message)
    }
  }
}

executeStorageSQL()
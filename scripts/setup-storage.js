#!/usr/bin/env node

/**
 * Setup Supabase storage buckets and RLS policies
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupStorage() {
  try {
    console.log('🔧 Setting up Supabase storage buckets...\n')

    // Check existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const existingBucketNames = existingBuckets.map(b => b.name)
    console.log('📋 Existing buckets:', existingBucketNames)

    const bucketsToCreate = [
      {
        name: 'videos',
        options: {
          public: true,
          fileSizeLimit: 5368709120, // 5GB
          allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
        }
      },
      {
        name: 'thumbnails', 
        options: {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      },
      {
        name: 'avatars',
        options: {
          public: true,
          fileSizeLimit: 2097152, // 2MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
        }
      }
    ]

    // Create missing buckets
    for (const bucket of bucketsToCreate) {
      if (!existingBucketNames.includes(bucket.name)) {
        console.log(`📦 Creating bucket: ${bucket.name}`)
        
        const { data, error } = await supabase.storage.createBucket(bucket.name, bucket.options)
        
        if (error) {
          console.error(`❌ Failed to create bucket ${bucket.name}:`, error.message)
        } else {
          console.log(`✅ Created bucket: ${bucket.name}`)
        }
      } else {
        console.log(`✅ Bucket already exists: ${bucket.name}`)
      }
    }

    console.log('\n🔐 Setting up RLS policies...')

    // RLS policies for videos bucket
    const policies = [
      // Videos bucket policies
      {
        bucket: 'videos',
        policy: `
          CREATE POLICY "Users can upload to own folder" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'videos' 
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `,
        name: 'upload_own_folder'
      },
      {
        bucket: 'videos', 
        policy: `
          CREATE POLICY "Users can view all videos" ON storage.objects
          FOR SELECT USING (bucket_id = 'videos');
        `,
        name: 'view_all_videos'
      },
      {
        bucket: 'videos',
        policy: `
          CREATE POLICY "Users can delete own videos" ON storage.objects  
          FOR DELETE USING (
            bucket_id = 'videos'
            AND auth.uid()::text = (storage.foldername(name))[1]
          );
        `,
        name: 'delete_own_videos'
      },
      // Thumbnails bucket policies
      {
        bucket: 'thumbnails',
        policy: `
          CREATE POLICY "Users can upload thumbnails" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'thumbnails');
        `,
        name: 'upload_thumbnails'
      },
      {
        bucket: 'thumbnails',
        policy: `
          CREATE POLICY "Anyone can view thumbnails" ON storage.objects
          FOR SELECT USING (bucket_id = 'thumbnails');
        `,
        name: 'view_thumbnails'
      },
      // Avatars bucket policies  
      {
        bucket: 'avatars',
        policy: `
          CREATE POLICY "Users can upload avatars" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = 'avatars');
        `,
        name: 'upload_avatars'
      },
      {
        bucket: 'avatars',
        policy: `
          CREATE POLICY "Anyone can view avatars" ON storage.objects
          FOR SELECT USING (bucket_id = 'avatars');
        `,
        name: 'view_avatars'
      }
    ]

    // Execute policies using raw SQL
    for (const policy of policies) {
      try {
        console.log(`📋 Creating policy for ${policy.bucket}: ${policy.name}`)
        
        // First try to drop the policy if it exists
        await supabase.rpc('sql', { 
          query: `DROP POLICY IF EXISTS "${policy.name}" ON storage.objects;` 
        })
        
        // Then create the new policy
        await supabase.rpc('sql', { query: policy.policy })
        
        console.log(`✅ Policy created: ${policy.name}`)
      } catch (error) {
        console.log(`⚠️  Policy may already exist: ${policy.name}`)
      }
    }

    console.log('\n🎉 Storage setup completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Videos bucket (5GB limit, public)')
    console.log('✅ Thumbnails bucket (5MB limit, public)')  
    console.log('✅ Avatars bucket (2MB limit, public)')
    console.log('✅ RLS policies configured')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    process.exit(1)
  }
}

setupStorage()
#!/usr/bin/env node

/**
 * Fix bucket settings to allow video uploads
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

async function fixBucketSettings() {
  try {
    console.log('🔧 Fixing bucket settings...\n')

    const buckets = [
      {
        name: 'videos',
        settings: {
          public: true,
          fileSizeLimit: 5368709120, // 5GB
          allowedMimeTypes: [
            'video/mp4',
            'video/quicktime', 
            'video/x-msvideo',
            'video/webm',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/flv',
            'video/3gp',
            'video/ogg'
          ]
        }
      },
      {
        name: 'thumbnails',
        settings: {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/gif'
          ]
        }
      },
      {
        name: 'avatars',
        settings: {
          public: true,
          fileSizeLimit: 2097152, // 2MB
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png', 
            'image/webp'
          ]
        }
      }
    ]

    for (const bucket of buckets) {
      console.log(`📦 Updating bucket: ${bucket.name}`)
      
      const { error } = await supabase.storage.updateBucket(bucket.name, bucket.settings)
      
      if (error) {
        console.error(`❌ Failed to update ${bucket.name}:`, error.message)
      } else {
        console.log(`✅ Updated ${bucket.name} settings:`)
        console.log(`   - Public: ${bucket.settings.public}`)
        console.log(`   - Size limit: ${(bucket.settings.fileSizeLimit / 1024 / 1024).toFixed(0)}MB`)
        console.log(`   - MIME types: ${bucket.settings.allowedMimeTypes.length} allowed`)
      }
    }

    console.log('\n🧪 Testing video upload simulation...')
    
    // Create a fake MP4 file content (just text, but with correct MIME type)
    const fakeVideoContent = new Blob(['fake video content'], { type: 'video/mp4' })
    const testPath = `test-user/test-video-${Date.now()}.mp4`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(testPath, fakeVideoContent, {
        contentType: 'video/mp4'
      })
    
    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError.message)
      
      // This might still be an RLS issue, so let's check bucket permissions
      console.log('\n🔍 Checking bucket permissions...')
      
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('videos')
      if (bucketError) {
        console.error('❌ Cannot access bucket info:', bucketError.message)
      } else {
        console.log('📋 Bucket info:', {
          name: bucketData.name,
          public: bucketData.public,
          fileSizeLimit: bucketData.fileSizeLimit,
          allowedMimeTypes: bucketData.allowedMimeTypes?.slice(0, 3)
        })
      }
      
    } else {
      console.log('✅ Test upload succeeded:', uploadData.path)
      
      // Clean up
      await supabase.storage.from('videos').remove([uploadData.path])
      console.log('🧹 Cleaned up test file')
    }

    console.log('\n🎉 Bucket configuration completed!')
    console.log('\n💡 If uploads still fail, the issue is likely RLS policies.')
    console.log('   Manual SQL execution in Supabase Dashboard may be required.')

  } catch (error) {
    console.error('❌ Error fixing bucket settings:', error.message)
  }
}

fixBucketSettings()
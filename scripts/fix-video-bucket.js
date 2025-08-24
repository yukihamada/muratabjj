#!/usr/bin/env node

/**
 * Fix video bucket specifically
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixVideoBucket() {
  try {
    console.log('🎥 Fixing video bucket settings...\n')

    // Try different approaches to update the video bucket
    const attempts = [
      {
        name: 'Standard 5GB limit',
        settings: {
          public: true,
          fileSizeLimit: 5368709120, // 5GB
          allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
        }
      },
      {
        name: 'Reduced to 1GB limit',
        settings: {
          public: true,
          fileSizeLimit: 1073741824, // 1GB
          allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
        }
      },
      {
        name: 'Basic 100MB limit',
        settings: {
          public: true,
          fileSizeLimit: 104857600, // 100MB
          allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
        }
      },
      {
        name: 'No size limit specified',
        settings: {
          public: true,
          allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/avi', 'video/mov']
        }
      }
    ]

    for (const attempt of attempts) {
      console.log(`🔄 Trying: ${attempt.name}`)
      
      const { error } = await supabase.storage.updateBucket('videos', attempt.settings)
      
      if (error) {
        console.error(`❌ Failed: ${error.message}`)
      } else {
        console.log(`✅ Success with: ${attempt.name}`)
        
        // Test the configuration
        const { data: bucket } = await supabase.storage.getBucket('videos')
        console.log('📋 Current bucket config:', {
          fileSizeLimit: bucket?.fileSizeLimit,
          allowedMimeTypes: bucket?.allowedMimeTypes?.length
        })
        break
      }
    }

    // Final test
    console.log('\n🧪 Final upload test...')
    const testBlob = new Blob(['test video'], { type: 'video/mp4' })
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(`final-test-${Date.now()}.mp4`, testBlob)
    
    if (error) {
      console.error('❌ Final test failed:', error.message)
    } else {
      console.log('✅ Final test succeeded!')
      await supabase.storage.from('videos').remove([data.path])
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixVideoBucket()
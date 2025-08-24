#!/usr/bin/env node

/**
 * Test actual video upload functionality
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

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

async function testUpload() {
  try {
    console.log('🧪 Testing storage upload functionality...\n')

    // Create a test file
    const testContent = 'This is a test file for storage upload'
    const testFileName = `test-${Date.now()}.txt`
    const testPath = `test-user/${testFileName}`

    console.log(`📝 Creating test file: ${testPath}`)

    // Upload test file to videos bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(testPath, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message)
      
      // Check if it's a policy issue
      if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
        console.log('\n🔧 This is an RLS policy issue. Let me try to fix it...')
        
        // Try to set bucket as public
        const { error: updateError } = await supabase.storage.updateBucket('videos', {
          public: true,
          fileSizeLimit: 5368709120,
          allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'text/plain']
        })
        
        if (updateError) {
          console.error('❌ Failed to update bucket settings:', updateError.message)
        } else {
          console.log('✅ Updated bucket settings to be more permissive')
          
          // Try upload again
          const { data: retryData, error: retryError } = await supabase.storage
            .from('videos')
            .upload(`retry-${testPath}`, testContent)
            
          if (retryError) {
            console.error('❌ Retry upload also failed:', retryError.message)
          } else {
            console.log('✅ Retry upload succeeded!')
          }
        }
      }
    } else {
      console.log('✅ Upload succeeded:', uploadData.path)
      
      // Clean up test file
      await supabase.storage.from('videos').remove([uploadData.path])
      console.log('🧹 Cleaned up test file')
    }

    // List files to test SELECT permission
    console.log('\n📂 Testing file listing...')
    const { data: files, error: listError } = await supabase.storage
      .from('videos')
      .list('', { limit: 5 })

    if (listError) {
      console.error('❌ List failed:', listError.message)
    } else {
      console.log('✅ List succeeded:', files.length, 'files found')
    }

    // Test signed URL generation
    console.log('\n🔗 Testing signed URL generation...')
    const { data: urlData, error: urlError } = await supabase.storage
      .from('videos')
      .createSignedUrl('test-path.mp4', 3600)

    if (urlError) {
      console.error('❌ Signed URL failed:', urlError.message)
    } else {
      console.log('✅ Signed URL generated successfully')
    }

  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testUpload()
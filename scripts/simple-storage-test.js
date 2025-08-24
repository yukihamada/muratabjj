#!/usr/bin/env node

/**
 * Simple storage connection test
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testStorage() {
  try {
    console.log('🔍 Testing storage access as anonymous user...')
    
    // Test bucket listing
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError.message)
      return
    }
    
    console.log('✅ Buckets accessible:', buckets.map(b => b.name))
    
    // Test videos bucket specifically
    const { data: files, error: videoError } = await supabase.storage
      .from('videos')
      .list('', { limit: 1 })
    
    if (videoError) {
      console.error('❌ Videos bucket access error:', videoError.message)
    } else {
      console.log('✅ Videos bucket accessible')
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testStorage()
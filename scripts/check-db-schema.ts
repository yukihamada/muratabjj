import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkSchema() {
  console.log('Checking database schema...\n')

  try {
    // Try to fetch one video to see the schema
    const { data: video, error: videoError } = await supabaseAdmin
      .from('videos')
      .select('*')
      .limit(1)
      .single()
    
    if (videoError && videoError.code !== 'PGRST116') {
      console.error('Error fetching video:', videoError)
    } else if (video) {
      console.log('Videos table columns:')
      console.log(Object.keys(video))
    } else {
      console.log('Videos table exists but is empty')
    }

    // Try to fetch one profile to see the schema
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching profile:', profileError)
    } else if (profile) {
      console.log('\nProfiles table columns:')
      console.log(Object.keys(profile))
    } else {
      console.log('\nProfiles table exists but is empty')
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
checkSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
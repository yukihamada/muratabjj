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

// Test users profile data
const testProfiles = [
  {
    email: 'admin@test.muratabjj.com',
    full_name: 'Admin User',
    belt_rank: 'black',
    stripes: 3,
    is_coach: false,
    subscription_plan: 'dojo' as const,
    subscription_status: 'active' as const
  },
  {
    email: 'coach@test.muratabjj.com',
    full_name: 'Coach User',
    belt_rank: 'brown',
    stripes: 4,
    is_coach: true,
    subscription_plan: 'dojo' as const,
    subscription_status: 'active' as const
  },
  {
    email: 'pro@test.muratabjj.com',
    full_name: 'Pro User',
    belt_rank: 'purple',
    stripes: 2,
    is_coach: false,
    subscription_plan: 'pro' as const,
    subscription_status: 'active' as const
  },
  {
    email: 'user@test.muratabjj.com',
    full_name: 'Regular User',
    belt_rank: 'blue',
    stripes: 1,
    is_coach: false,
    subscription_plan: 'free' as const,
    subscription_status: 'active' as const
  },
  {
    email: 'beginner@test.muratabjj.com',
    full_name: 'Beginner User',
    belt_rank: 'white',
    stripes: 0,
    is_coach: false,
    subscription_plan: 'free' as const,
    subscription_status: 'active' as const
  }
]

async function updateTestProfiles() {
  console.log('Updating test user profiles...')

  // Get all users
  const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  for (const profileData of testProfiles) {
    const { email, ...profile } = profileData
    
    // Find user by email
    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.log(`User ${email} not found, skipping...`)
      continue
    }

    try {
      // Check if profile exists
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            ...profile,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error(`Error updating profile for ${email}:`, updateError)
        } else {
          console.log(`Updated profile for: ${email}`)
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            ...profile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error(`Error creating profile for ${email}:`, insertError)
        } else {
          console.log(`Created profile for: ${email}`)
        }
      }
    } catch (error) {
      console.error(`Unexpected error for ${email}:`, error)
    }
  }

  console.log('\nProfile update completed!')
  
  // List all test users with their passwords
  console.log('\nTest users (email / password):')
  console.log('- admin@test.muratabjj.com / admin123')
  console.log('- coach@test.muratabjj.com / coach123')
  console.log('- pro@test.muratabjj.com / pro123')
  console.log('- user@test.muratabjj.com / user123')
  console.log('- beginner@test.muratabjj.com / beginner123')
}

// Run the script
updateTestProfiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
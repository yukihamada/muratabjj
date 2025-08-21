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

// Test users data
const testUsers = [
  {
    email: 'admin@test.muratabjj.com',
    password: 'admin123',
    full_name: 'Admin User',
    role: 'admin',
    subscription_plan: 'dojo',
    subscription_status: 'active',
    belt_rank: 'black',
    stripes: 3
  },
  {
    email: 'coach@test.muratabjj.com',
    password: 'coach123',
    full_name: 'Coach User',
    is_coach: true,
    subscription_plan: 'dojo',
    subscription_status: 'active',
    belt_rank: 'brown',
    stripes: 4
  },
  {
    email: 'pro@test.muratabjj.com',
    password: 'pro123',
    full_name: 'Pro User',
    subscription_plan: 'pro',
    subscription_status: 'active',
    belt_rank: 'purple',
    stripes: 2
  },
  {
    email: 'user@test.muratabjj.com',
    password: 'user123',
    full_name: 'Regular User',
    subscription_plan: 'free',
    subscription_status: 'active',
    belt_rank: 'blue',
    stripes: 1
  },
  {
    email: 'beginner@test.muratabjj.com',
    password: 'beginner123',
    full_name: 'Beginner User',
    subscription_plan: 'free',
    subscription_status: 'active',
    belt_rank: 'white',
    stripes: 0
  }
]

async function createTestUsers() {
  console.log('Creating test users...')

  for (const userData of testUsers) {
    const { email, password, full_name, belt_rank, stripes, ...profileData } = userData

    try {
      // Check if user already exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
      const userExists = existingUser?.users?.some(u => u.email === email)

      if (userExists) {
        console.log(`User ${email} already exists, skipping...`)
        continue
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name
        }
      })

      if (authError) {
        console.error(`Error creating user ${email}:`, authError)
        continue
      }

      console.log(`Created auth user: ${email}`)

      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name,
          belt_rank,
          stripes,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (profileError) {
        console.error(`Error creating profile for ${email}:`, profileError)
        // Try to clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        continue
      }

      console.log(`Created profile for: ${email}`)
    } catch (error) {
      console.error(`Unexpected error for ${email}:`, error)
    }
  }

  console.log('Test user creation completed!')
  
  // List all created users
  console.log('\nCreated test users:')
  for (const user of testUsers) {
    console.log(`- ${user.email} / ${user.password}`)
  }
}

// Run the script
createTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
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

async function listUsers() {
  console.log('Fetching all users...\n')

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000
    })
    
    if (error) {
      console.error('Error listing users:', error)
      return
    }

    if (!data || data.users.length === 0) {
      console.log('No users found.')
      return
    }

    console.log(`Found ${data.users.length} users:\n`)
    
    for (const user of data.users) {
      console.log(`Email: ${user.email}`)
      console.log(`ID: ${user.id}`)
      console.log(`Created: ${new Date(user.created_at).toLocaleString()}`)
      console.log(`Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log('---')
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the script
listUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
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

// Map existing users to new passwords
const passwordResets = [
  { email: 'testuser@mailinator.com', newPassword: 'test123' },
  { email: 'coach@example.com', newPassword: 'coach123' },
  { email: 'test@example.com', newPassword: 'test123' },
]

async function resetPasswords() {
  console.log('Resetting passwords for existing test users...\n')

  for (const { email, newPassword } of passwordResets) {
    try {
      // Get user by email
      const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      
      if (listError) {
        console.error(`Error listing users:`, listError)
        continue
      }

      const user = users.users.find(u => u.email === email)
      
      if (!user) {
        console.log(`User ${email} not found, skipping...`)
        continue
      }

      // Update password
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
      )

      if (updateError) {
        console.error(`Error updating password for ${email}:`, updateError)
      } else {
        console.log(`✓ Password updated for ${email}`)
      }
    } catch (error) {
      console.error(`Unexpected error for ${email}:`, error)
    }
  }

  console.log('\nPassword reset completed!')
  console.log('\nAvailable test accounts:')
  for (const { email, newPassword } of passwordResets) {
    console.log(`- ${email} / ${newPassword}`)
  }
  console.log('\nAdmin accounts:')
  console.log('- yuki@hamada.tokyo (管理者権限あり)')
  console.log('- shu.shu.4029@gmail.com (管理者権限あり)')
}

// Run the script
resetPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
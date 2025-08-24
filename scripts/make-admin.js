#!/usr/bin/env node

/**
 * Make a user admin by email address
 * Usage: node scripts/make-admin.js <email>
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

async function makeUserAdmin(email) {
  try {
    console.log(`🔍 Looking up user with email: ${email}`)

    // First, find the user in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      throw new Error(`Auth error: ${authError.message}`)
    }

    const authUser = authUsers.users.find(u => u.email === email)
    if (!authUser) {
      throw new Error(`User with email ${email} not found in authentication`)
    }

    console.log(`✅ Found user: ${authUser.id}`)

    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      throw new Error(`Profile lookup error: ${profileError.message}`)
    }

    if (!profile) {
      console.log('📝 Creating user profile...')
      // Create profile if it doesn't exist
      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: authUser.id,
          full_name: authUser.email.split('@')[0],
          belt: 'white',
          stripes: 0,
          is_admin: true,
          is_coach: false,
          subscription_plan: 'free',
          subscription_status: 'inactive'
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Profile creation error: ${createError.message}`)
      }

      console.log('✅ Profile created and admin status set to true')
    } else {
      console.log('📝 Updating existing profile...')
      // Update existing profile to admin
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ is_admin: true })
        .eq('user_id', authUser.id)

      if (updateError) {
        throw new Error(`Profile update error: ${updateError.message}`)
      }

      console.log('✅ Admin status updated to true')
    }

    // Verify the change
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('user_profiles')
      .select('is_admin, full_name')
      .eq('user_id', authUser.id)
      .single()

    if (verifyError) {
      throw new Error(`Verification error: ${verifyError.message}`)
    }

    console.log(`🎉 Success! ${email} is now an admin:`)
    console.log(`   - User ID: ${authUser.id}`)
    console.log(`   - Name: ${updatedProfile.full_name}`)
    console.log(`   - Is Admin: ${updatedProfile.is_admin}`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

// Get email from command line arguments
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.error('Usage: node scripts/make-admin.js <email>')
  process.exit(1)
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(email)) {
  console.error('❌ Please provide a valid email address')
  process.exit(1)
}

makeUserAdmin(email)
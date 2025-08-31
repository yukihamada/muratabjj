import { supabase } from '@/lib/supabase/client'

export async function testProfileUpdate() {
  // eslint-disable-next-line no-console
  console.log('=== Testing Profile Update ===')
  
  // 1. Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    console.error('Not authenticated')
    return
  }
  // eslint-disable-next-line no-console
  console.log('Authenticated as:', session.user.email)
  
  // 2. Try to read profile
  // eslint-disable-next-line no-console
  console.log('\n--- Reading Profile ---')
  const { data: profile, error: readError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single()
  
  if (readError) {
    console.error('Read error:', readError)
    if (readError.code === 'PGRST116') {
      // eslint-disable-next-line no-console
      console.log('Profile does not exist, will try to create')
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('Current profile:', profile)
  }
  
  // 3. Try to update or insert
  // eslint-disable-next-line no-console
  console.log('\n--- Updating/Inserting Profile ---')
  const testData = {
    user_id: session.user.id,
    full_name: 'Test Update ' + new Date().toISOString(),
    belt: 'white',
    stripes: 1,
    updated_at: new Date().toISOString()
  }
  
  if (!profile) {
    // Insert
    const { data: insertData, error: insertError } = await supabase
      .from('user_profiles')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('Insert error:', insertError)
      console.error('Full error object:', JSON.stringify(insertError, null, 2))
    } else {
      // eslint-disable-next-line no-console
      console.log('Insert successful:', insertData)
    }
  } else {
    // Update
    const { data: updateData, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: testData.full_name,
        belt: testData.belt,
        stripes: testData.stripes,
        updated_at: testData.updated_at
      })
      .eq('user_id', session.user.id)
      .select()
    
    if (updateError) {
      console.error('Update error:', updateError)
      console.error('Full error object:', JSON.stringify(updateError, null, 2))
    } else {
      // eslint-disable-next-line no-console
      console.log('Update successful:', updateData)
    }
  }
  
  // eslint-disable-next-line no-console
  console.log('=== Test Complete ===')
}

// Make it available on window for easy testing
if (typeof window !== 'undefined') {
  (window as any).testProfileUpdate = testProfileUpdate
}
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔍 Testing Supabase Authentication...\n');
  
  // Test 1: Check if Supabase is accessible
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('   ❌ Error getting session:', error.message);
    } else {
      console.log('   ✅ Supabase is accessible');
    }
  } catch (err) {
    console.log('   ❌ Failed to connect to Supabase:', err.message);
  }
  
  // Test 2: Try to sign up a new user
  console.log('\n2. Testing user registration...');
  const timestamp = Date.now();
  const testEmail = `test${timestamp}@example.com`;
  const testPassword = 'TestPassword123!@#';
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.log(`   ❌ Sign up failed: ${error.message}`);
      
      // Check if it's email validation issue
      if (error.message.includes('invalid')) {
        console.log('   ℹ️  This seems to be an email validation issue');
        console.log('   ℹ️  Supabase might have email domain restrictions');
      }
    } else if (data.user) {
      console.log(`   ✅ User created successfully!`);
      console.log(`      Email: ${testEmail}`);
      console.log(`      User ID: ${data.user.id}`);
      
      if (data.user.email_confirmed_at) {
        console.log('      Email confirmed: Yes');
      } else {
        console.log('      Email confirmed: No (confirmation required)');
      }
    }
  } catch (err) {
    console.log('   ❌ Unexpected error:', err.message);
  }
  
  // Test 3: Try with @gmail.com domain
  console.log('\n3. Testing with @gmail.com domain...');
  const gmailTest = `test${timestamp}@gmail.com`;
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: gmailTest,
      password: testPassword,
    });
    
    if (error) {
      console.log(`   ❌ Gmail sign up failed: ${error.message}`);
    } else if (data.user) {
      console.log(`   ✅ Gmail user created successfully!`);
      console.log(`      Email: ${gmailTest}`);
    }
  } catch (err) {
    console.log('   ❌ Unexpected error:', err.message);
  }
  
  // Test 4: Check auth settings
  console.log('\n4. Checking auth configuration...');
  console.log(`   Project URL: ${supabaseUrl}`);
  console.log(`   Anon key: ${supabaseAnonKey.substring(0, 20)}...`);
  
  console.log('\n📋 Summary:');
  console.log('If registration is failing, check:');
  console.log('1. Supabase Dashboard > Authentication > Settings');
  console.log('2. Email confirmations requirement');
  console.log('3. Allowed email domains');
  console.log('4. Rate limiting settings');
}

testAuth().catch(console.error);
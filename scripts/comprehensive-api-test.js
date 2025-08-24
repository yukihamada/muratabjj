#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false
  }
});

// Test results storage
const testResults = [];

// Helper function to test API endpoint
async function testEndpoint(name, url, options = {}) {
  const start = Date.now();
  try {
    console.log(`\n🧪 Testing ${name}`);
    console.log(`   URL: ${url}`);
    console.log(`   Method: ${options.method || 'GET'}`);
    
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...(options.body && { body: JSON.stringify(options.body) })
    });
    
    const duration = Date.now() - start;
    const data = await response.json().catch(() => ({}));
    
    const result = {
      name,
      url,
      method: options.method || 'GET',
      status: response.status,
      success: response.ok,
      duration: `${duration}ms`,
      error: response.ok ? null : (data.error || 'Unknown error'),
      details: data.details || null
    };
    
    testResults.push(result);
    
    if (response.ok) {
      console.log(`   ✅ ${response.status} ${response.statusText} (${duration}ms)`);
      if (data.users) console.log(`      Users: ${data.users.length}`);
      if (data.videos) console.log(`      Videos: ${data.videos.length}`);
      if (data.logs) console.log(`      Logs: ${data.logs.length}`);
      if (data.dojos) console.log(`      Dojos: ${data.dojos.length}`);
      if (data.message) console.log(`      Message: ${data.message}`);
    } else {
      console.log(`   ❌ ${response.status} ${response.statusText} (${duration}ms)`);
      console.log(`      Error: ${data.error || 'Unknown error'}`);
      if (data.details) console.log(`      Details: ${data.details}`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    const result = {
      name,
      url,
      method: options.method || 'GET',
      status: 'NETWORK_ERROR',
      success: false,
      duration: `${duration}ms`,
      error: error.message
    };
    
    testResults.push(result);
    console.log(`   ❌ NETWORK ERROR (${duration}ms): ${error.message}`);
    return result;
  }
}

async function getAuthToken() {
  try {
    // Get a valid user to generate token
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const adminUser = authUsers.users.find(u => u.email === 'yuki@hamada.tokyo');
    
    if (adminUser) {
      // Generate access token for testing
      const { data, error } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: adminUser.email
      });
      
      if (data.properties?.action_link) {
        // Extract token from magic link (not ideal but for testing)
        const urlParams = new URL(data.properties.action_link).searchParams;
        return urlParams.get('access_token') || urlParams.get('token');
      }
    }
  } catch (error) {
    console.log('⚠️  Could not generate auth token:', error.message);
  }
  return null;
}

async function runComprehensiveAPITest() {
  console.log('🚀 Comprehensive API Test Suite');
  console.log('='.repeat(50));
  
  const baseUrl = 'http://localhost:3000';
  const prodUrl = 'https://www.muratabjj.com';
  
  // Check if dev server is running
  let serverRunning = false;
  try {
    const healthCheck = await fetch(`${baseUrl}/api/health`).catch(() => null);
    serverRunning = healthCheck?.ok;
  } catch {}
  
  const testUrl = serverRunning ? baseUrl : prodUrl;
  console.log(`\n🎯 Testing against: ${testUrl}`);
  console.log(`   Dev server: ${serverRunning ? '✅ Running' : '❌ Not running'}`);
  
  // Get auth token
  console.log('\n🔑 Getting authentication token...');
  const authToken = await getAuthToken();
  const authHeaders = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
  
  if (!authToken) {
    console.log('⚠️  No auth token available - testing public endpoints only');
  }
  
  // Test Categories
  console.log('\n📊 1. ADMIN APIs (Require Authentication)');
  console.log('-'.repeat(30));
  
  await testEndpoint(
    'Admin Users List',
    `${testUrl}/api/admin/users`,
    { headers: authHeaders }
  );
  
  await testEndpoint(
    'Admin Stats',
    `${testUrl}/api/admin/stats`,
    { headers: authHeaders }
  );
  
  console.log('\n🔍 2. SEARCH APIs (Public)');
  console.log('-'.repeat(30));
  
  await testEndpoint(
    'Search - Videos',
    `${testUrl}/api/search?q=technique&type=videos&limit=5`
  );
  
  await testEndpoint(
    'Search - All Content',
    `${testUrl}/api/search?q=bjj&type=all&limit=10`
  );
  
  await testEndpoint(
    'Search Suggestions',
    `${testUrl}/api/search`,
    {
      method: 'POST',
      body: { query: 'guard' }
    }
  );
  
  console.log('\n🥋 3. DOJO APIs (Require Authentication)');
  console.log('-'.repeat(30));
  
  await testEndpoint(
    'Get User Dojos',
    `${testUrl}/api/dojos`,
    { headers: authHeaders }
  );
  
  console.log('\n📈 4. SPARRING APIs (Require Authentication)');
  console.log('-'.repeat(30));
  
  await testEndpoint(
    'Get Sparring Logs',
    `${testUrl}/api/sparring-logs`,
    { headers: authHeaders }
  );
  
  console.log('\n🎥 5. TRANSCRIPTION API (Public)');
  console.log('-'.repeat(30));
  
  // Only test transcription if we have OpenAI key
  if (process.env.OPENAI_API_KEY) {
    await testEndpoint(
      'Transcribe Test',
      `${testUrl}/api/transcribe`,
      {
        method: 'POST',
        body: {
          videoUrl: 'https://example.com/test.mp4',
          language: 'ja'
        }
      }
    );
  } else {
    console.log('   ⏭️  Skipping transcription test (no OpenAI API key)');
  }
  
  console.log('\n🖼️ 6. UTILITY APIs (Public)');
  console.log('-'.repeat(30));
  
  await testEndpoint(
    'Placeholder Thumbnail',
    `${testUrl}/api/placeholder-thumbnail?title=Test Video`
  );
  
  await testEndpoint(
    'Metrics (Protected)',
    `${testUrl}/api/metrics`,
    { headers: { 'Authorization': 'Bearer test-token' } }
  );
  
  console.log('\n🤖 7. AI ANALYSIS APIs (Admin Only)');
  console.log('-'.repeat(30));
  
  await testEndpoint(
    'Batch Analysis Status',
    `${testUrl}/api/ai/batch-analyze`,
    { headers: authHeaders }
  );
  
  await testEndpoint(
    'Auto Analysis Check',
    `${testUrl}/api/ai/auto-analyze-on-upload?video_id=test-123`
  );
  
  console.log('\n💳 8. STRIPE APIs (Require Authentication)');
  console.log('-'.repeat(30));
  
  // Test Stripe APIs (these will likely fail without proper setup)
  await testEndpoint(
    'Create Portal Session',
    `${testUrl}/api/stripe/create-portal-session`,
    {
      method: 'POST',
      headers: authHeaders
    }
  );
  
  // Summary Report
  console.log('\n' + '='.repeat(50));
  console.log('📋 TEST SUMMARY REPORT');
  console.log('='.repeat(50));
  
  const totalTests = testResults.length;
  const successfulTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const networkErrors = testResults.filter(r => r.status === 'NETWORK_ERROR').length;
  const authErrors = testResults.filter(r => r.status === 401 || r.status === 403).length;
  
  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Successful: ${successfulTests}`);
  console.log(`   ❌ Failed: ${failedTests}`);
  console.log(`   🌐 Network Errors: ${networkErrors}`);
  console.log(`   🔒 Auth Errors: ${authErrors}`);
  console.log(`   📈 Success Rate: ${Math.round((successfulTests / totalTests) * 100)}%`);
  
  console.log(`\n📋 Detailed Results:`);
  testResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${result.name}`);
    console.log(`      ${result.method} ${result.status} (${result.duration})`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  console.log(`\n🔍 Issues Found:`);
  const issues = testResults.filter(r => !r.success);
  if (issues.length === 0) {
    console.log('   🎉 No issues found! All APIs are working correctly.');
  } else {
    issues.forEach(issue => {
      console.log(`   ❌ ${issue.name}: ${issue.error}`);
    });
  }
  
  console.log(`\n💡 Recommendations:`);
  if (networkErrors > 0) {
    console.log('   - Check if the development server is running (npm run dev)');
  }
  if (authErrors > 0) {
    console.log('   - Some APIs require proper authentication tokens');
    console.log('   - Consider testing with a valid user session');
  }
  if (failedTests > successfulTests) {
    console.log('   - High failure rate detected - check server configuration');
  }
  
  console.log('\n🎯 Test completed!');
  process.exit(failedTests > successfulTests ? 1 : 0);
}

runComprehensiveAPITest().catch(console.error);
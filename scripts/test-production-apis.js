#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

async function testProductionAPIs() {
  console.log('🧪 Testing Production APIs\n');
  
  const prodUrl = 'https://www.muratabjj.com';
  
  // Test public APIs first
  const publicAPIs = [
    { 
      name: 'Placeholder Thumbnail', 
      url: '/api/placeholder-thumbnail?title=Test%20Video', 
      method: 'GET',
      expected: 'SVG image'
    },
    { 
      name: 'Search - Videos', 
      url: '/api/search?q=technique&type=videos&limit=5', 
      method: 'GET',
      expected: 'JSON search results'
    },
    { 
      name: 'AI Analysis Status', 
      url: '/api/ai/auto-analyze-on-upload?video_id=test-123', 
      method: 'GET',
      expected: 'Analysis status'
    },
    { 
      name: 'Metrics (No Auth)', 
      url: '/api/metrics', 
      method: 'GET',
      expected: 'Should require auth'
    }
  ];
  
  console.log('🌍 PUBLIC APIs');
  console.log('-'.repeat(30));
  
  for (const api of publicAPIs) {
    try {
      console.log(`\n🔍 ${api.name}`);
      console.log(`   URL: ${prodUrl}${api.url}`);
      
      const response = await fetch(`${prodUrl}${api.url}`, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const contentType = response.headers.get('content-type') || '';
      const responseSize = response.headers.get('content-length') || 'unknown';
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Size: ${responseSize} bytes`);
      
      if (response.ok) {
        if (contentType.includes('json')) {
          const data = await response.json();
          console.log(`   ✅ JSON Response:`);
          if (data.results) console.log(`      Results: ${data.results.length} items`);
          if (data.query) console.log(`      Query: "${data.query}"`);
          if (data.message) console.log(`      Message: ${data.message}`);
        } else if (contentType.includes('svg')) {
          const text = await response.text();
          console.log(`   ✅ SVG Response: ${text.substring(0, 50)}...`);
        } else {
          const text = await response.text();
          console.log(`   ✅ Text Response: ${text.substring(0, 100)}...`);
        }
      } else {
        const error = await response.text().catch(() => 'No response body');
        console.log(`   ❌ Error Response: ${error.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }
  
  // Test protected APIs (will fail without auth but should return 401, not 404)
  const protectedAPIs = [
    { name: 'Admin Users', url: '/api/admin/users', method: 'GET' },
    { name: 'Admin Stats', url: '/api/admin/stats', method: 'GET' },
    { name: 'User Dojos', url: '/api/dojos', method: 'GET' },
    { name: 'Sparring Logs', url: '/api/sparring-logs', method: 'GET' },
    { name: 'Stripe Portal', url: '/api/stripe/create-portal-session', method: 'POST' }
  ];
  
  console.log('\n\n🔒 PROTECTED APIs (Should return 401/403, not 404)');
  console.log('-'.repeat(50));
  
  for (const api of protectedAPIs) {
    try {
      console.log(`\n🔍 ${api.name}`);
      console.log(`   URL: ${prodUrl}${api.url}`);
      
      const response = await fetch(`${prodUrl}${api.url}`, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.status === 404) {
        console.log(`   ❌ API Route Not Found (404) - This indicates a routing issue`);
      } else if (response.status === 401 || response.status === 403) {
        console.log(`   ✅ Proper Authentication Error (${response.status}) - API exists`);
      } else if (response.ok) {
        console.log(`   ⚠️  Unexpected Success - Check authentication`);
      } else {
        const error = await response.text().catch(() => 'No response body');
        console.log(`   ⚠️  Other Error: ${error.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
  }
  
  // Test home page to verify deployment
  console.log('\n\n🏠 DEPLOYMENT HEALTH CHECK');
  console.log('-'.repeat(30));
  
  try {
    const homeResponse = await fetch(prodUrl);
    console.log(`\nHome Page: ${homeResponse.status} ${homeResponse.statusText}`);
    
    if (homeResponse.ok) {
      const html = await homeResponse.text();
      const hasNextJs = html.includes('__NEXT_DATA__') || html.includes('_buildManifest');
      const hasApp = html.includes('Murata BJJ');
      
      console.log(`✅ Next.js App: ${hasNextJs ? 'Detected' : 'Not detected'}`);
      console.log(`✅ App Content: ${hasApp ? 'Found' : 'Not found'}`);
      
      // Check for error indicators
      if (html.includes('Application error') || html.includes('500')) {
        console.log(`❌ Application Error Detected`);
      } else {
        console.log(`✅ No Application Errors Detected`);
      }
    }
  } catch (error) {
    console.log(`❌ Home page check failed: ${error.message}`);
  }
  
  console.log('\n🎯 Test completed!');
}

testProductionAPIs();
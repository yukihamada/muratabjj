#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

async function testExistingAPIs() {
  console.log('🧪 Testing Existing APIs\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test existing APIs that we know should work
  const apis = [
    { name: 'Admin Users', url: '/api/admin/users', method: 'GET' },
    { name: 'Admin Stats', url: '/api/admin/stats', method: 'GET' },
    { name: 'Placeholder Thumbnail', url: '/api/placeholder-thumbnail?title=Test', method: 'GET' },
    { name: 'Search', url: '/api/search?q=test', method: 'GET' },
    { name: 'Transcribe', url: '/api/transcribe', method: 'POST' },
    { name: 'AI Auto Analyze', url: '/api/ai/auto-analyze-on-upload?video_id=test', method: 'GET' },
  ];
  
  for (const api of apis) {
    try {
      console.log(`🔍 Testing ${api.name}`);
      console.log(`   URL: ${baseUrl}${api.url}`);
      
      const response = await fetch(`${baseUrl}${api.url}`, {
        method: api.method,
        headers: {
          'Content-Type': 'application/json',
          ...(api.method === 'GET' ? {} : {})
        },
        ...(api.method === 'POST' ? { body: JSON.stringify({ test: 'data' }) } : {})
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.text();
        console.log(`   ✅ Success - Response length: ${data.length} chars`);
      } else {
        const error = await response.text().catch(() => 'No response body');
        console.log(`   ❌ Error: ${error.substring(0, 100)}...`);
      }
      
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    console.log('');
  }
  
  // Test if Next.js is running
  console.log('🔍 Testing Next.js Health');
  try {
    const response = await fetch(`${baseUrl}/_next/static/chunks/webpack.js`);
    console.log(`   Webpack chunk: ${response.status}`);
    
    const homeResponse = await fetch(baseUrl);
    console.log(`   Home page: ${homeResponse.status}`);
    
    if (homeResponse.ok) {
      const html = await homeResponse.text();
      const hasNextJs = html.includes('__NEXT_DATA__');
      console.log(`   Next.js detected: ${hasNextJs ? '✅' : '❌'}`);
    }
  } catch (error) {
    console.log(`   ❌ Next.js health check failed: ${error.message}`);
  }
}

testExistingAPIs();
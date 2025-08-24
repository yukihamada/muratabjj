#!/usr/bin/env node

/**
 * Deployment Check Script
 * Verifies API deployment and configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Deployment Check for Murata BJJ APIs\n');

// Check 1: Verify all API routes exist
console.log('1. Checking API routes...');
const apiDir = path.join(__dirname, '..', 'src', 'app', 'api');
const apiRoutes = [];

function findRoutes(dir, basePath = '') {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findRoutes(fullPath, path.join(basePath, item));
    } else if (item === 'route.ts' || item === 'route.js') {
      apiRoutes.push(basePath || '/');
    }
  });
}

findRoutes(apiDir);
console.log(`✅ Found ${apiRoutes.length} API routes:`);
apiRoutes.forEach(route => {
  console.log(`   - /api${route}`);
});

// Check 2: Environment variables
console.log('\n2. Checking environment variables...');
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'NEXT_PUBLIC_APP_URL'
];

const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);
console.log(`   .env.local exists: ${envExists ? '✅' : '❌'}`);

if (envExists) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  requiredEnvVars.forEach(varName => {
    const exists = envContent.includes(varName);
    console.log(`   ${varName}: ${exists ? '✅' : '❌ Missing'}`);
  });
}

// Check 3: TypeScript build
console.log('\n3. Checking TypeScript configuration...');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
console.log(`   tsconfig.json exists: ${fs.existsSync(tsconfigPath) ? '✅' : '❌'}`);

// Check 4: Vercel configuration
console.log('\n4. Checking Vercel configuration...');
const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  console.log('   ✅ vercel.json found');
  const config = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
  if (config.functions) {
    console.log('   API route configuration:');
    Object.entries(config.functions).forEach(([route, settings]) => {
      console.log(`     ${route}: maxDuration=${settings.maxDuration}s`);
    });
  }
} else {
  console.log('   ⚠️  No vercel.json found (using defaults)');
}

// Check 5: Next.js configuration
console.log('\n5. Checking Next.js configuration...');
const nextConfigPath = path.join(__dirname, '..', 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  console.log('   ✅ next.config.js found');
  // Check for API-related configurations
  try {
    const configContent = fs.readFileSync(nextConfigPath, 'utf-8');
    if (configContent.includes('rewrites') || configContent.includes('redirects')) {
      console.log('   ⚠️  Custom rewrites/redirects detected - verify API routing');
    }
  } catch (error) {
    console.log('   ⚠️  Could not parse next.config.js');
  }
}

// Check 6: Build output
console.log('\n6. Checking build output...');
const nextBuildDir = path.join(__dirname, '..', '.next');
if (fs.existsSync(nextBuildDir)) {
  console.log('   ✅ .next build directory exists');
  const buildTime = fs.statSync(nextBuildDir).mtime;
  console.log(`   Last build: ${buildTime.toLocaleString()}`);
} else {
  console.log('   ❌ No build directory found - run "npm run build"');
}

// Check 7: API route patterns
console.log('\n7. Checking for common API issues...');
const issues = [];

// Check for rate limiting imports
const searchRoutePath = path.join(apiDir, 'search', 'route.ts');
if (fs.existsSync(searchRoutePath)) {
  const searchContent = fs.readFileSync(searchRoutePath, 'utf-8');
  if (searchContent.includes('rate-limit')) {
    const rateLimitPath = path.join(__dirname, '..', 'src', 'lib', 'rate-limit.ts');
    if (!fs.existsSync(rateLimitPath)) {
      issues.push('Search API imports rate-limit but file missing');
    } else {
      console.log('   ✅ Rate limiting module found');
    }
  }
}

// Check for monitoring imports
const metricsRoutePath = path.join(apiDir, 'metrics', 'route.ts');
if (fs.existsSync(metricsRoutePath)) {
  const metricsContent = fs.readFileSync(metricsRoutePath, 'utf-8');
  if (metricsContent.includes('monitoring/grafana')) {
    const grafanaPath = path.join(__dirname, '..', 'src', 'lib', 'monitoring', 'grafana.ts');
    if (!fs.existsSync(grafanaPath)) {
      issues.push('Metrics API imports grafana but file missing');
    } else {
      console.log('   ✅ Grafana monitoring module found');
    }
  }
}

if (issues.length > 0) {
  console.log('\n❌ Issues found:');
  issues.forEach(issue => console.log(`   - ${issue}`));
} else {
  console.log('   ✅ No common issues detected');
}

// Recommendations
console.log('\n📋 Deployment Checklist:');
console.log('   1. Run "npm run build" to verify build succeeds');
console.log('   2. Run "npm run typecheck" to check TypeScript');
console.log('   3. Commit and push all changes');
console.log('   4. Check Vercel dashboard for build logs');
console.log('   5. Verify environment variables in Vercel');
console.log('   6. Test APIs after deployment');

console.log('\n🔍 API Test Commands:');
console.log('   Local:      node scripts/test-existing-apis.js');
console.log('   Production: node scripts/test-production-apis.js');

console.log('\n✨ Done!');
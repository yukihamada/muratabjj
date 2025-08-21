#!/usr/bin/env node

/**
 * Pre-deployment checklist
 * Run this before deploying to production
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Running pre-deployment checks...\n');

let errors = [];
let warnings = [];

// Check 1: Environment variables
console.log('1. Checking environment variables...');
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
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  requiredEnvVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      warnings.push(`Missing environment variable: ${varName}`);
    }
  });
  console.log('✅ .env.local file found');
} else {
  errors.push('.env.local file not found');
}

// Check 2: Build
console.log('\n2. Checking build...');
try {
  const packageJson = require('../package.json');
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ Build script found');
  } else {
    errors.push('Build script not found in package.json');
  }
} catch (error) {
  errors.push('Failed to read package.json');
}

// Check 3: TypeScript errors
console.log('\n3. Checking TypeScript configuration...');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('✅ tsconfig.json found');
} else {
  errors.push('tsconfig.json not found');
}

// Check 4: Critical files
console.log('\n4. Checking critical files...');
const criticalFiles = [
  'src/app/layout.tsx',
  'src/app/page.tsx',
  'src/lib/supabase/client.ts',
  'src/lib/stripe/config.ts',
  'public/manifest.json',
  'next.config.js'
];

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    errors.push(`Missing critical file: ${file}`);
  }
});

// Check 5: Security
console.log('\n5. Checking security...');
const checkForSecrets = (dir, files = []) => {
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      checkForSecrets(fullPath, files);
    } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Check for hardcoded secrets
      if (content.includes('sk_live_') || content.includes('sk_test_')) {
        errors.push(`Possible hardcoded Stripe key in ${fullPath}`);
      }
      if (content.includes('service_role') && content.includes('eyJ')) {
        errors.push(`Possible hardcoded service role key in ${fullPath}`);
      }
    }
  });
};

checkForSecrets(path.join(__dirname, '..', 'src'));
console.log('✅ Security check complete');

// Check 6: Database schema
console.log('\n6. Checking database requirements...');
console.log('⚠️  Manual check required: Ensure all Supabase tables and RLS policies are set up');

// Results
console.log('\n' + '='.repeat(50));
console.log('DEPLOYMENT CHECKLIST RESULTS');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('\n✅ All checks passed! Ready for deployment.');
} else {
  if (errors.length > 0) {
    console.log('\n❌ ERRORS (must fix before deployment):');
    errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS (should review):');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('\n❌ Deployment not recommended until issues are resolved.');
  process.exit(1);
}

console.log('\n📋 Manual checks required:');
console.log('   - Verify Stripe products and prices are created');
console.log('   - Ensure Supabase authentication is configured');
console.log('   - Check that all API endpoints are working');
console.log('   - Test payment flow in Stripe test mode');
console.log('   - Verify email sending configuration');
console.log('   - Review and update CORS settings if needed');

console.log('\n🎯 Next steps:');
console.log('   1. Fix any errors listed above');
console.log('   2. Run: npm run build');
console.log('   3. Test locally: npm run start');
console.log('   4. Deploy to Vercel');
console.log('   5. Configure custom domain');
console.log('   6. Set up monitoring and analytics');

process.exit(errors.length > 0 ? 1 : 0);
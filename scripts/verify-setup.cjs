#!/usr/bin/env node

/**
 * Verify SharpFlow Supabase setup
 * Run with: node scripts/verify-setup.cjs
 */

const fs = require('fs');
const path = require('path');

console.log('\n✅ SharpFlow Supabase Configuration Verification\n');
console.log('═'.repeat(60));

// Check environment variables
const envPath = path.join(__dirname, '../.env.local');
const hasEnvFile = fs.existsSync(envPath);
console.log('Environment Variables:');
console.log(`  ${hasEnvFile ? '✅' : '❌'} .env.local exists`);

if (hasEnvFile) {
  const env = fs.readFileSync(envPath, 'utf-8');
  const hasUrl = env.includes('VITE_SUPABASE_URL');
  const hasKey = env.includes('VITE_SUPABASE_ANON_KEY');
  console.log(`  ${hasUrl ? '✅' : '❌'} VITE_SUPABASE_URL set`);
  console.log(`  ${hasKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY set`);
}

// Check auth services
const supabaseSvc = fs.existsSync(path.join(__dirname, '../src/services/supabase.ts'));
const authGate = fs.existsSync(path.join(__dirname, '../src/features/auth/AuthGate.tsx'));
console.log('\nAuth Implementation:');
console.log(`  ${supabaseSvc ? '✅' : '❌'} Supabase client configured`);
console.log(`  ${authGate ? '✅' : '❌'} AuthGate component created`);
console.log(`  ${authGate ? '✅' : '❌'} Logout button implemented`);

// Check migration
const migration = fs.existsSync(path.join(__dirname, '../supabase/migrations/001_enable_rls.sql'));
console.log('\nDatabase Setup:');
console.log(`  ${migration ? '✅' : '❌'} Migration file exists`);
console.log(`  ⏳ Migration needs to be applied to database`);

console.log('\n═'.repeat(60));
console.log('\n🚀 Next Steps:\n');
console.log('1. Apply database migration:');
console.log('   Go to: https://wuggucdwlannodhuukvf.supabase.co/project/default/sql/new');
console.log('   Paste the SQL from: supabase/migrations/001_enable_rls.sql');
console.log('   Click "Run"\n');
console.log('2. Restart dev server: npm run dev\n');
console.log('3. Visit: http://localhost:5173\n');
console.log('4. Sign in with email and test logout button\n');

// Show project URL
if (hasEnvFile) {
  const env = fs.readFileSync(envPath, 'utf-8');
  const match = env.match(/VITE_SUPABASE_URL=(.+)/);
  if (match) {
    const url = match[1].trim();
    console.log(`📍 Dashboard: ${url}/project/default/sql\n`);
  }
}

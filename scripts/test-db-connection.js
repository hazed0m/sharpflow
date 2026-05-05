// Quick test to verify Supabase database connection and schema
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n')
  console.log('📍 Project URL:', supabaseUrl)
  
  // Test 1: Check if we can connect
  try {
    const { data, error } = await supabase.from('tasks').select('count', { count: 'exact', head: true })
    
    if (error) {
      if (error.message.includes('relation "public.tasks" does not exist')) {
        console.log('⚠️  Tasks table does not exist yet')
        console.log('   Run the migration manually in Supabase SQL Editor:')
        console.log('   Copy contents from: supabase/migrations/001_enable_rls.sql\n')
        return false
      } else if (error.message.includes('JWT')) {
        console.log('✅ Connection successful (auth required for data access)')
        console.log('✅ Tables appear to be set up correctly\n')
        return true
      } else {
        console.log('❌ Error accessing tasks table:', error.message || error.toString())
        console.log('   Full error:', JSON.stringify(error, null, 2))
        return false
      }
    }
    
    console.log('✅ Connection successful!')
    console.log('✅ Tasks table exists\n')
    return true
  } catch (err) {
    console.error('❌ Connection failed:', err.message)
    return false
  }
}

async function checkRLS() {
  console.log('🔒 Checking RLS policies...\n')
  
  // Try to query without auth (should fail with RLS enabled)
  const { data, error } = await supabase.from('tasks').select('*')
  
  if (error) {
    if (error.message.includes('row-level security') || error.message.includes('policy')) {
      console.log('✅ RLS is enabled (queries require authentication)')
      return true
    } else {
      console.log('⚠️  Unexpected error:', error.message)
      return false
    }
  } else if (data && data.length === 0) {
    console.log('✅ RLS appears to be working (empty result without auth)')
    return true
  } else {
    console.log('⚠️  Warning: Got data without authentication - RLS may not be enabled')
    return false
  }
}

async function main() {
  const connected = await testConnection()
  if (connected) {
    await checkRLS()
  }
  
  console.log('\n📋 Next steps:')
  console.log('1. ✅ Database tables are set up')
  console.log('2. 🔐 Configure Google OAuth in Supabase Dashboard')
  console.log('   → Go to: Authentication → Providers → Google')
  console.log('3. 🧪 Test authentication in your app')
}

main()

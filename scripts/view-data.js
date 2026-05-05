#!/usr/bin/env node
/**
 * View SharpFlow Data from Supabase
 * 
 * This script connects to your Supabase database and displays:
 * - All users with their tasks and memories
 * - Raw data for each table
 * 
 * Usage: node scripts/view-data.js
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load environment variables (adjust path if needed)
const envPath = process.env.NODE_ENV === 'production'
  ? '.env.production'
  : '.env.local' || '.env'

if (!fs.existsSync(envPath)) {
  console.error(`❌ Environment file not found: ${envPath}`)
  console.error('Please create .env.local with:')
  console.error('  VITE_SUPABASE_URL=your-project-url')
  console.error('  VITE_SUPABASE_ANON_KEY=your-anon-key')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf8').trim()
const supabaseUrlMatch = envContent.split('\n').find(line => line.includes('VITE_SUPABASE_URL='))
const supabaseAnonKeyMatch = envContent.split('\n').find(line => line.includes('VITE_SUPABASE_ANON_KEY='))

const supabaseUrl = supabaseUrlMatch?.split('=')[1]?.trim()?.replace(/['"]/g, '') || ''
const supabaseAnonKey = supabaseAnonKeyMatch?.split('=')[1]?.trim()?.replace(/['"]/g, '') || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
  console.log('\n📊 SharpFlow Data Viewer\n')
  console.log('=' .repeat(60))

  // Fetch all tasks
  try {
    const { data: users, error: usersError } = await supabase
      .from('tasks')
      .select('id, user_id, title, status, timer_minutes, extensions, created_at')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('❌ Error fetching tasks:', usersError.message)
      return
    }

    // Group tasks by user_id
    const tasksByUser = {}
    users.forEach(task => {
      if (!tasksByUser[task.user_id]) {
        tasksByUser[task.user_id] = []
      }
      tasksByUser[task.user_id].push(task)
    })

    // Display summary
    console.log('\n📈 Data Summary')
    console.log('-'.repeat(60))
    console.log(`Total Tasks: ${users.length}`)
    console.log(`Unique Users: ${Object.keys(tasksByUser).length}`)

    // Count by status
    const statusCounts = { active: 0, pending: 0, completed: 0, ash: 0 }
    users.forEach(task => {
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status]++
      } else {
        statusCounts[task.status] = 1
      }
    })
    console.log('\nTasks by Status:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    // Display all tasks
    console.log('\n📋 All Tasks')
    console.log('-'.repeat(60))
    users.forEach((task, index) => {
      const userTasks = tasksByUser[task.user_id] || []
      const taskIndex = userTasks.findIndex(t => t.id === task.id)
      const isLastInUser = taskIndex === userTasks.length - 1
      
      console.log(`\n${index + 1}. ID: ${task.id.slice(0, 8)}...`)
      console.log(`   User ID: ${task.user_id}`)
      console.log(`   Title: "${task.title}"`)
      console.log(`   Status: ${task.status.toUpperCase()}`)
      console.log(`   Timer: ${task.timer_minutes} minutes`)
      console.log(`   Extensions: ${task.extensions}`)
      console.log(`   Created: ${new Date(task.created_at).toLocaleString()}`)

      if (!isLastInUser) {
        console.log('   └─ More tasks from this user...')
      }
    })

    // Fetch memories
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select('id, user_id, text, type, created_at')
      .order('created_at', { ascending: false })

    if (memoriesError) {
      console.error('\n❌ Error fetching memories:', memoriesError.message)
      return
    }

    // Group memories by user_id
    const memoriesByUser = {}
    memories.forEach(memory => {
      if (!memoriesByUser[memory.user_id]) {
        memoriesByUser[memory.user_id] = []
      }
      memoriesByUser[memory.user_id].push(memory)
    })

    // Display summary
    console.log('\n🧠 Data Summary (Memories)')
    console.log('-'.repeat(60))
    console.log(`Total Memories: ${memories.length}`)
    console.log(`Unique Users: ${Object.keys(memoriesByUser).length}`)

    // Count by type
    const typeCounts = { focus: 0, recovery: 0 }
    memories.forEach(memory => {
      if (typeCounts[memory.type] !== undefined) {
        typeCounts[memory.type]++
      } else {
        typeCounts[memory.type] = 1
      }
    })
    console.log('\nMemories by Type:')
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  ${type.toUpperCase()}: ${count}`)
    })

    // Display all memories
    console.log('\n🧠 All Memories')
    console.log('-'.repeat(60))
    memories.forEach((memory, index) => {
      const userMemories = memoriesByUser[memory.user_id] || []
      const memoryIndex = userMemories.findIndex(m => m.id === memory.id)
      const isLastInUser = memoryIndex === userMemories.length - 1

      console.log(`\n${index + 1}. ID: ${memory.id.slice(0, 8)}...`)
      console.log(`   User ID: ${memory.user_id}`)
      console.log(`   Type: ${memory.type.toUpperCase()}`)
      console.log(`   Text: "${memory.text}"`)
      console.log(`   Created: ${new Date(memory.created_at).toLocaleString()}`)

      if (!isLastInUser) {
        console.log('   └─ More memories from this user...')
      }
    })

    // Display raw JSON for copying
    console.log('\n📄 Raw Data (JSON)')
    console.log('-'.repeat(60))
    console.log('Tasks:')
    console.log(JSON.stringify(users, null, 2))
    console.log('\nMemories:')
    console.log(JSON.stringify(memories, null, 2))

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message)
    if (error.code === 'PGRST30') {
      // Row Level Security blocking access - need service role key
      console.error('\n⚠️  Row Level Security is blocking this query.')
      console.error('To view all data, use the Supabase Dashboard:')
      console.error(`https://app.supabase.com/project/${supabaseUrl.split('.')[1]}/browser`)
    } else if (error.code === '401') {
      console.error('\n⚠️  Invalid API key. Use the service role key in .env.local:')
      console.error('  VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
    }
  }

  console.log('\n' + '='.repeat(60))
}

main()
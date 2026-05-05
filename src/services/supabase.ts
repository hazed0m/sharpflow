import { createClient, type SupabaseClient, type Session, type User } from '@supabase/supabase-js'
import type { MemoryEntry, TaskItem } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
        },
      })
    : null

export async function signInWithEmail(email: string) {
  if (!supabase) return { error: new Error('Supabase is not configured') }
  return supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  })
}

export async function signInWithGoogle() {
  if (!supabase) return { error: new Error('Supabase is not configured') }
  
  // Use production redirect URI from environment for consistent OAuth flow
  const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || window.location.origin
  
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
    },
  })
}

export async function signOut() {
  if (!supabase) return { error: new Error('Supabase is not configured') }
  return supabase.auth.signOut()
}

export async function getCurrentSession() {
  if (!supabase) return { data: { session: null as Session | null }, error: null }
  return supabase.auth.getSession()
}

export async function getCurrentUserId() {
  const sessionResponse = await getCurrentSession()
  return sessionResponse.data.session?.user.id ?? null
}

export async function fetchUserTasks(userId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
}

export async function fetchUserMemories(userId: string) {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured') }
  return supabase
    .from('memories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
}

export async function upsertTask(task: TaskItem, userId: string) {
  if (!supabase) return { error: new Error('Supabase is not configured') }

  return supabase.from('tasks').upsert({
    id: task.id,
    user_id: userId,
    title: task.title,
    status: task.status,
    timer_minutes: task.timerMinutes,
    extensions: task.extensions,
    created_at: new Date(task.createdAt).toISOString(),
  })
}

export async function upsertMemory(memory: MemoryEntry, userId: string) {
  if (!supabase) return { error: new Error('Supabase is not configured') }

  return supabase.from('memories').upsert({
    id: memory.id,
    user_id: userId,
    text: memory.text,
    type: memory.type,
    created_at: new Date(memory.createdAt).toISOString(),
  })
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
  return () => data.subscription.unsubscribe()
}

export type { Session, User }

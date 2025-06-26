import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('[Supabase] Initializing with URL:', supabaseUrl, 'ANON KEY:', supabaseAnonKey?.slice(0, 8))

// Create a conditional supabase client that handles missing env vars
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabase !== null
}

// Types for our authentication
export interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
}

export interface AuthSession {
  access_token: string
  refresh_token: string
  user: AuthUser
} 
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabase: SupabaseClient | null = null

export function initSupabase(url?: string, key?: string): SupabaseClient | null {
  const supabaseUrl = url || import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return null

  supabase = createClient(supabaseUrl, supabaseKey)
  return supabase
}

export function getSupabase(): SupabaseClient | null {
  return supabase
}

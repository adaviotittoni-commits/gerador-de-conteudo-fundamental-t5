import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that will report errors gracefully
    // This allows the app to build and render without Supabase configured
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

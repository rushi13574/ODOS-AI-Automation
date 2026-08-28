import { createBrowserClient } from '@supabase/ssr';

import type { SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | undefined;

/**
 * Create a Supabase client for use in browser/client components.
 *
 * Used ONLY for authentication operations (login, signup, session management).
 * All data operations go through the API Gateway.
 */
export function createClient() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';
  
  supabase = createBrowserClient(url, key);
  return supabase;
}

import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../shared/config/env.config';

let browserClient: SupabaseClient | null = null;

/**
 * Resets the singleton Supabase Browser Client.
 * Must be invoked on logout, session expiration, or 401 token refresh failures
 * to prevent stale in-memory token state from triggering refresh loops.
 */
export function resetBrowserClientSingleton(): void {
  browserClient = null;
}

/**
 * Creates or retrieves the singleton Supabase Browser Client with full session persistence options:
 * - persistSession = true
 * - autoRefreshToken = true
 * - detectSessionInUrl = true
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      '[SUPABASE_CONFIG_ERROR] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.'
    );
  }

  browserClient = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
  return browserClient;
}

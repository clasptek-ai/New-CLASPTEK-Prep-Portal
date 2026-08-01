import { getSupabaseBrowserClient } from './supabase-browser';

/**
 * Universal Client-Side Authenticated Fetch Helper
 * Guarantees that mobile browsers (Safari / Chrome Mobile) attach the Supabase
 * Bearer access_token to all API requests, bypassing Mobile WebKit Cookie / ITP restrictions.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Authorization')) {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      } else if (typeof window !== 'undefined') {
        // Fallback: Search localStorage for Supabase access token
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('-auth-token') || key.includes('sb-'))) {
            try {
              const val = JSON.parse(localStorage.getItem(key) || '{}');
              if (val?.access_token) {
                headers.set('Authorization', `Bearer ${val.access_token}`);
                break;
              }
            } catch {
              // Ignore
            }
          }
        }
      }
    } catch {
      // Ignore session fetch error
    }
  }

  return fetch(url, { ...options, headers });
}

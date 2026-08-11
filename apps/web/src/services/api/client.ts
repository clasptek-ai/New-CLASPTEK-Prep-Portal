import { APIError, APIErrorCode } from './errors';
import { interceptors } from './interceptors';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

export interface RequestOptions extends RequestInit {
  retries?: number;
  /**
   * If true, this request will NOT be retried or trigger an auth redirect on 401/403.
   * Used internally to avoid infinite loops.
   */
  skipAuthRetry?: boolean;
}

type AuthErrorHandler = () => void;
let _authErrorHandler: AuthErrorHandler | null = null;

// In-memory token cache and in-flight promise deduplication to prevent
// multiple concurrent API requests from triggering repeated Supabase getSession network calls.
let tokenCache: { token: string | null; expiresAt: number } | null = null;
let pendingTokenPromise: Promise<string | null> | null = null;

/**
 * Reset the in-memory client session token cache.
 * Must be invoked on logout or 401/403 session expiration.
 */
export function clearClientTokenCache(): void {
  tokenCache = null;
  pendingTokenPromise = null;
}

/**
 * Safely retrieve the current browser Supabase session access token.
 * - Reuses in-flight Promise for concurrent calls.
 * - Caches token for 30s in memory.
 * - Swallows network exceptions from Supabase Auth so React never crashes.
 */
async function getBrowserSessionToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  if (pendingTokenPromise) {
    return pendingTokenPromise;
  }

  pendingTokenPromise = (async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[API_CLIENT] Supabase getSession returned error:', error.message);
        }
        tokenCache = { token: null, expiresAt: now + 5000 };
        return null;
      }

      const accessToken = data.session?.access_token || null;
      tokenCache = { token: accessToken, expiresAt: now + 30000 };
      return accessToken;
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          '[API_CLIENT] Supabase getSession network exception (swallowed safely):',
          err?.message || err
        );
      }
      tokenCache = { token: null, expiresAt: now + 5000 };
      return null;
    } finally {
      pendingTokenPromise = null;
    }
  })();

  return pendingTokenPromise;
}

/**
 * Register a global handler to be called when any API request receives a 401.
 * The handler should clear the session and redirect to /login.
 */
export function registerAuthErrorHandler(handler: AuthErrorHandler) {
  _authErrorHandler = handler;
}

export const apiClient = {
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { retries = 2, skipAuthRetry = false, ...fetchOptions } = options;

    const reqHeaders = new Headers(fetchOptions.headers || {});
    if (!reqHeaders.has('Content-Type')) {
      reqHeaders.set('Content-Type', 'application/json');
    }

    if (!reqHeaders.has('Authorization') && typeof window !== 'undefined') {
      const token = await getBrowserSessionToken();
      if (token) {
        reqHeaders.set('Authorization', `Bearer ${token}`);
      }
    }

    let config: RequestInit = {
      ...fetchOptions,
      headers: reqHeaders,
    };

    // Apply request interceptors
    for (const interceptor of interceptors.request) {
      if (interceptor.onRequest) {
        config = await interceptor.onRequest(config);
      }
    }

    const targetUrl =
      typeof window === 'undefined' && path.startsWith('/')
        ? `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${path}`
        : path;

    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await fetch(targetUrl, config);

        // Apply response interceptors
        let interceptedResponse = response;
        for (const interceptor of interceptors.response) {
          if (interceptor.onResponse) {
            interceptedResponse = await interceptor.onResponse(interceptedResponse);
          }
        }

        if (!interceptedResponse.ok) {
          let errorData = null;
          try {
            errorData = await interceptedResponse.json();
          } catch {
            // No json body
          }

          // On 401 Unauthorized or 403 Forbidden — do NOT retry. Clear token cache and redirect to login.
          if (interceptedResponse.status === 401 || interceptedResponse.status === 403) {
            clearClientTokenCache();
            const errorCode: APIErrorCode =
              interceptedResponse.status === 401 ? 'AUTH_REQUIRED' : 'FORBIDDEN';

            const authError = new APIError(
              interceptedResponse.status,
              errorData?.error ||
                errorData?.message ||
                `HTTP ${interceptedResponse.status}: Authentication required`,
              errorData,
              errorCode
            );

            // Trigger global auth error handler exactly once (no retry loop)
            if (!skipAuthRetry && _authErrorHandler) {
              _authErrorHandler();
            }

            throw authError;
          }

          throw new APIError(
            interceptedResponse.status,
            errorData?.message || `HTTP error! status: ${interceptedResponse.status}`,
            errorData
          );
        }

        return (await interceptedResponse.json()) as T;
      } catch (error: any) {
        // Never retry on auth errors — throw immediately
        if (error instanceof APIError && (error.status === 401 || error.status === 403)) {
          throw error;
        }

        // Ensure that thrown objects are normalized into valid APIError instances
        const normalizedError =
          error instanceof APIError
            ? error
            : new APIError(
                0,
                error instanceof Error
                  ? error.message
                  : error && typeof error === 'object' && 'message' in error
                    ? String(error.message)
                    : typeof error === 'string'
                      ? error
                      : 'Network request failed',
                undefined,
                'NETWORK_ERROR'
              );

        if (attempt >= retries) {
          throw normalizedError;
        }
        attempt++;
        // Exponential backoff delay (not applied for auth errors)
        await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 100));
      }
    }

    throw new APIError(0, 'API Client request failed', undefined, 'NETWORK_ERROR');
  },

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  post<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  },
};
